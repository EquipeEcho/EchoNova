import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "ID da empresa é obrigatório." },
        { status: 400 }
      );
    }

    const empresa = await Empresa.findById(id).select('-senha'); // Exclui a senha dos dados retornados
    
    if (!empresa) {
      return NextResponse.json(
        { error: "Empresa não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ empresa });
  } catch (error) {
    console.error("Erro ao buscar dados da empresa:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar dados da empresa." },
      { status: 500 }
    );
  }
}