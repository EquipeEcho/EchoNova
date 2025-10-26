// src/app/api/admin/empresas/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";
import Diagnostico from "@/models/Diagnostico";
import bcrypt from "bcryptjs";

/**
 * @description Rota para atualizar uma empresa específica.
 * @param req O objeto da requisição.
 * @param context Contém os parâmetros da rota, como o ID da empresa.
 */
export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    await connectDB();
    // --- CORREÇÃO APLICADA ---
    // Em rotas dinâmicas do App Router, 'context.params' é uma Promise
    // e deve ser resolvido com 'await' antes de acessar suas propriedades.
    const { id } = context.params;
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
 * @param context Contém os parâmetros da rota, como o ID da empresa.
 */
export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = await context.params;

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