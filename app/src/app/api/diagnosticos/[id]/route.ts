import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";

// GET - Buscar diagnóstico específico
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const diagnostico = await Diagnostico.findById(params.id)
      .populate('empresa', 'nome_empresa email cnpj');

    if (!diagnostico) {
      return NextResponse.json({ error: "Diagnóstico não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ diagnostico });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT - Atualizar diagnóstico
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const dados = await req.json();

    const diagnosticoAtualizado = await Diagnostico.findByIdAndUpdate(
      params.id,
      { ...dados, dataConclusao: new Date() },
      { new: true }
    );

    if (!diagnosticoAtualizado) {
      return NextResponse.json({ error: "Diagnóstico não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Diagnóstico atualizado com sucesso",
      diagnostico: diagnosticoAtualizado
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Deletar diagnóstico
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const diagnosticoDeletado = await Diagnostico.findByIdAndDelete(params.id);

    if (!diagnosticoDeletado) {
      return NextResponse.json({ error: "Diagnóstico não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Diagnóstico deletado com sucesso"
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
