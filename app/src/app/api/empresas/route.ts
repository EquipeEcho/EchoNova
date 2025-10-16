import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";

// ✅ GET (listar todas as empresas)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get("cnpj");

  try {
    await connectDB();

    // 🔍 Se tiver ?cnpj=... → valida se já existe
    if (cnpj) {
      const empresa = await Empresa.findOne({ cnpj });
      return NextResponse.json({ existe: !!empresa });
    }

    // 🧾 Se não tiver parâmetro, retorna lista completa
    const empresas = await Empresa.find({}, "nome_empresa email cnpj _id");
    return NextResponse.json({
      message: "Empresas encontradas",
      empresas,
      total: empresas.length,
    });

  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao consultar empresas." },
      { status: 500 }
    );
  }
}
