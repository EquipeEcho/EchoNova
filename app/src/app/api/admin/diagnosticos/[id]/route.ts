import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";
import type { NextRequest } from "next/server"; // Importar como tipo

/**
 * @description Rota para deletar um diagnóstico específico.
 * @param req O objeto da requisição.
 * @param params Contém os parâmetros da rota, como o ID do diagnóstico.
 */

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params; // Acesso direto ao ID

    const diagnosticoDeletado = await Diagnostico.findByIdAndDelete(id);

    if (!diagnosticoDeletado) {
      return NextResponse.json({ success: false, error: "Diagnóstico não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Diagnóstico deletado com sucesso." });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}