import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyFuncionarioToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : request.cookies.get("auth_token")?.value;

    if (!token) {
      return { isValid: false, user: null, error: "Token não encontrado" };
    }

    const { payload } = await jwtVerify(token, secret);

    if (!payload) {
      return { isValid: false, user: null, error: "Token inválido" };
    }

    return {
      isValid: true,
      user: payload,
      error: null
    };
  } catch (error) {
    return { isValid: false, user: null, error: "Erro na verificação do token" };
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verificar token do funcionário
    const tokenResult = await verifyFuncionarioToken(req);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { error: tokenResult.error },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;
    const { senhaAtual, novaSenha } = await req.json();

    // Verificar se o funcionário existe
    const funcionario = await Funcionario.findById(id);
    if (!funcionario) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
    }

    // Verificar se o ID do usuário logado corresponde ao funcionário
    if (tokenResult.user?.id !== id) {
      return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
    }

    // Se nunca alterou a senha (primeira alteração), não validar senha atual
    if (funcionario.ultimaAlteracaoSenha !== null) {
      // Verificar se a senha atual está correta
      const senhaCorreta = await bcrypt.compare(senhaAtual, funcionario.senha);
      if (!senhaCorreta) {
        return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
      }
    }

    // Validar nova senha
    if (!novaSenha || novaSenha.length < 6) {
      return NextResponse.json({ error: "Nova senha deve ter pelo menos 6 caracteres" }, { status: 400 });
    }

    // Criptografar nova senha
    const salt = await bcrypt.genSalt(10);
    const novaSenhaHash = await bcrypt.hash(novaSenha, salt);

    // Atualizar senha e marcar como alterada
    await Funcionario.findByIdAndUpdate(id, {
      senha: novaSenhaHash,
      ultimaAlteracaoSenha: new Date()
    });

    return NextResponse.json({ success: true, message: "Senha alterada com sucesso" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}