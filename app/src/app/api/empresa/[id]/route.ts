import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";

/**
 * @description Rota para buscar os dados de uma empresa específica pelo seu ID.
 * É usada, por exemplo, na página /pos-login para carregar informações atualizadas do usuário.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // --- CORREÇÃO APLICADA AQUI ---
    const { id } = await params;

    // Validação para garantir que o ID foi recebido.
    if (!id) {
      return NextResponse.json(
        { error: "ID da empresa é obrigatório." },
        { status: 400 }
      );
    }

    // Busca a empresa no banco de dados pelo ID.
    // A função `.select('-senha')` é uma boa prática de segurança para garantir
    // que o hash da senha nunca seja retornado pela API.
    const empresa = await Empresa.findById(id).select('-senha');

    // Se nenhuma empresa for encontrada com esse ID, retorna um erro 404.
    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada." },
        { status: 404 }
      );
    }

    // Retorna os dados da empresa em caso de sucesso.
    return NextResponse.json({ empresa });

  } catch (error: unknown) {
    console.error("Erro ao buscar dados da empresa:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json(
      { error: "Erro interno ao buscar dados da empresa.", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * @route PUT /api/empresa/[id]
 * @description Atualiza dados de uma empresa
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const { nome_empresa, email } = body;

    // Validações básicas
    if (!nome_empresa || !email) {
      return NextResponse.json(
        { error: "Nome e email são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se email já está em uso por outra empresa
    const empresaExistente = await Empresa.findOne({
      email,
      _id: { $ne: id },
    });

    if (empresaExistente) {
      return NextResponse.json(
        { error: "Este email já está em uso por outra empresa" },
        { status: 409 }
      );
    }

    // Atualizar empresa (apenas nome e email)
    const empresaAtualizada = await Empresa.findByIdAndUpdate(
      id,
      {
        nome_empresa,
        email,
      },
      { new: true, runValidators: true }
    ).select("-senha");

    if (!empresaAtualizada) {
      return NextResponse.json(
        { error: "Empresa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Empresa atualizada com sucesso",
        empresa: empresaAtualizada,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}