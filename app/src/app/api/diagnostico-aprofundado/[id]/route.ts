// src/app/api/diagnostico-aprofundado/[id]/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import DiagnosticoAprofundado from "@/models/DiagnosticoAprofundado";
import { NextRequest } from "next/server";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * @description Rota para buscar um diagnóstico aprofundado específico pelo seu ID,
 * garantindo que ele pertença ao usuário autenticado.
 * Usada pela página de visualização de resultados.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // --- 1. Autenticação ---
    // --- CORREÇÃO APLICADA AQUI ---
    const cookieStore = await cookies(); // O 'await' é necessário aqui.
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, secret);
    const empresaId = payload.id as string;

    // --- 2. Lógica de Busca ---
    await connectDB();
    const { id } = await context.params;

    const diagnostico = await DiagnosticoAprofundado.findById(id);

    if (!diagnostico) {
      return NextResponse.json({ error: "Diagnóstico não encontrado." }, { status: 404 });
    }

    // --- 3. Autorização ---
    if (diagnostico.empresa.toString() !== empresaId) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    return NextResponse.json(diagnostico);

  } catch (error: unknown) {
    console.error("Erro ao buscar diagnóstico por ID:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ error: "Falha na requisição.", details: errorMessage }, { status: 500 });
  }
}