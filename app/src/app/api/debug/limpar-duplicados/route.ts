import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";

// Endpoint para limpar funcionários duplicados
export async function GET() {
  try {
    await connectDB();
    
    // IDs dos Gabriel duplicados
    const duplicateIds = [
      "6918c6e3f574f9389d0b06e1",
      "6918c6eaf574f9389d0b06e4"
    ];
    
    const result = await Funcionario.deleteMany({
      _id: { $in: duplicateIds }
    });
    
    return NextResponse.json({
      message: "Funcionários duplicados removidos",
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error("Erro ao limpar duplicados:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
