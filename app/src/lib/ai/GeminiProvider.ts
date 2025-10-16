import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatProvider, IaResponse, HistoryMessage } from "./ChatProvider";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("A variável de ambiente GOOGLE_GEMINI_API_KEY não está definida.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export class GeminiProvider implements ChatProvider {
    async sendMessage(
        message: string,
        history: HistoryMessage[],
        initialPrompt: string
    ): Promise<IaResponse> {
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: initialPrompt }] },
                { role: "model", parts: [{ text: "Ok, entendi as regras. Pode começar." }] },
                ...history,
            ],
            generationConfig: { responseMimeType: "application/json" },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();
        console.log('Resposta bruta do Gemini:', responseText);

        return JSON.parse(responseText) as IaResponse;
    }
}
