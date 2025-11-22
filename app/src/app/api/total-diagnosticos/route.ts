import { NextResponse } from "next/server";
import Diagnostico from "@/models/Diagnostico";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    const diagnosticos = await Diagnostico.find({})
      .sort({ createdAt: -1 }) // mais recentes primeiro
      .lean(); // melhora performance

    return NextResponse.json(
      { success: true, data: diagnosticos },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao buscar diagnósticos:", error);

    return NextResponse.json(
      { success: false, message: "Erro ao buscar diagnósticos" },
      { status: 500 }
    );
  }
}
