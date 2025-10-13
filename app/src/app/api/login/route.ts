// app/src/app/api/login/route.ts

import { NextResponse } from "next/server"; // Para criar respostas HTTP no Next.js
import bcrypt from "bcryptjs"; // Biblioteca para comparar hash de senha
import { connectDB } from "@/lib/mongodb"; // Função para conectar ao MongoDB
import Empresa from "@/models/Empresa"; // Modelo Empresa (coleção no MongoDB)

export async function POST(req: Request) {
  try {
    // Conecta ao banco de dados
    await connectDB();

    // Pega os dados enviados pelo front-end (email, senha e CNPJ)
    const { email, senha, cnpj } = await req.json();

    // 1. OTIMIZAÇÃO: Verifica se pelo menos um dado de identificação foi fornecido
    if (!email && !cnpj) {
      return NextResponse.json(
        { error: "Insira Email ou CNPJ para fazer login" },
        { status: 401 },
      );
    }

    // 2. OTIMIZAÇÃO: Realiza UMA ÚNICA consulta ao banco de dados.
    const query = { $or: [{ email }, { cnpj }] };
    const empresa = await Empresa.findOne(query);

    // Se não encontrou empresa, retorna erro 401
    if (!empresa) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 },
      );
    }

    // Compara a senha enviada com a senha hash armazenada no banco
    const senhaOk = await bcrypt.compare(senha, empresa.senha);
    if (!senhaOk) {
      // Se senha incorreta, retorna erro 401
      return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
    }

    // Se deu tudo certo, retorna sucesso com dados da empresa (sem a senha)
    return NextResponse.json({
      message: "Login bem-sucedido",
      user: {
        id: empresa._id,
        nome: empresa.nome_empresa,
        email: empresa.email,
      },
    });
  } catch (err: any) {
    // Em caso de erro, retorna status 500
    console.error("Erro no Login:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno do servidor" },
      { status: 500 },
    );
  }
}