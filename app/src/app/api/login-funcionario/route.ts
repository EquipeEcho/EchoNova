import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";
import Empresa from "@/models/Empresa";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, matricula, senha } = await req.json();

    // Validação básica
    if ((!email && !matricula) || !senha) {
      return NextResponse.json(
        { error: "Email/matrícula e senha são obrigatórios." },
        { status: 400 }
      );
    }

    // Busca funcionário por email OU matrícula
    console.log("🔍 Buscando funcionário com:", { email, matricula });
    
    const query: any[] = [];
    if (email) query.push({ email });
    if (matricula) query.push({ matricula });
    
    const funcionario = await Funcionario.findOne({
      $or: query,
    }).populate("empresa", "nome_empresa planoAtivo");
    
    console.log("📋 Funcionário encontrado:", funcionario ? {
      id: funcionario._id,
      nome: funcionario.nome,
      email: funcionario.email,
      matricula: funcionario.matricula
    } : null);

    if (!funcionario) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    // Verifica se a empresa está ativa
    if (!funcionario.empresa || !funcionario.empresa.planoAtivo) {
      return NextResponse.json(
        { error: "Empresa não está ativa. Funcionário não pode acessar." },
        { status: 401 }
      );
    }

    // Verifica senha
    const senhaOk = await bcrypt.compare(senha, funcionario.senha);
    if (!senhaOk) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    // Cria payload do token
    const payload = {
      id: funcionario._id.toString(),
      nome: funcionario.nome,
      email: funcionario.email,
      matricula: funcionario.matricula,
      cargo: funcionario.cargo,
      empresaId: funcionario.empresa._id.toString(),
      empresaNome: funcionario.empresa.nome_empresa,
      tipo: "funcionario",
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    // Resposta + cookie
    const response = NextResponse.json({
      message: "Login de funcionário bem-sucedido",
      user: payload,
    });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return response;
  } catch (err: any) {
    console.error("Erro no login do funcionário:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
