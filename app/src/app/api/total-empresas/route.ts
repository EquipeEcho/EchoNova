import { NextResponse } from "next/server";
import Empresa from "@/models/Empresa";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    const total = await Empresa.countDocuments({});

    return NextResponse.json(
      { success: true, data: total },
      { status: 200 }
    );

  } catch (error) {
    console.error("Erro ao contar empresas:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao contar empresas" },
      { status: 500 }
    );
  }
}