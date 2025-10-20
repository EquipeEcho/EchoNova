import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";

// POST - Criar nova empresa
export async function POST(req: Request) {
  try {
    await connectDB();
    const { perfil } = await req.json();

    if (!perfil || !perfil.cnpj) {
      return NextResponse.json(
        { error: "Dados incompletos para criar empresa." },
        { status: 400 }
      );
    }

    // Verifica se já existe uma empresa com o mesmo CNPJ
    const empresaExistente = await Empresa.findOne({ cnpj: perfil.cnpj });
    if (empresaExistente) {
      return NextResponse.json({ empresa: empresaExistente });
    }

    // Cria nova empresa
    const novaEmpresa = await Empresa.create({
      nome_empresa: perfil.empresa,
      email: perfil.email,
      cnpj: perfil.cnpj,
      setor: perfil.setor,
      porte: perfil.porte,
    });

    return NextResponse.json({ empresa: novaEmpresa });
  } catch (error) {
    console.error("Erro ao criar empresa:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar empresa." },
      { status: 500 }
    );
  }
}
