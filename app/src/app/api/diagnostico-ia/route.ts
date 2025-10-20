// app/api/diagnostico-ia/route.ts
import { NextResponse } from "next/server";
import { promptDiagnosticoAprofundado } from "@/lib/prompts";
import { connectDB } from "@/lib/mongodb";
import DiagnosticoAprofundado from "@/models/DiagnosticoAprofundado";

// --- Nossas importações ABSTRATAS e centralizadas ---
import { getChatProvider } from "@/lib/ai/providerFactory";
import type { HistoryMessage, IaResponse } from "@/lib/ai/ChatProvider";

// --- Gerenciamento de sessão AGnóstico ---
// Armazena apenas o histórico genérico, não mais um objeto específico do Gemini.
const sessoesAtivas: Record<string, HistoryMessage[]> = {};

export async function POST(req: Request) {
  try {
    const { sessionId, resposta_usuario, empresaId } = await req.json();
    const provider = getChatProvider(); // Pega o provedor configurado (Gemini, Ollama, etc.)

    let idSessaoAtual = sessionId;

    if (!idSessaoAtual) {
      // --- INICIANDO NOVA SESSÃO ---
      console.log("MCP: Iniciando nova sessão de diagnóstico...");
      idSessaoAtual = `sessao_${Date.now()}`;
      sessoesAtivas[idSessaoAtual] = []; // Histórico vazio

      const iaResponse = await provider.sendMessage("Começar", [], promptDiagnosticoAprofundado);

      // Salva a primeira interação no histórico da sessão
      sessoesAtivas[idSessaoAtual].push(
        { role: "user", parts: [{ text: "Começar" }] },
        { role: "model", parts: [{ text: JSON.stringify(iaResponse) }] }
      );
      
      return NextResponse.json({ sessionId: idSessaoAtual, ...iaResponse });
    }

    // --- CONTINUANDO SESSÃO EXISTENTE ---
    const historico = sessoesAtivas[idSessaoAtual];
    if (!historico) {
      return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 400 });
    }

    console.log(`MCP: Continuando sessão ${idSessaoAtual} com resposta do usuário.`);
    const iaResponse = await provider.sendMessage(resposta_usuario, historico, promptDiagnosticoAprofundado);
    
    // Atualiza o histórico com a última interação
    historico.push(
      { role: 'user', parts: [{ text: resposta_usuario }] },
      { role: 'model', parts: [{ text: JSON.stringify(iaResponse) }] }
    );

    if (iaResponse.status === "finalizado") {
      console.log(`MCP: Finalizando e salvando diagnóstico da sessão: ${idSessaoAtual}`);
      await connectDB();
      
      const novoDiagnostico = new DiagnosticoAprofundado({
        empresa: empresaId,
        sessionId: idSessaoAtual,
        conversationHistory: historico,
        structuredData: iaResponse.dados_coletados,
        finalReport: iaResponse.relatorio_final,
      });
      await novoDiagnostico.save();
      delete sessoesAtivas[idSessaoAtual];
    }

    return NextResponse.json({ sessionId: idSessaoAtual, ...iaResponse });
  } catch (error: unknown) {
    console.error("Erro no MCP (/api/diagnostico-ia):", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return NextResponse.json({ error: "Falha ao processar a requisição.", details: errorMessage }, { status: 500 });
  }
}