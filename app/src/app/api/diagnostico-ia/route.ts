// app/src/app/api/diagnostico-ia/route.ts

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import { getChatProvider } from "@/lib/ai/providerFactory";
import { promptDiagnosticoAprofundado } from "@/lib/prompts";
import AiSession from "@/models/AiSession";
import DiagnosticoAprofundado from "@/models/DiagnosticoAprofundado";
import type { HistoryMessage, IaResponse } from "@/lib/ai/ChatProvider";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// --- FUNÇÃO AUXILIAR ADICIONADA ---
// Esta função extrai o texto correto da resposta da IA para ser salvo no histórico.
// Isso mantém o histórico da conversa limpo e legível para a IA nas próximas interações.
function getTextForHistory(iaResponse: IaResponse): string {
  if (iaResponse.status === "finalizado" && iaResponse.relatorio_final) {
    return iaResponse.relatorio_final;
  }
  if ((iaResponse.status === "confirmacao" || iaResponse.status === "confirmação") && iaResponse.resumo_etapa) {
    return iaResponse.resumo_etapa;
  }
  if (iaResponse.proxima_pergunta?.texto) {
    return iaResponse.proxima_pergunta.texto;
  }
  // Fallback caso algo inesperado ocorra
  return "Ok, entendi. Podemos continuar.";
}

export async function POST(req: Request) {
  try {
    // --- 1. AUTENTICAÇÃO E AUTORIZAÇÃO ---
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado: token não encontrado." }, { status: 401 });
    }

    let payload: any;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, secret);
      payload = verifiedPayload;
    } catch (err) {
      return NextResponse.json({ error: "Não autorizado: token inválido." }, { status: 401 });
    }

    const empresaId = payload.id;

    // --- 2. LÓGICA DO DIAGNÓSTICO ---
    await connectDB();
    const { sessionId, resposta_usuario } = await req.json();
    const provider = getChatProvider();

    let session;
    let historico: HistoryMessage[];

    if (!sessionId) {
      // --- INICIANDO NOVA SESSÃO ---
      console.log(`MCP: Iniciando nova sessão para a empresa ${empresaId}`);
      session = new AiSession({
        empresaId: empresaId,
        conversationHistory: [],
      });
      historico = [];
    } else {
      // --- CONTINUANDO SESSÃO EXISTENTE ---
      session = await AiSession.findById(sessionId);
      if (!session || session.empresaId.toString() !== empresaId) {
        return NextResponse.json({ error: "Sessão inválida ou não pertence a este usuário." }, { status: 400 });
      }
      historico = session.conversationHistory;
      console.log(`MCP: Continuando sessão ${sessionId} para a empresa ${empresaId}`);
    }

    // Envia a mensagem para o provedor de IA
    const iaResponse = await provider.sendMessage(resposta_usuario, historico, promptDiagnosticoAprofundado);

    // --- CORREÇÃO APLICADA AQUI ---
    // Em vez de salvar o JSON inteiro no histórico, salvamos apenas o texto da conversa.
    // Isso evita que a IA se confunda nas próximas chamadas.
    const iaTextForHistory = getTextForHistory(iaResponse);

    // Atualiza o histórico na nossa variável de sessão com o texto limpo.
    session.conversationHistory.push(
      { role: 'user', parts: [{ text: resposta_usuario }] },
      { role: 'model', parts: [{ text: iaTextForHistory }] }
    );

    // Salva a sessão atualizada no MongoDB
    await session.save();

    // Se a IA finalizou o diagnóstico
    if (iaResponse.status === "finalizado") {
      console.log(`MCP: Finalizando e salvando diagnóstico da sessão: ${session._id}`);
      
      const novoDiagnostico = new DiagnosticoAprofundado({
        empresa: empresaId,
        sessionId: session._id.toString(),
        conversationHistory: session.conversationHistory,
        structuredData: iaResponse.dados_coletados,
        finalReport: iaResponse.relatorio_final,
      });
      await novoDiagnostico.save();

      await AiSession.findByIdAndDelete(session._id);
      console.log(`MCP: Sessão temporária ${session._id} removida.`);
    }

    // Retorna o ID da sessão e a resposta completa da IA para o frontend
    return NextResponse.json({ sessionId: session._id.toString(), ...iaResponse });

  } catch (error: unknown) {
    console.error("Erro no MCP (/api/diagnostico-ia):", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return NextResponse.json({ error: "Falha ao processar a requisição.", details: errorMessage }, { status: 500 });
  }
}