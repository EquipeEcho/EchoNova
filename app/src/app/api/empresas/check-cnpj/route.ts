import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";

export async function POST(req: Request) {
  try {
    const { cnpj } = await req.json();

    await connectDB();

    const empresa = await Empresa.findOne({ cnpj });
    if (empresa) {
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("Erro ao verificar CNPJ:", error);
    return NextResponse.json(
      { error: "Erro ao verificar CNPJ" },
      { status: 500 }
    );
  }
}