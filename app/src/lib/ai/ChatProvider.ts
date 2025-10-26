// src/lib/ai/ChatProvider.ts

// Define a estrutura da resposta que nossa aplicação espera, não importa qual IA a gerou.
export interface IaResponse {
  status: "iniciado" | "em_andamento" | "confirmacao" | "finalizado";
  proxima_pergunta: {
    texto: string;
    tipo_resposta: "texto" | "numero" | "multipla_escolha" | "selecao" | "sim_nao";
    opcoes: string[] | null;
    placeholder?: string | null;
  } | null;
  resumo_etapa: string | null;
  dados_coletados: object;
  relatorio_final: string | null;
  // CAMPO ADICIONADO: Informações de progresso para a UI
  progress?: {
    currentStep: number;
    totalSteps: number;
    stepTitle?: string; // Título opcional para a etapa atual
  };
}

// Define a estrutura de uma mensagem no histórico, agnóstica de provedor.
export interface HistoryMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

// O "Contrato" que todo provedor de IA (Gemini, Ollama, etc.) deve seguir.
export interface ChatProvider {
  sendMessage(
    message: string,
    history: HistoryMessage[],
    initialPrompt: string
  ): Promise<IaResponse>;
}