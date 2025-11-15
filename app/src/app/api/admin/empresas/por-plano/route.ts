import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";
import { authenticateAndAuthorize } from "@/lib/middleware/authMiddleware";

/**
 * @description Rota para buscar o número de empresas por plano.
 * Usada para gerar gráficos no dashboard de administração.
 */
export async function GET(request: Request) {
  try {
    // Verificar autenticação e permissão de administrador
    const authResult = await authenticateAndAuthorize(request as any, "ADMIN");
    
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();
    
    // Agregação para contar empresas por plano
    const resultado = await Empresa.aggregate([
      {
        $group: {
          _id: "$planoAtivo",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Formatar os dados para o gráfico
    const dadosFormatados = resultado.map(item => ({
      plano: item._id || "Sem plano",
      count: item.count
    }));

    return NextResponse.json({ success: true, data: dadosFormatados });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}