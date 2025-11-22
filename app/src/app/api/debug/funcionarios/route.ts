import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";

export async function GET() {
  try {
    await connectDB();
    
    const funcionarios = await Funcionario.find({})
      .select("_id nome email matricula cargo ultimaAlteracaoSenha")
      .lean();
    
    return NextResponse.json({
      total: funcionarios.length,
      funcionarios,
    });
  } catch (error: any) {
    console.error("Erro ao buscar funcionários:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
