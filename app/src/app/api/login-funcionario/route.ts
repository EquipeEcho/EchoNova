import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";

// chave para assinar token
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  try {
    await connectDB();

    const { login, senha } = await req.json(); 
    // login = email OU matrícula

    if (!login || !senha) {
      return NextResponse.json(
        { error: "Login (email ou matrícula) e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // funcionário pode entrar com email OU matrícula
    const funcionario = await Funcionario.findOne({
      $or: [{ email: login }, { matricula: login }]
    }).populate("empresa");

    if (!funcionario) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    // compara a senha
    const senhaOk = await bcrypt.compare(senha, funcionario.senha);
    if (!senhaOk) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    // payload do token
    const payload = {
      id: funcionario._id.toString(),
      nome: funcionario.nome,
      email: funcionario.email,
      matricula: funcionario.matricula,
      cargo: funcionario.cargo,
      empresa: funcionario.empresa?.nome_empresa || "",
      empresaId: funcionario.empresa?._id.toString(),
      role: "FUNCIONARIO"
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    const response = NextResponse.json({
      message: "Login realizado com sucesso",
      user: payload
    });

    // grava cookie
    response.cookies.set("auth_token_funcionario", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, 
      path: "/"
    });

    return response;

  } catch (err: any) {
    console.error("Erro no login do funcionário:", err);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
