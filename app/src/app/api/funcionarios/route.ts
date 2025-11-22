import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId");

    if (!empresaId) {
        return NextResponse.json(
            { error: "empresaId é obrigatório." },
            { status: 400 }
        );
    }

    const funcionarios = await Funcionario.find({ empresa: empresaId })
        .populate('trilhas.trilha', 'nome descricao')
        .populate('trilhasConcluidas.trilha', 'nome descricao')
        .sort({ createdAt: -1 });

    return NextResponse.json(funcionarios);
}

export async function POST(req: Request) {
    await connectDB();

    try {
        const data = await req.json();

        if (!data.empresaId) {
            return NextResponse.json({ error: "empresaId é obrigatório" }, { status: 400 });
        }

        const senhaHash = await bcrypt.hash(data.senha, 10);

        // Verificar email duplicado dentro da mesma empresa
        const existingEmail = await Funcionario.findOne({
            email: data.email,
            empresa: data.empresaId
        });

        if (existingEmail) {
            return NextResponse.json(
                { error: "Já existe um funcionário com este email nesta empresa." },
                { status: 400 }
            );
        }

        // Verificar matrícula duplicada dentro da mesma empresa
        const existingMatricula = await Funcionario.findOne({
            matricula: data.matricula,
            empresa: data.empresaId
        });

        if (existingMatricula) {
            return NextResponse.json(
                { error: "Já existe um funcionário com esta matrícula nesta empresa." },
                { status: 400 }
            );
        }

        const novo = await Funcionario.create({
            nome: data.nome,
            email: data.email,
            cargo: data.cargo,
            matricula: data.matricula,
            senha: senhaHash,
            status: data.status,
            trilhas: (data.trilhas || []).map((trilhaId: string) => ({
                trilha: trilhaId,
                status: "pendente",
                dataInicio: null
            })),
            empresa: data.empresaId,
        });

        return NextResponse.json(novo, { status: 201 });

    } catch (err: any) {
        console.error("Erro no POST /funcionarios:", err);

        // Detecta duplicidade de índice (MongoDB code 11000)
        if (err.code === 11000) {
            if (err.keyPattern?.matricula) {
                return NextResponse.json(
                    { error: "Já existe um funcionário com esta matrícula." },
                    { status: 400 }
                );
            }
            if (err.keyPattern?.email) {
                return NextResponse.json(
                    { error: "Já existe um funcionário com este e-mail." },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: "Valores duplicados não permitidos." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Erro ao criar funcionário." },
            { status: 500 }
        );
    }

}
