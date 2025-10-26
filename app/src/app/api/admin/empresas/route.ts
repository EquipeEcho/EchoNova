// src/app/api/admin/empresas/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";
import Diagnostico from "@/models/Diagnostico";
import bcrypt from "bcryptjs";

/**
 * @description Rota para buscar todas as empresas.
 * Usada no painel de administração para listar todos os registros.
 */
export async function GET() {
  try {
    await connectDB();
    const empresas = await Empresa.find({}).sort({ nome_empresa: 1 });
    return NextResponse.json({ success: true, data: empresas });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * @description Rota para criar uma nova empresa.
 * Usada no painel de administração.
 */
export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Validação básica
        if (!body.nome_empresa || !body.email || !body.cnpj) {
            return NextResponse.json({ success: false, error: "Dados incompletos." }, { status: 400 });
        }

        // Se uma senha for fornecida, criptografa
        if (body.senha) {
            const salt = await bcrypt.genSalt(10);
            body.senha = await bcrypt.hash(body.senha, salt);
        }

        const novaEmpresa = await Empresa.create(body);
        return NextResponse.json({ success: true, data: novaEmpresa }, { status: 201 });

    } catch (error: any) {
        // Trata erro de duplicidade
        if (error.code === 11000) {
            return NextResponse.json({ success: false, error: "Email ou CNPJ já cadastrado." }, { status: 409 });
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}