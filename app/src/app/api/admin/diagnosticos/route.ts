import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";
import { authenticateAndAuthorize } from "@/lib/middleware/authMiddleware";

/**
 * @description Rota para buscar todos os diagnósticos.
 * Popula o nome da empresa para exibição na tabela de administração.
 */
export async function GET(request: Request) {
  try {
    // Autenticar e autorizar como admin
    const authResult = await authenticateAndAuthorize(request as any, "ADMIN");
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();
    const diagnosticos = await Diagnostico.find({})
      .populate({
        path: "empresa",
        select: "nome_empresa email cnpj",
        options: { strictPopulate: false } // Permite população mesmo se a referência estiver quebrada
      })
      .sort({ createdAt: -1 }); // Ordena pelos mais recentes
      
    return NextResponse.json({ success: true, data: diagnosticos });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}