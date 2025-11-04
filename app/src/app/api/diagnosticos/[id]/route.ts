import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";
import { NextRequest } from "next/server"; // Importar NextRequest

// GET - Buscar diagnóstico específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } 
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "ID de diagnóstico inválido" },
        { status: 400 }
      );
    }

    const diagnostico = await Diagnostico.findById(id).populate(
      "empresa",
      "nome_empresa email cnpj"
    );

    if (!diagnostico) {
      return NextResponse.json(
        { error: "Diagnóstico não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ diagnostico });
  } catch (err: any) {
    console.error(`Erro ao buscar diagnóstico:`, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT - Atualizar diagnóstico
// --- CORREÇÃO APLICADA NA ASSINATURA DA FUNÇÃO ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const dados = await request.json();

    const diagnosticoAtualizado = await Diagnostico.findByIdAndUpdate(
      id,
      { ...dados, dataConclusao: new Date() },
      { new: true }
    );

    if (!diagnosticoAtualizado) {
      return NextResponse.json(
        { error: "Diagnóstico não encontrado" },
        { status: 404 }
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
// --- CORREÇÃO APLICADA NA ASSINATURA DA FUNÇÃO ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const diagnosticoDeletado = await Diagnostico.findByIdAndDelete(id);

    if (!diagnosticoDeletado) {
      return NextResponse.json(
        { error: "Diagnóstico não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Diagnóstico deletado com sucesso",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}