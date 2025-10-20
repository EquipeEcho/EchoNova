import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transacao from "@/models/Transacao";
import Empresa from "@/models/Empresa";

const PLANOS = {
  essencial: 590,
  avancado: 990,
  escalado: 0, // "Sob consulta"
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body)
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

    const { empresaId, plano } = body;
    if (!empresaId || !plano)
      return NextResponse.json(
        { error: "empresaId e plano são obrigatórios" },
        { status: 400 }
      );

    await connectDB();

    const empresa = await Empresa.findById(empresaId);
    if (!empresa)
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );

    const planoKey = plano.toLowerCase() as keyof typeof PLANOS;
    if (!PLANOS[planoKey])
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

    const valorPlano = PLANOS[planoKey];

    const novaTransacao = await Transacao.create({
      empresaId,
      plano: planoKey,
      valor: valorPlano,
      status: "pendente",
      metodoPagamento: "simulado",
      dataTransacao: new Date(),
    });

    empresa.transacaoAtualId = novaTransacao._id;
    await empresa.save();

    return NextResponse.json(
      {
        ok: true,
        message: "Transação iniciada com sucesso",
        transacaoId: novaTransacao._id,
        valor: valorPlano,
        status: novaTransacao.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao iniciar transação:", error);
    return NextResponse.json(
      { error: "Erro interno ao iniciar transação" },
      { status: 500 }
    );
  }
}
