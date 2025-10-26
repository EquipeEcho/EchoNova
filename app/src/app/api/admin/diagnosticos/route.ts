// src/app/api/admin/diagnosticos/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";

/**
 * @description Rota para buscar todos os diagnósticos.
 * Popula o nome da empresa para exibição na tabela de administração.
 */
export async function GET() {
  try {
    await connectDB();
    const diagnosticos = await Diagnostico.find({})
      .populate("empresa", "nome_empresa") // Popula o campo 'empresa' com o nome
      .sort({ createdAt: -1 }); // Ordena pelos mais recentes
      
    return NextResponse.json({ success: true, data: diagnosticos });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}