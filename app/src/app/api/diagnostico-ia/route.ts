// app/src/app/api/diagnostico-ia/route.ts

import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Função para verificar o token
import { connectDB } from "@/lib/mongodb";
import { getChatProvider } from "@/lib/ai/providerFactory";
import { promptDiagnosticoAprofundado } from "@/lib/prompts";
import AiSession from "@/models/AiSession"; // Nosso novo modelo para sessões
import DiagnosticoAprofundado from "@/models/DiagnosticoAprofundado";
import type { HistoryMessage } from "@/lib/ai/ChatProvider";

// Pega a chave secreta novamente para verificação do token
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  try {
    // --- 1. AUTENTICAÇÃO E AUTORIZAÇÃO ---
    // Pega o token do cookie da requisição
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

    // O ID da empresa agora vem de uma fonte segura (o token), não do corpo da requisição.
    const empresaId = payload.id;

    // --- 2. LÓGICA DO DIAGNÓSTICO ---
    await connectDB();
    const { sessionId, resposta_usuario } = await req.json();
    const provider = getChatProvider();

    let session;
    let historico: HistoryMessage[];

    if (!sessionId) {
      // --- INICIANDO NOVA SESSÃO NO BANCO DE DADOS ---
      console.log(`MCP: Iniciando nova sessão para a empresa ${empresaId}`);
      
      session = new AiSession({
        empresaId: empresaId,
        conversationHistory: [],
      });
      historico = [];

    } else {
      // --- CONTINUANDO SESSÃO EXISTENTE DO BANCO DE DADOS ---
      session = await AiSession.findById(sessionId);
      if (!session || session.empresaId.toString() !== empresaId) {
        return NextResponse.json({ error: "Sessão inválida ou não pertence a este usuário." }, { status: 400 });
      }
      historico = session.conversationHistory;
      console.log(`MCP: Continuando sessão ${sessionId} para a empresa ${empresaId}`);
    }

    // Envia a mensagem para o provedor de IA
    const iaResponse = await provider.sendMessage(resposta_usuario, historico, promptDiagnosticoAprofundado);

    // Atualiza o histórico na nossa variável de sessão
    session.conversationHistory.push(
      { role: 'user', parts: [{ text: resposta_usuario }] },
      { role: 'model', parts: [{ text: JSON.stringify(iaResponse) }] }
    );

    // Salva a sessão atualizada no MongoDB
    await session.save();

    // Se a IA finalizou o diagnóstico
    if (iaResponse.status === "finalizado") {
      console.log(`MCP: Finalizando e salvando diagnóstico da sessão: ${session._id}`);
      
      // Cria o registro permanente do diagnóstico
      const novoDiagnostico = new DiagnosticoAprofundado({
        empresa: empresaId,
        sessionId: session._id.toString(),
        conversationHistory: session.conversationHistory,
        structuredData: iaResponse.dados_coletados,
        finalReport: iaResponse.relatorio_final,
      });
      await novoDiagnostico.save();

      // IMPORTANTE: Deleta a sessão temporária para manter o banco limpo
      await AiSession.findByIdAndDelete(session._id);
      console.log(`MCP: Sessão temporária ${session._id} removida.`);
    }

    // Retorna o ID da sessão (que é o _id do documento no MongoDB)
    return NextResponse.json({ sessionId: session._id.toString(), ...iaResponse });

  } catch (error: unknown) {
    console.error("Erro no MCP (/api/diagnostico-ia):", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return NextResponse.json({ error: "Falha ao processar a requisição.", details: errorMessage }, { status: 500 });
  }
}