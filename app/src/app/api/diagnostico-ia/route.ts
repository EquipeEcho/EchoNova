// app/api/diagnostico-ia/route.ts

import { NextResponse } from "next/server";
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { promptDiagnosticoAprofundado } from "@/lib/prompts";
import { connectDB } from "@/lib/mongodb";
import DiagnosticoAprofundado from "@/models/DiagnosticoAprofundado";

// --- NOVAS INTERFACES PARA O CONTRATO DE DADOS ---

/**
 * @description Define a estrutura do objeto de pergunta que a IA nos envia.
 * @property {string} texto - O texto da pergunta a ser exibido ao usuário.
 * @property {'texto' | 'numero' | 'multipla_escolha' | 'selecao' | 'sim_nao'} tipo_resposta - O tipo de input que a interface deve renderizar.
 * @property {string[] | null} opcoes - Um array de opções, usado para 'multipla_escolha' e 'selecao'.
 */
interface Pergunta {
    texto: string;
    tipo_resposta: 'texto' | 'numero' | 'multipla_escolha' | 'selecao' | 'sim_nao';
    opcoes: string[] | null;
}

/**
 * @description Define a estrutura completa da resposta JSON que esperamos da IA.
 */
interface IaResponse {
    status: "iniciado" | "em_andamento" | "confirmacao" | "finalizado";
    proxima_pergunta: Pergunta | null;
    resumo_etapa: string | null;
    dados_coletados: object;
    relatorio_final: string | null;
}

// ATENÇÃO: Armazenamento de sessão em memória.
// Ideal para desenvolvimento, mas para produção, considere Redis ou um banco de dados.
const sessoesAtivas: Record<string, ChatSession> = {};

// Inicializa o cliente da IA Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
    /**
     * @description Esta função atua como o MCP (Orquestrador), gerenciando o fluxo da conversa.
     * @param {Request} req - A requisição HTTP vinda da interface do usuário.
     * @returns {NextResponse} Uma resposta JSON para a interface, contendo o estado atual da conversa.
     */
    try {
        const { sessionId, resposta_usuario, empresaId } = await req.json();

        let sessao: ChatSession;
        let idSessaoAtual = sessionId;

        if (!idSessaoAtual) {
            console.log("MCP: Iniciando nova sessão de diagnóstico...");
            idSessaoAtual = `sessao_${Date.now()}`;

            sessao = model.startChat({
                history: [{ role: "user", parts: [{ text: promptDiagnosticoAprofundado }] }],
                generationConfig: { responseMimeType: "application/json" },
            });

            sessoesAtivas[idSessaoAtual] = sessao;

            const result = await sessao.sendMessage("Começar");
            const iaResponse: IaResponse = JSON.parse(result.response.text());

            return NextResponse.json({ sessionId: idSessaoAtual, ...iaResponse });
        }

        sessao = sessoesAtivas[idSessaoAtual];
        if (!sessao) {
            return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 400 });
        }

        console.log(`MCP: Continuando sessão ${idSessaoAtual} com resposta do usuário.`);
        const result = await sessao.sendMessage(resposta_usuario);
        const iaResponse: IaResponse = JSON.parse(result.response.text());

        if (iaResponse.status === 'finalizado') {
            console.log(`MCP: Finalizando e salvando diagnóstico da sessão: ${idSessaoAtual}`);

            await connectDB();

            const novoDiagnostico = new DiagnosticoAprofundado({
                empresa: empresaId,
                sessionId: idSessaoAtual,
                conversationHistory: await sessao.getHistory(),
                structuredData: iaResponse.dados_coletados,
                finalReport: iaResponse.relatorio_final,
            });
            await novoDiagnostico.save();

            delete sessoesAtivas[idSessaoAtual];
            console.log("MCP: Diagnóstico salvo com sucesso no banco de dados.");
        }

        return NextResponse.json({ sessionId: idSessaoAtual, ...iaResponse });

    } catch (error: any) {
        console.error("Erro no MCP (/api/diagnostico-ia):", error);
        return NextResponse.json({ error: "Ocorreu um erro ao processar a requisição.", details: error.message }, { status: 500 });
    }
}