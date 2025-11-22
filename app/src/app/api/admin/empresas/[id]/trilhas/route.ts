import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";
import { authenticateAndAuthorize } from "@/lib/middleware/authMiddleware";

/**
 * @description Rota para buscar trilhas recomendadas para uma empresa específica.
 * Busca nos diagnósticos simplificados e retorna as trilhasDeMelhoria.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticar e autorizar como admin
    const authResult = await authenticateAndAuthorize(request as any, "ADMIN");
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();
    const { id } = await params;

    // Buscar diagnósticos da empresa
    const diagnosticos = await Diagnostico.find({ empresa: id }).sort({ createdAt: -1 });

    // Extrair trilhas recomendadas
    const trilhasPorDiagnostico = diagnosticos.map((diag) => ({
      diagnosticoId: diag._id,
      data: diag.createdAt,
      trilhas: diag.resultados?.trilhasDeMelhoria || [],
    }));

    return NextResponse.json({ trilhas: trilhasPorDiagnostico });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}