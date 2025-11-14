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

        const novo = await Funcionario.create({
            nome: data.nome,
            email: data.email,
            cargo: data.cargo,
            matricula: data.matricula,
            senha: senhaHash,
            status: data.status,
            empresa: data.empresaId,
        });

        return NextResponse.json(novo, { status: 201 });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
