import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trilha from "@/models/Trilha";
import { authenticateAndAuthorize } from "@/lib/middleware/authMiddleware";

// GET - Buscar trilha por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const trilha = await Trilha.findById(id);

    if (!trilha) {
      return NextResponse.json(
        { error: "Trilha não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(trilha, { status: 200 });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticar e autorizar como admin
    const authResult = await authenticateAndAuthorize(request as any, "ADMIN");
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const trilhaAtualizada = await Trilha.findByIdAndUpdate(
      id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticar e autorizar como admin
    const authResult = await authenticateAndAuthorize(request as any, "ADMIN");
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();
    const { id } = await params;
    
    const trilhaDeletada = await Trilha.findByIdAndDelete(id);

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
