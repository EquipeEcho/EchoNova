// app/src/app/api/diagnostico-ia/route.ts

import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose"; // --- NOVO IMPORTE ---
import { connectDB } from "@/lib/mongodb";
import { getChatProvider } from "@/lib/ai/providerFactory";
import { promptDiagnosticoAprofundado } from "@/lib/prompts";
import AiSession from "@/models/AiSession";
import DiagnosticoAprofundado from "@/models/DiagnosticoAprofundado";
import type { HistoryMessage, IaResponse } from "@/lib/ai/ChatProvider";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

function getTextForHistory(iaResponse: IaResponse): string {
  if (iaResponse.status === "finalizado" && iaResponse.relatorio_final) {
    return iaResponse.relatorio_final;
  }
  if (iaResponse.status === "confirmacao" && iaResponse.resumo_etapa) {
    return iaResponse.resumo_etapa;
  }
  if (iaResponse.proxima_pergunta?.texto) {
    return iaResponse.proxima_pergunta.texto;
  }
  return "Ok, entendi. Podemos continuar.";
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

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
    await connectDB();
    const { sessionId, resposta_usuario } = await req.json();
    const provider = getChatProvider();

    let session;
    let historico: HistoryMessage[];

    if (!sessionId) {
      console.log(`MCP: Iniciando nova sessão para a empresa ${empresaId}`);
      session = new AiSession({
        empresaId: empresaId,
        conversationHistory: [],
      });
      historico = [];
    } else {
      session = await AiSession.findById(sessionId);
      if (!session || session.empresaId.toString() !== empresaId) {
        return NextResponse.json({ error: "Sessão inválida ou não pertence a este usuário." }, { status: 400 });
      }
      historico = session.conversationHistory;
      console.log(`MCP: Continuando sessão ${sessionId} para a empresa ${empresaId}`);
    }

    const iaResponse = await provider.sendMessage(resposta_usuario, historico, promptDiagnosticoAprofundado);
    const iaTextForHistory = getTextForHistory(iaResponse);

    session.conversationHistory.push(
      { role: 'user', parts: [{ text: resposta_usuario }] },
      { role: 'model', parts: [{ text: iaTextForHistory }] }
    );
    await session.save();
    
    // --- CORREÇÃO (Fluxo Pós-Diagnóstico) ---
    // Variável para armazenar o ID do novo diagnóstico
    let finalDiagnosticId: string | null = null;

    if (iaResponse.status === "finalizado") {
      console.log(`MCP: Finalizando e salvando diagnóstico da sessão: ${session._id}`);
      
      const novoDiagnostico = new DiagnosticoAprofundado({
        // --- CORREÇÃO (Causa Raiz do Erro 404) ---
        // Convertemos explicitamente a string do ID para um ObjectId do Mongoose.
        // Isso garante que a referência seja salva corretamente no banco.
        empresa: new mongoose.Types.ObjectId(empresaId),
        sessionId: session._id.toString(),
        conversationHistory: session.conversationHistory,
        structuredData: iaResponse.dados_coletados,
        finalReport: iaResponse.relatorio_final,
      });
      await novoDiagnostico.save();
      
      // Armazenamos o ID para retornar ao frontend
      finalDiagnosticId = novoDiagnostico._id.toString();

      await AiSession.findByIdAndDelete(session._id);
      console.log(`MCP: Sessão temporária ${session._id} removida.`);
    }

    // --- MELHORIA (Redirecionamento Pós-Diagnóstico) ---
    // Adicionamos o `finalDiagnosticId` à resposta.
    // O frontend usará isso para redirecionar o usuário para a página de resultados.
    return NextResponse.json({ 
      sessionId: session._id.toString(), 
      finalDiagnosticId, // Retorna o ID aqui
      ...iaResponse 
    });

  } catch (error: unknown) {
    console.error("Erro no MCP (/api/diagnostico-ia):", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return NextResponse.json({ error: "Falha ao processar a requisição.", details: errorMessage }, { status: 500 });
  }
}