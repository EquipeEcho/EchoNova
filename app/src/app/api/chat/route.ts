// app/api/chat/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // 1. Extrai o prompt do corpo da requisição
    const { prompt } = await req.json();

    // Validação básica para garantir que o prompt não está vazio
    if (!prompt) {
        return NextResponse.json(
            { error: "O prompt é obrigatório." },
            { status: 400 }
        );
    }

    // 2. Inicializa o cliente do Google GenAI
    // A chave é lida automaticamente das variáveis de ambiente pelo Next.js
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        // 3. Chama a API para gerar o conteúdo
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Retorna a resposta de sucesso para o cliente
        return NextResponse.json({ text });

    } catch (error) {
        console.error("Erro ao chamar a API do Google GenAI:", error);

        // 5. Retorna uma resposta de ERRO para o cliente
        return NextResponse.json(
            { error: "Falha ao se comunicar com a IA. Verifique o console do servidor para mais detalhes." },
            { status: 500 }
        );
    }
}