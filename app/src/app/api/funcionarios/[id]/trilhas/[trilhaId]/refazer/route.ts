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

    // Verifica se a trilha está no histórico
    const trilhaConcluida = funcionario.trilhasConcluidas?.find(
      (tc: any) => tc.trilha.toString() === trilhaId
    );

    if (!trilhaConcluida) {
      return NextResponse.json(
        { error: "Trilha não encontrada no histórico" },
        { status: 404 }
      );
    }

    // Verifica se a trilha já não está ativa
    const jaAtiva = funcionario.trilhas.some(
      (t: any) => t.toString() === trilhaId
    );

    if (jaAtiva) {
      return NextResponse.json(
        { error: "Trilha já está ativa" },
        { status: 400 }
      );
    }

    // Adiciona a trilha de volta às trilhas ativas
    funcionario.trilhas.push(trilhaId);
    await funcionario.save();

    return NextResponse.json({
      message: "Trilha adicionada novamente às suas trilhas ativas",
      trilhasAtivas: funcionario.trilhas.length,
    });
  } catch (error: any) {
    console.error("Erro ao refazer trilha:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao refazer trilha" },
      { status: 500 }
    );
  }
}
