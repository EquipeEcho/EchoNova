import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trilha from "@/models/Trilha";

// GET - Listar todas as trilhas ou buscar por tags/áreas
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const tags = searchParams.get("tags")?.split(",");
    const areas = searchParams.get("areas")?.split(",");
    const status = searchParams.get("status");
    const nivel = searchParams.get("nivel");

    // Construir query de filtro
    const query: any = {};
    
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }
    
    if (areas && areas.length > 0) {
      query.areasAbordadas = { $in: areas };
    }
    
    if (status) {
      query.status = status;
    }
    
    if (nivel) {
      query.nivel = nivel;
    }

    const trilhas = await Trilha.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ trilhas }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar trilhas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar trilhas" },
      { status: 500 }
    );
  }
}

// POST - Criar nova trilha
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    // Validação básica
    if (!body.nome || !body.descricao || !body.tags || !body.areasAbordadas) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const novaTrilha = await Trilha.create(body);

    return NextResponse.json(
      { trilha: novaTrilha, message: "Trilha criada com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar trilha:", error);
    return NextResponse.json(
      { error: "Erro ao criar trilha" },
      { status: 500 }
    );
  }
}
