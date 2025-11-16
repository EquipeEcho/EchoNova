import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trilha from "@/models/Trilha";

// GET - Listar todas as tags disponíveis
export async function GET() {
  try {
    await connectDB();

    // Agregar todas as tags únicas
    const result = await Trilha.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { tag: "$_id", count: 1, _id: 0 } }
    ]);

    const tags = result.map(item => item.tag);

    return NextResponse.json({ tags }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar tags:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tags" },
      { status: 500 }
    );
  }
}
