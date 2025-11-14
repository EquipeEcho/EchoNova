import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";
import bcrypt from "bcryptjs";

export async function PUT(req: Request, { params }: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId");

    if (!empresaId) {
      return NextResponse.json({ error: "empresaId é obrigatório" }, { status: 400 });
    }

    const updates = await req.json();

    const camposPermitidos = ["nome", "email", "cargo", "matricula", "status", "senha"];
    const dadosLimpos: any = {};

    for (const key of camposPermitidos) {
      if (updates[key] !== undefined) {
        dadosLimpos[key] = updates[key];
      }
    }

    if (dadosLimpos.senha) {
      dadosLimpos.senha = await bcrypt.hash(dadosLimpos.senha, 10);
    }

    const funcionario = await Funcionario.findOneAndUpdate(
      { _id: params.id, empresa: empresaId },
      dadosLimpos,
      { new: true }
    );

    if (!funcionario) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(funcionario);

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId");

    const funcionario = await Funcionario.findOneAndDelete({
      _id: params.id,
      empresa: empresaId
    });

    if (!funcionario) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
