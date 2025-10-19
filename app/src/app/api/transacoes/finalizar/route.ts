import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transacao from "@/models/Transacao";
import Empresa from "@/models/Empresa";

export async function POST(req: Request) {
  try {
    const { transacaoId } = await req.json();

    if (!transacaoId) {
      return NextResponse.json(
        { error: "transacaoId é obrigatório" },
        { status: 400 }
      );
    }

    await connectDB();

    // Busca a transação
    const transacao = await Transacao.findById(transacaoId);
    if (!transacao) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );
    }

    // Atualiza status da transação
    transacao.status = "concluída";
    transacao.dataConclusao = new Date();
    await transacao.save();

    // Atualiza a empresa com o plano comprado
    const empresa = await Empresa.findById(transacao.empresaId);
    if (empresa) {
      empresa.planoAtivo = transacao.plano.toLowerCase();
      empresa.transacaoAtualId = null;
      await empresa.save();
    }

    return NextResponse.json({
      message: "Transação concluída com sucesso",
      transacao,
    });
  } catch (error) {
    console.error("Erro ao finalizar transação:", error);
    return NextResponse.json(
      { error: "Erro interno ao finalizar transação" },
      { status: 500 }
    );
  }
}
