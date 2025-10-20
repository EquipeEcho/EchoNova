import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";

// GET - Listar todas as empresas (apenas para debug)
export async function GET() {
  try {
    await connectDB();

    const empresas = await Empresa.find({}, "nome_empresa email cnpj _id");

    return NextResponse.json({
      message: "Empresas encontradas",
      empresas,
      total: empresas.length,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Erro ao consultar empresas." }, { status: 500 });
  }
}