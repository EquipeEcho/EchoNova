import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; trilhaId: string }> }
) {
  try {
    await connectDB();
    const { id, trilhaId } = await params;

    if (!id || !trilhaId) {
      return NextResponse.json(
        { error: "ID do funcionário e trilha são obrigatórios" },
        { status: 400 }
      );
    }

    // Busca o funcionário
    const funcionario = await Funcionario.findById(id);
    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    // Encontra a trilha na lista de trilhas do funcionário
    const trilhaIndex = funcionario.trilhas.findIndex(
      (t: any) => t.trilha.toString() === trilhaId
    );

    if (trilhaIndex === -1) {
      return NextResponse.json(
        { error: "Trilha não encontrada para este funcionário" },
        { status: 404 }
      );
    }

    // Atualiza o status da trilha para "em_andamento" e define dataInicio
    funcionario.trilhas[trilhaIndex].status = "em_andamento";
    funcionario.trilhas[trilhaIndex].dataInicio = new Date();

    // Salva as alterações
    await funcionario.save();

    return NextResponse.json({
      success: true,
      message: "Trilha iniciada com sucesso",
      trilha: funcionario.trilhas[trilhaIndex]
    });
  } catch (error: any) {
    console.error("Erro ao iniciar trilha:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao iniciar trilha" },
      { status: 500 }
    );
  }
}