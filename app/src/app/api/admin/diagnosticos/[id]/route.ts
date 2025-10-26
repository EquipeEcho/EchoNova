// src/app/api/admin/diagnosticos/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";
import { NextRequest } from "next/server"; // Importar NextRequest

/**
 * @description Rota para deletar um diagnóstico específico.
 * @param req O objeto da requisição.
 * @param context Contém os parâmetros da rota, como o ID do diagnóstico.
 */
// --- CORREÇÃO APLICADA NA ASSINATURA DA FUNÇÃO ---
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params; // Adicionado await para consistência

    const diagnosticoDeletado = await Diagnostico.findByIdAndDelete(id);

    if (!diagnosticoDeletado) {
      return NextResponse.json({ success: false, error: "Diagnóstico não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Diagnóstico deletado com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}