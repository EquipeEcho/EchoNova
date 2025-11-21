import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const { id, senhaAtual, novaSenha } = await req.json();

    // validação básica
    if (!id || !senhaAtual || !novaSenha) {
      return NextResponse.json(
        { error: "Dados incompletos." },
        { status: 400 }
      );
    }

    // procura o funcionário
    const funcionario = await Funcionario.findById(id);
    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado." },
        { status: 404 }
      );
    }

    // confere senha atual
    const senhaOk = await bcrypt.compare(senhaAtual, funcionario.senha);
    if (!senhaOk) {
      return NextResponse.json(
        { error: "Senha atual incorreta." },
        { status: 401 }
      );
    }

    // gera hash da nova senha
    const novaHash = await bcrypt.hash(novaSenha, 10);

    funcionario.senha = novaHash;
    await funcionario.save();

    return NextResponse.json(
      { message: "Senha alterada com sucesso!" },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("Erro em alterar-senha:", err);
    return NextResponse.json(
      { error: "Erro ao alterar senha." },
      { status: 500 }
    );
  }
}
