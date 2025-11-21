import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";
import bcrypt from "bcryptjs";

/**
 * @route POST /api/empresa/[id]/change-password
 * @description Altera a senha da empresa após validar a senha atual
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const { senhaAtual, novaSenha } = body;

    // Validações
    if (!senhaAtual || !novaSenha) {
      return NextResponse.json(
        { error: "Senha atual e nova senha são obrigatórias" },
        { status: 400 }
      );
    }

    // Buscar empresa
    const empresa = await Empresa.findById(id);
    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    // Validar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, empresa.senha);
    if (!senhaValida) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 401 }
      );
    }

    // Validar requisitos da nova senha
    if (novaSenha.length < 8) {
      return NextResponse.json(
        { error: "A nova senha deve ter no mínimo 8 caracteres" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(novaSenha)) {
      return NextResponse.json(
        { error: "A nova senha deve conter pelo menos uma letra maiúscula" },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(novaSenha)) {
      return NextResponse.json(
        { error: "A nova senha deve conter pelo menos uma letra minúscula" },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(novaSenha)) {
      return NextResponse.json(
        { error: "A nova senha deve conter pelo menos um número" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const novaSenhaHash = await bcrypt.hash(novaSenha, salt);

    // Atualizar senha
    empresa.senha = novaSenhaHash;
    await empresa.save();

    return NextResponse.json(
      { message: "Senha alterada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
