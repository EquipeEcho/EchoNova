// src/app/api/admin/empresas/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";
import Diagnostico from "@/models/Diagnostico";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server"; // Importar NextRequest

/**
 * @description Rota para atualizar uma empresa específica.
 * @param req O objeto da requisição.
 * @param params Contém os parâmetros da rota, como o ID da empresa.
 */
// --- CORREÇÃO APLICADA NA ASSINATURA DA FUNÇÃO ---
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params; // Acesso direto ao ID
    const body = await req.json();

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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * @description Rota para deletar uma empresa e todos os seus diagnósticos associados.
 * @param req O objeto da requisição.
 * @param params Contém os parâmetros da rota, como o ID da empresa.
 */
// --- CORREÇÃO APLICADA NA ASSINATURA DA FUNÇÃO ---
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params; // Acesso direto ao ID

    // 1. Deletar todos os diagnósticos associados à empresa
    await Diagnostico.deleteMany({ empresa: id });

    // 2. Deletar a empresa
    const empresaDeletada = await Empresa.findByIdAndDelete(id);

    if (!empresaDeletada) {
      return NextResponse.json({ success: false, error: "Empresa não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Empresa e diagnósticos associados deletados com sucesso." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}