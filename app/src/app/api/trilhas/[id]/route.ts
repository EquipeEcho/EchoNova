import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trilha from "@/models/Trilha";

// GET - Buscar trilha por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const trilha = await Trilha.findById(params.id);

    if (!trilha) {
      return NextResponse.json(
        { error: "Trilha não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ trilha }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar trilha:", error);
    return NextResponse.json(
      { error: "Erro ao buscar trilha" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar trilha
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();

    const trilhaAtualizada = await Trilha.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!trilhaAtualizada) {
      return NextResponse.json(
        { error: "Trilha não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { trilha: trilhaAtualizada, message: "Trilha atualizada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar trilha:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar trilha" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar trilha
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const trilhaDeletada = await Trilha.findByIdAndDelete(params.id);

    if (!trilhaDeletada) {
      return NextResponse.json(
        { error: "Trilha não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Trilha deletada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar trilha:", error);
    return NextResponse.json(
      { error: "Erro ao deletar trilha" },
      { status: 500 }
    );
  }
}
