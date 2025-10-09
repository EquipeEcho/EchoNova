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

    let empresa = null; // Variável que vai armazenar a empresa encontrada

    // Verifica se o usuário enviou email ou CNPJ
    if (email != "" || cnpj != "") {
      // Se CNPJ foi enviado e existe no banco, pega a empresa
      if ((await Empresa.findOne({ cnpj })) != null) {
        empresa = await Empresa.findOne({ cnpj });
      }
      // Se email foi enviado e existe no banco, pega a empresa
      if ((await Empresa.findOne({ email })) != null) {
        empresa = await Empresa.findOne({ email });
      }

      // Se não encontrou empresa com email ou CNPJ, retorna erro 401
      if (!empresa) {
        return NextResponse.json(
          { error: "Usuário não encontrado" },
          { status: 401 },
        );
      }
    } else {
      // Se não enviou nenhum dado, retorna erro 401
      return NextResponse.json(
        { error: "Insira email ou CNPJ" },
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
