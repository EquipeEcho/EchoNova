import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";
import bcrypt from "bcryptjs";

type ParamsPromise = Promise<{ id: string }>;

// =======================================
// PUT /api/funcionarios/[id]
// =======================================
export async function PUT(
  req: Request,
  { params }: { params: ParamsPromise }
) {
  try {
    await connectDB();

    // Next no teu projeto está pedindo para awaitar params
    const { id } = await params;

    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId");

    if (!empresaId) {
      return NextResponse.json(
        { error: "empresaId é obrigatório" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const camposPermitidos = [
      "nome",
      "email",
      "cargo",
      "matricula",
      "status",
      "senha",
    ];

    const updates: any = {};

    for (const campo of camposPermitidos) {
      if (campo !== "senha" && body[campo] !== undefined) {
        updates[campo] = body[campo];
      }
    }

    if (body.senha) {
      updates.senha = await bcrypt.hash(body.senha, 10);
    }

    const funcionario = await Funcionario.findOneAndUpdate(
      { _id: id, empresa: empresaId },
      updates,
      { new: true }
    );

    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(funcionario);
  } catch (err: any) {
    console.error("Erro no PUT /funcionarios/[id]:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar funcionário" },
      { status: 500 }
    );
  }
}

// =======================================
// DELETE /api/funcionarios/[id]
// =======================================
export async function DELETE(
  req: Request,
  { params }: { params: ParamsPromise }
) {
  try {
    await connectDB();

    const { id } = await params;

    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get("empresaId");

    if (!empresaId) {
      return NextResponse.json(
        { error: "empresaId é obrigatório" },
        { status: 400 }
      );
    }

    const funcionario = await Funcionario.findOneAndDelete({
      _id: id,
      empresa: empresaId,
    });

    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro no DELETE /funcionarios/[id]:", err);
    return NextResponse.json(
      { error: "Erro ao excluir funcionário" },
      { status: 500 }
    );
  }
}
