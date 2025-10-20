import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transacao from "@/models/Transacao";
import Empresa from "@/models/Empresa";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body)
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

    const { transacaoId } = body;
    if (!transacaoId)
      return NextResponse.json(
        { error: "transacaoId é obrigatório" },
        { status: 400 }
      );

    await connectDB();

    const transacao = await Transacao.findById(transacaoId);
    if (!transacao)
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );

    transacao.status = "concluida";
    transacao.dataConclusao = new Date();
    await transacao.save();

    const empresa = await Empresa.findById(transacao.empresaId);
    if (empresa) {
      empresa.planoAtivo = transacao.plano.toLowerCase();
      empresa.transacaoAtualId = null;
      await empresa.save();
    }

    return NextResponse.json({
      ok: true,
      message: "Transação concluída com sucesso",
      transacaoId: transacao._id,
      status: transacao.status,
      planoAtivo: empresa?.planoAtivo,
    });
  } catch (error) {
    console.error("Erro ao finalizar transação:", error);
    return NextResponse.json(
      { error: "Erro interno ao finalizar transação" },
      { status: 500 }
    );
  }
}
