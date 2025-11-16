import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import DiagnosticoAprofundado from "@/models/DiagnosticoAprofundado";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * @description Rota para buscar o diagnóstico aprofundado mais recente de um usuário autenticado.
 * É usada na página /pos-login para o botão "Último Diagnóstico Realizado".
 */
export async function GET() {
  try {
    // --- 1. Autenticação via JWT Cookie ---
    // --- CORREÇÃO APLICADA ---
    // A função `cookies()` é assíncrona e deve ser aguardada com `await`.
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Não autorizado: token não encontrado." }, { status: 401 });
    }

    let payload: { id?: string } | undefined;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, secret);
      payload = verifiedPayload as { id?: string };
    } catch (_err) {
      return NextResponse.json({ error: "Não autorizado: token inválido." }, { status: 401 });
    }

    const empresaId = payload?.id;
    if (!empresaId) {
      return NextResponse.json({ error: "Não autorizado: token inválido." }, { status: 401 });
    }

    // --- 2. Lógica de Busca no Banco de Dados ---
    await connectDB();

    const ultimoDiagnostico = await DiagnosticoAprofundado.findOne({
      empresa: empresaId,
    }).sort({ createdAt: -1 });

    if (!ultimoDiagnostico) {
      return NextResponse.json({ error: "Nenhum diagnóstico aprofundado encontrado para esta empresa." }, { status: 404 });
    }

    return NextResponse.json(ultimoDiagnostico);

  } catch (error: unknown) {
    console.error("Erro ao buscar último diagnóstico:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return NextResponse.json({ error: "Falha ao processar a requisição.", details: errorMessage }, { status: 500 });
  }
}