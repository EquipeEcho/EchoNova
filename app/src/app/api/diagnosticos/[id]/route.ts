import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";

// GET - Buscar diagnóstico específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();

    const { id: diagnosticoId } = await params; // 1. Extrai o ID para uma variável

    // 2. Adiciona uma verificação para garantir que o ID é válido para o Mongoose
    if (!diagnosticoId || !diagnosticoId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "ID de diagnóstico inválido" },
        { status: 400 },
      );
    }

    const diagnostico = await Diagnostico.findById(diagnosticoId) // 3. Usa a variável
      .populate("empresa", "nome_empresa email cnpj");

    if (!diagnostico) {
      return NextResponse.json(
        { error: "Diagnóstico não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ diagnostico });
  } catch (err: any) {
    console.error(`Erro ao buscar diagnóstico:`, err);
    console.error(`Erro ao buscar diagnóstico:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT - Atualizar diagnóstico
// PUT - Atualizar diagnóstico
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await context.params;
    const dados = await request.json();

    const { id: diagnosticoId } = await params;
    const diagnosticoAtualizado = await Diagnostico.findByIdAndUpdate(
      diagnosticoId,
      { ...dados, dataConclusao: new Date() },
      { new: true },
    );

    if (!diagnosticoAtualizado) {
      return NextResponse.json(
        { error: "Diagnóstico não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Diagnóstico atualizado com sucesso",
      diagnostico: diagnosticoAtualizado,
      diagnostico: diagnosticoAtualizado,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Deletar diagnóstico
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await context.params;

    const { id: diagnosticoId } = await params;
    const diagnosticoDeletado = await Diagnostico.findByIdAndDelete(diagnosticoId);

    if (!diagnosticoDeletado) {
      return NextResponse.json(
        { error: "Diagnóstico não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Diagnóstico deletado com sucesso",
      message: "Diagnóstico deletado com sucesso",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

