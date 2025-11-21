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
        { error: "ID do funcionário ou trilha não fornecido" },
        { status: 400 }
      );
    }

    // Busca funcionário
    const funcionario = await Funcionario.findById(id);

    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se a trilha está atribuída ao funcionário
    const trilhaIndex = funcionario.trilhas.findIndex(
      (t: any) => t.toString() === trilhaId
    );

    if (trilhaIndex === -1) {
      return NextResponse.json(
        { error: "Trilha não encontrada nas atribuições do funcionário" },
        { status: 404 }
      );
    }

    // Remove a trilha da lista de trilhas do funcionário (marca como concluída removendo)
    funcionario.trilhas.splice(trilhaIndex, 1);
    await funcionario.save();

    return NextResponse.json({
      message: "Trilha concluída com sucesso",
      trilhasRestantes: funcionario.trilhas.length,
    });
  } catch (error: any) {
    console.error("Erro ao concluir trilha:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao concluir trilha" },
      { status: 500 }
    );
  }
}
