import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transacao from "@/models/Transacao";
import Empresa from "@/models/Empresa";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // --- Valida o corpo da requisição ---
    const body = await req.json().catch(() => null);
    if (!body)
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

    const { transacaoId, email, cnpj, senha } = body;
    if (!transacaoId)
      return NextResponse.json(
        { error: "transacaoId é obrigatório" },
        { status: 400 }
      );

    // --- Conexão com o banco ---
    await connectDB();

    // --- Busca a transação ---
    const transacao = await Transacao.findById(transacaoId);
    if (!transacao)
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      );

    // --- Busca a empresa associada ---
    const empresa = await Empresa.findById(transacao.empresaId);
    if (!empresa)
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );

    // --- Atualiza o status da transação ---
    transacao.status = "concluida";
    transacao.dataConclusao = new Date();
    await transacao.save();

    // --- Atualiza o plano e limpa o ID da transação ---
    empresa.planoAtivo = transacao.plano?.toLowerCase() || "essencial";
    empresa.transacaoAtualId = null;

    // --- Atualiza email e CNPJ, se vierem do formulário ---
    if (email && typeof email === "string" && email.trim()) {
      empresa.email = email.trim().toLowerCase();
    }

    if (cnpj && typeof cnpj === "string" && cnpj.trim()) {
      empresa.cnpj = cnpj.trim();
    }

    // --- Atualiza senha, se enviada pelo frontend ---
    if (senha && typeof senha === "string" && senha.trim()) {
      // Evita re-hash se a senha já estiver hashada
      if (!senha.startsWith("$2b$")) {
        const hash = await bcrypt.hash(senha.trim(), 10);
        empresa.senha = hash;
      }
    }

    await empresa.save();

    // --- Resposta final ---
    return NextResponse.json({
      ok: true,
      message: "Transação concluída e cadastro atualizado com sucesso",
      empresaId: empresa._id,
      planoAtivo: empresa.planoAtivo,
    });
  } catch (error) {
    console.error("Erro ao finalizar transação:", error);
    return NextResponse.json(
      { error: "Erro interno ao finalizar transação" },
      { status: 500 }
    );
  }
}
