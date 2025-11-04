import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transacao from "@/models/Transacao";
import Empresa from "@/models/Empresa";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Acesso direto ao ID
    await connectDB();

    // valida o formato do ID
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { error: "ID de transação inválido" },
        { status: 400 }
      );
    }

    //busca transação e popula empresa
    const transacao = await Transacao.findById(id).populate({
      path: "empresaId",
      model: Empresa, // garante que o schema existe
      select: "nome_empresa email cnpj planoAtivo",
    });

    if (!transacao) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        transacao: {
          id: transacao._id,
          plano: transacao.plano,
          valor: transacao.valor,
          status: transacao.status,
          metodoPagamento: transacao.metodoPagamento,
          dataTransacao: transacao.dataTransacao,
          dataConclusao: transacao.dataConclusao,
          empresa: transacao.empresaId,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar transação" },
      { status: 500 }
    );
  }
}