import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import DiagnosticoAprofundado from "@/models/DiagnosticoAprofundado";
import Empresa from "@/models/Empresa";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * @description Rota para criar um diagnóstico aprofundado de teste com dados predefinidos.
 * Usada pelo modo teste para gerar resultados instantâneos.
 */
export async function POST(req: Request) {
  try {
    // --- 1. Autenticação ---
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, secret);
    const empresaId = payload.id as string;

    // --- 2. Conectar ao banco ---
    await connectDB();

    // --- 3. Buscar empresa ---
    const empresa = await Empresa.findById(empresaId);
    if (!empresa) {
      return NextResponse.json({ error: "Empresa não encontrada." }, { status: 404 });
    }

    // --- 4. Ler dados da requisição ---
    const { modoTeste, structuredData, finalReport, empresaNome } = await req.json();

    if (!modoTeste || !structuredData || !finalReport) {
      return NextResponse.json({ error: "Dados incompletos para diagnóstico de teste." }, { status: 400 });
    }

    // --- 5. Criar diagnóstico de teste ---
    const sessionId = `teste_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const diagnostico = new DiagnosticoAprofundado({
      empresa: empresaId,
      sessionId,
      conversationHistory: [
        {
          role: "system",
          content: "Modo teste: Dados predefinidos gerados automaticamente",
          timestamp: new Date()
        }
      ],
      structuredData,
      finalReport
    });

    const savedDiagnostico = await diagnostico.save();

    return NextResponse.json({
      success: true,
      diagnosticoId: savedDiagnostico._id,
      message: "Diagnóstico de teste criado com sucesso."
    });

  } catch (error: unknown) {
    console.error("Erro ao criar diagnóstico de teste:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({
      error: "Falha ao criar diagnóstico de teste.",
      details: errorMessage
    }, { status: 500 });
  }
}