// src/app/api/admin/diagnosticos/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";

/**
 * @description Rota para deletar um diagnóstico específico.
 * @param req O objeto da requisição.
 * @param context Contém os parâmetros da rota, como o ID do diagnóstico.
 */
export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    await connectDB();
    // --- CORREÇÃO APLICADA ---
    // Adicionamos 'await' para esperar a resolução dos parâmetros da rota
    // antes de desestruturar o ID.
    const { id } = context.params;

    const diagnosticoDeletado = await Diagnostico.findByIdAndDelete(id);

    if (!diagnosticoDeletado) {
      return NextResponse.json({ success: false, error: "Diagnóstico não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Diagnóstico deletado com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}