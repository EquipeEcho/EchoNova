import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";

export async function POST(req: Request) {
  try {
    await connectDB();

    // Lê o corpo cru (para debug seguro)
    const rawBody = await req.text();
    console.log("📦 Body recebido:", rawBody);

    if (!rawBody) {
      return NextResponse.json(
        { error: "Requisição sem corpo JSON" },
        { status: 400 }
      );
    }

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "JSON inválido" },
        { status: 400 }
      );
    }

    const email = data?.email?.trim() || "";
    const senha = data?.senha?.trim() || "";
    const cnpj = data?.cnpj?.trim() || "";

    if (!email && !cnpj) {
      console.warn("⚠️ Nenhum email ou CNPJ recebido:", data);
      return NextResponse.json(
        { error: "Insira Email ou CNPJ para fazer login" },
        { status: 400 }
      );
    }

    if (!senha) {
      return NextResponse.json(
        { error: "Senha é obrigatória" },
        { status: 400 }
      );
    }

    // Busca empresa
    const empresa = await Empresa.findOne({
      $or: [{ email }, { cnpj }],
    });

    if (!empresa) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    // Valida senha
    const senhaOk = await bcrypt.compare(senha, empresa.senha || "");
    if (!senhaOk) {
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login bem-sucedido",
      user: {
        id: empresa._id,
        nome_empresa: empresa.nome_empresa,
        email: empresa.email,
        cnpj: empresa.cnpj,
        planoAtivo: empresa.planoAtivo,
      },
    });
  } catch (err: any) {
    console.error("Erro no Login:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
