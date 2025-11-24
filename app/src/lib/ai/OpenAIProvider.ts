import type { ChatProvider, IaResponse, HistoryMessage } from "./ChatProvider";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    throw new Error("A variável de ambiente OPENAI_API_KEY não está definida.");
}

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export class OpenAIProvider implements ChatProvider {
    async sendMessage(
        message: string,
        history: HistoryMessage[],
        initialPrompt: string
    ): Promise<IaResponse> {
        // Converte nosso formato de histórico para o formato do OpenAI
        const messages = [
            { role: "system", content: initialPrompt },
            ...history.map(msg => ({
                role: msg.role === "model" ? "assistant" : "user",
                content: msg.parts[0].text,
            })),
            { role: "user", content: message },
        ];

        const response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: messages,
                response_format: { type: "json_object" },
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Erro na comunicação com a OpenAI: ${response.statusText} - ${JSON.stringify(errorData)}`
            );
        }

        const responseData = await response.json();
        const responseText = responseData.choices[0]?.message?.content;
        
        console.log('Resposta bruta do OpenAI:', responseText);

        if (!responseText) {
            throw new Error("OpenAI retornou uma resposta vazia.");
        }

        return JSON.parse(responseText) as IaResponse;
    }
}
