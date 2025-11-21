import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";
import Trilha from "@/models/Trilha";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID do funcionário não fornecido" },
        { status: 400 }
      );
    }

    // Busca funcionário e popula trilhas
    const funcionario = await Funcionario.findById(id).populate({
      path: "trilhas",
      model: Trilha,
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
      trilhas: funcionario.trilhas || [],
    });
  } catch (error: any) {
    console.error("Erro ao buscar trilhas do funcionário:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao buscar trilhas do funcionário" },
      { status: 500 }
    );
  }
}
