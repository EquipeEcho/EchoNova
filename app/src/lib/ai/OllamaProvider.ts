import type { ChatProvider, IaResponse, HistoryMessage } from "./ChatProvider";

const baseUrl = process.env.OLLAMA_BASE_URL;
const modelName = process.env.OLLAMA_MODEL_NAME;

if (!baseUrl || !modelName) {
  throw new Error("As variáveis de ambiente OLLAMA_BASE_URL e OLLAMA_MODEL_NAME são necessárias.");
}

export class OllamaProvider implements ChatProvider {
  async sendMessage(
    message: string,
    history: HistoryMessage[],
    initialPrompt: string
  ): Promise<IaResponse> {
    // Converte nosso formato de histórico para o formato do Ollama
    const messages = [
      { role: "system", content: initialPrompt },
      ...history.map(msg => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: msg.parts[0].text,
      })),
      { role: "user", content: message },
    ];
    
    const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: modelName,
            messages: messages,
            format: 'json',
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error(`Erro na comunicação com o Ollama: ${response.statusText}`);
    }

    const responseData = await response.json();
    const responseText = responseData.message.content;

    if (!responseText) {
        throw new Error("Ollama retornou uma resposta vazia.");
    }

    return JSON.parse(responseText) as IaResponse;
  }
}