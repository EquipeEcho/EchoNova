import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";
import bcrypt from "bcryptjs";

// =======================================
// PUT /api/funcionarios/[id]
// =======================================
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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

    const body = await req.json();

    const camposPermitidos = [
      "nome",
      "email",
      "cargo",
      "matricula",
      "status",
      "senha",
      "trilhas",
    ];

    const updates: any = {};

    for (const campo of camposPermitidos) {
      if (campo !== "senha" && body[campo] !== undefined) {
        if (campo === "trilhas") {
          // Transforma array de strings em objetos embedded
          updates[campo] = (body[campo] || []).map((trilhaId: string) => ({
            trilha: trilhaId,
            status: "pendente",
            dataInicio: null
          }));
        } else {
          updates[campo] = body[campo];
        }
      }
    }

    if (body.senha) {
      updates.senha = await bcrypt.hash(body.senha, 10);
    }

    const funcionario = await Funcionario.findOneAndUpdate(
      { _id: id, empresa: empresaId },
      updates,
      { new: true }
    ).populate('trilhas', 'nome descricao');

    if (!funcionario) {
      return NextResponse.json(
        { error: "Funcionário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(funcionario);

  } catch (err: any) {
    console.error("Erro no PUT /funcionarios/[id]:", err);

    if (err.code === 11000) {
      if (err.keyPattern?.matricula) {
        return NextResponse.json(
          { error: "Já existe outro funcionário com esta matrícula." },
          { status: 400 }
        );
      }
      if (err.keyPattern?.email) {
        return NextResponse.json(
          { error: "Já existe outro funcionário com este e-mail." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Valores duplicados não permitidos." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar funcionário." },
      { status: 500 }
    );
  }

}


// =======================================
// DELETE /api/funcionarios/[id]
// =======================================
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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
