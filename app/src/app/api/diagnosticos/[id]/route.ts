import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";

// GET - Buscar diagnóstico específico
export async function GET(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    await connectDB();
    const { id: diagnosticoId } = context.params;

    if (!diagnosticoId || !diagnosticoId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "ID de diagnóstico inválido" },
        { status: 400 },
      );
    }

    const diagnostico = await Diagnostico.findById(diagnosticoId)
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT - Atualizar diagnóstico
export async function PUT(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    await connectDB();
    const dados = await request.json();

    const { id: diagnosticoId } = context.params;
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
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Deletar diagnóstico
export async function DELETE(
  request: Request,
  context: { params: { id: string } },
) {
  try {
    await connectDB();

    const { id: diagnosticoId } = context.params;
    const diagnosticoDeletado = await Diagnostico.findByIdAndDelete(diagnosticoId);

    if (!diagnosticoDeletado) {
      return NextResponse.json(
        { error: "Diagnóstico não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Diagnóstico deletado com sucesso",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}