import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";
import Trilha from "@/models/Trilha";
import Empresa from "@/models/Empresa";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "ID do funcionário não fornecido" },
        { status: 400 }
      );
    }

    // Busca funcionário e popula trilhas e empresa
    const funcionario = await Funcionario.findById(id)
      .populate({
        path: "trilhas.trilha",
        model: Trilha,
      })
      .populate({
        path: "trilhasConcluidas.trilha",
        model: Trilha,
      })
      .populate({
        path: "empresa",
        model: Empresa,
        select: "nome_empresa"
      });

    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      nome: funcionario.nome,
      email: funcionario.email,
      cargo: funcionario.cargo,
      matricula: funcionario.matricula,
      empresa: funcionario.empresa,
      trilhas: funcionario.trilhas || [],
      trilhasConcluidas: funcionario.trilhasConcluidas || [],
      ultimaAlteracaoSenha: funcionario.ultimaAlteracaoSenha,
    });
  } catch (error: any) {
    console.error("Erro ao buscar trilhas do funcionário:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar trilhas do funcionário" },
      { status: 500 }
    );
  }
}
