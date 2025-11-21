import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";
import Diagnostico from "@/models/Diagnostico";
import DiagnosticoAprofundado from "@/models/DiagnosticoAprofundado";
import AiSession from "@/models/AiSession";
import Funcionario from "@/models/Funcionario";
import Transacao from "@/models/Transacao";
import { authenticateAndAuthorize } from "@/lib/middleware/authMiddleware";

/**
 * Verifica se uma empresa é o administrador do sistema
 */
function isAdminUser(empresa: any): boolean {
  return empresa?.tipo_usuario === 'ADMIN';
}
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server"; // Importar NextRequest como tipo

/**
 * @description Rota para atualizar uma empresa específica.
 * @param req O objeto da requisição.
 * @param params Contém os parâmetros da rota, como o ID da empresa.
 */

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Autenticar e autorizar como admin
    const authResult = await authenticateAndAuthorize(req, "ADMIN");
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();
    const { id } = await params; // Acesso direto ao ID
    const body = await req.json();

    // Verificar se a empresa existe e se é admin
    const empresaExistente = await Empresa.findById(id);
    if (!empresaExistente) {
      return NextResponse.json({ success: false, error: "Empresa não encontrada." }, { status: 404 });
    }

    const isAdmin = isAdminUser(empresaExistente);

    // Proteções especiais para conta de administrador
    if (isAdmin) {
      // Impedir alteração do tipo_usuario
      if (body.tipo_usuario && body.tipo_usuario !== 'ADMIN') {
        return NextResponse.json({
          success: false,
          error: "Não é possível alterar o tipo de usuário da conta de administrador."
        }, { status: 403 });
      }

      // Impedir alteração do CNPJ
      if (body.cnpj && body.cnpj !== empresaExistente.cnpj) {
        return NextResponse.json({
          success: false,
          error: "Não é possível alterar o CNPJ da conta de administrador."
        }, { status: 403 });
      }

      // Garantir que tipo_usuario permanece como ADMIN
      body.tipo_usuario = 'ADMIN';
    }

    // Se a senha foi enviada e não está vazia, criptografa
    if (body.senha && body.senha.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        body.senha = await bcrypt.hash(body.senha, salt);
    } else {
        // Remove o campo senha para não salvar um hash vazio ou sobrescrever com null
        delete body.senha;
    }

    const empresaAtualizada = await Empresa.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    if (!empresaAtualizada) {
      return NextResponse.json({ success: false, error: "Empresa não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: empresaAtualizada });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

/**
 * @description Rota para deletar uma empresa e todos os seus diagnósticos associados.
 * @param req O objeto da requisição.
 * @param params Contém os parâmetros da rota, como o ID da empresa.
 */

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Autenticar e autorizar como admin
    const authResult = await authenticateAndAuthorize(request, "ADMIN");
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();
    const { id } = await params; // Acesso direto ao ID

    // Verificar se a empresa é o administrador do sistema
    const empresa = await Empresa.findById(id);
    if (!empresa) {
      return NextResponse.json({ success: false, error: "Empresa não encontrada." }, { status: 404 });
    }

    if (isAdminUser(empresa)) {
      return NextResponse.json({
        success: false,
        error: "Não é possível excluir a conta de administrador do sistema."
      }, { status: 403 });
    }

    // 1. Deletar todos os diagnósticos básicos associados à empresa
    await Diagnostico.deleteMany({ empresa: id });

    // 2. Deletar todos os diagnósticos aprofundados associados à empresa
    await DiagnosticoAprofundado.deleteMany({ empresa: id });

    // 3. Deletar todas as sessões de IA associadas à empresa
    await AiSession.deleteMany({ empresaId: id });

    // 4. Deletar todos os funcionários associados à empresa
    await Funcionario.deleteMany({ empresa: id });

    // 5. Deletar todas as transações associadas à empresa
    await Transacao.deleteMany({ empresaId: id });

    // 6. Deletar a empresa
    const empresaDeletada = await Empresa.findByIdAndDelete(id);

    if (!empresaDeletada) {
      return NextResponse.json({ success: false, error: "Empresa não encontrada." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Empresa e todos os dados associados (diagnósticos, sessões de IA, funcionários e transações) foram deletados com sucesso."
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}