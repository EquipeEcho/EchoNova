import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose"; // Importa a função para criar o JWT
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";

// Chave secreta para assinar o token. É crucial que ela esteja em variáveis de ambiente.
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// Constantes do administrador
const ADMIN_EMAIL = 'admin@echonova.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_CNPJ = '00000000000000';

/**
 * Verifica se o administrador existe no banco de dados.
 * Se não existir, cria automaticamente.
 */
async function ensureAdminExists() {
  try {
    // Verificar se já existe um admin
    const existingAdmin = await Empresa.findOne({ tipo_usuario: 'ADMIN' });

    if (existingAdmin) {
      return;
    }

    // Criar admin se não existir
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const admin = await Empresa.create({
      nome_empresa: 'Administração EchoNova',
      email: ADMIN_EMAIL,
      cnpj: ADMIN_CNPJ,
      senha: hashedPassword,
      tipo_usuario: 'ADMIN',
      planoAtivo: 'escalado'
    });

    console.log('✅ Administrador criado automaticamente no login');
    console.log(`   📧 Email: ${ADMIN_EMAIL}`);

  } catch (error) {
    console.error('❌ Erro ao verificar/criar administrador:', error);
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // Verificar e criar admin se necessário
    await ensureAdminExists();

    const { email, senha, cnpj } = await req.json();

    // 1. Validação de entrada
    if ((!email && !cnpj) || !senha) {
      return NextResponse.json(
        { error: "Email/CNPJ e senha são obrigatórios." },
        { status: 400 },
      );
    }

    // 2. Busca a empresa no banco de dados
    const empresa = await Empresa.findOne({ $or: [{ email }, { cnpj }] });
    if (!empresa) {
      return NextResponse.json(
        { error: "Credenciais inválidas." }, // Mensagem genérica por segurança
        { status: 401 },
      );
    }

    // 3. Verifica se a empresa tem um plano ativo (indicando que completou o pagamento)
    if (!empresa.planoAtivo) {
      return NextResponse.json(
        { error: "Conta não ativada. Complete o diagnóstico e adquira um plano para acessar." },
        { status: 401 },
      );
    }

    // 4. Compara a senha enviada com a senha armazenada (hash)
    const senhaOk = await bcrypt.compare(senha, empresa.senha);
    if (!senhaOk) {
      return NextResponse.json(
        { error: "Credenciais inválidas." }, // Mensagem genérica por segurança
        { status: 401 },
      );
    }

    // 5. Cria o Token JWT
    // O "payload" contém as informações que queremos armazenar no token.
    // NUNCA armazene senhas ou dados sensíveis aqui.
    const payload = {
      // --- CORREÇÃO APLICADA AQUI ---
      // Convertemos o _id para string ANTES de criar o token.
      // Isso garante que o token armazene um texto simples, e não um objeto complexo.
      id: empresa._id.toString(), 
      email: empresa.email,
      nome_empresa: empresa.nome_empresa,
      plano: empresa.planoAtivo,
    };

    // Verificar se é admin para aplicar política de segurança mais rigorosa
    const isAdmin = empresa.tipo_usuario === 'ADMIN';

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(isAdmin ? "1h" : "24h") // Admin: 1 hora, outros: 24 horas
      .sign(secret);

    // 6. Cria a resposta e armazena o token em um cookie HttpOnly
    const response = NextResponse.json({
      message: "Login bem-sucedido",
      user: payload, // Retorna os dados do usuário para o frontend usar imediatamente
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true, // O cookie não pode ser acessado por JavaScript no cliente (mais seguro contra XSS)
      secure: process.env.NODE_ENV === "production", // Usar apenas HTTPS em produção
      sameSite: "strict", // Ajuda a proteger contra ataques CSRF
      maxAge: isAdmin ? undefined : 60 * 60 * 24, // Admin: cookie de sessão, outros: 24 horas
      path: "/", // O cookie estará disponível em todo o site
    });

    return response;

  } catch (err: unknown) {
    console.error("Erro no Login:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message || "Erro interno no servidor" },
      { status: 500 },
    );
  }
}