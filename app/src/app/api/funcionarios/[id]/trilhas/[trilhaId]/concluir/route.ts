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
      (t: any) => t.trilha.toString() === trilhaId
    );

    if (trilhaIndex === -1) {
      return NextResponse.json(
        { error: "Trilha não encontrada nas atribuições do funcionário" },
        { status: 404 }
      );
    }

    // CORREÇÃO TEMPORÁRIA: Se o status for "pendente", corrigir para "não_iniciado"
    if (funcionario.trilhas[trilhaIndex].status === "pendente") {
      funcionario.trilhas[trilhaIndex].status = "não_iniciado";
    }

    // Verifica se a trilha está em andamento
    const trilhaAtiva = funcionario.trilhas[trilhaIndex];
    if (trilhaAtiva.status !== "em_andamento") {
      return NextResponse.json(
        { error: "A trilha deve estar em andamento para ser concluída" },
        { status: 400 }
      );
    }

    // Move a trilha para o histórico de concluídas
    funcionario.trilhasConcluidas = funcionario.trilhasConcluidas || [];
    funcionario.trilhasConcluidas.push({
      trilha: trilhaId,
      dataConclusao: new Date(),
    });
    
    // Remove a trilha da lista de trilhas ativas
    funcionario.trilhas.splice(trilhaIndex, 1);
    await funcionario.save();

    return NextResponse.json({
      message: "Trilha concluída com sucesso",
      trilhasRestantes: funcionario.trilhas.length,
      trilhasConcluidas: funcionario.trilhasConcluidas.length,
    });
  } catch (error: any) {
    console.error("Erro ao concluir trilha:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao concluir trilha" },
      { status: 500 }
    );
  }
}
