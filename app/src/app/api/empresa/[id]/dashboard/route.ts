import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Funcionario from "@/models/Funcionario";
import Trilha from "@/models/Trilha";
import Empresa from "@/models/Empresa";

interface DashboardMetrics {
  updatedAt: string;
  progressoMedioPercent: number;
  horasEstudadasTotal: number;
  totalFuncionarios: number;
  totalTrilhasAtivas: number;
  totalTrilhasConcluidas: number;
  totalTrilhasEmpresa: number;
  objetivosConcluidosPercent: number;
  trilhasPorCategoria: { categoria: string; total: number; concluidas: number; emAndamento: number; pendentes: number }[];
  categoriaDistribuicao: { categoria: string; percentual: number }[];
  categoriasAssociadas: string[];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID da empresa não fornecido" }, { status: 400 });
    }

    const empresa = await Empresa.findById(id).select("_id categoriasAssociadas");
    if (!empresa) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    // Buscar funcionários da empresa e popular trilhas concluídas
    const funcionarios = await Funcionario.find({ empresa: id })
      .populate({ path: "trilhas.trilha", model: Trilha })
      .populate({ path: "trilhasConcluidas.trilha", model: Trilha });

    const totalFuncionarios = funcionarios.length;
    let totalTrilhasConcluidas = 0;
    let totalTrilhasAssociadas = 0;
    let horasEstudadasTotal = 0;

    const trilhasSet = new Set<string>();
    const trilhaConclusaoCount: Record<string, number> = {};
    
    // Maps para categorias
    const categoriaMap: Record<string, { total: number; concluidas: number; emAndamento: number; pendentes: number }> = {};

    for (const f of funcionarios) {
      const concluidas = f.trilhasConcluidas || [];
      const ativas = f.trilhas || [];

      totalTrilhasConcluidas += concluidas.length;
      totalTrilhasAssociadas += concluidas.length + ativas.length;

      // Processar trilhas ativas
      for (const ta of ativas) {
        const trilhaDoc: any = ta.trilha;
        if (trilhaDoc && trilhaDoc._id) {
          const idStr = trilhaDoc._id.toString();
          trilhasSet.add(idStr);
          
          const categoria = trilhaDoc.categoria || "Sem Categoria";
          if (!categoriaMap[categoria]) {
            categoriaMap[categoria] = { total: 0, concluidas: 0, emAndamento: 0, pendentes: 0 };
          }
          categoriaMap[categoria].total += 1;
          
          if (ta.status === "em_andamento") {
            categoriaMap[categoria].emAndamento += 1;
          } else {
            categoriaMap[categoria].pendentes += 1;
          }
        }
      }
      
      // Processar trilhas concluídas
      for (const tc of concluidas) {
        const trilhaDoc: any = tc.trilha;
        if (trilhaDoc && trilhaDoc._id) {
          const idStr = trilhaDoc._id.toString();
          trilhasSet.add(idStr);
          trilhaConclusaoCount[idStr] = (trilhaConclusaoCount[idStr] || 0) + 1;
          
          const categoria = trilhaDoc.categoria || "Sem Categoria";
          if (!categoriaMap[categoria]) {
            categoriaMap[categoria] = { total: 0, concluidas: 0, emAndamento: 0, pendentes: 0 };
          }
          categoriaMap[categoria].total += 1;
          categoriaMap[categoria].concluidas += 1;
        }
        
        if (trilhaDoc && typeof trilhaDoc.duracaoEstimada === "number") {
          horasEstudadasTotal += trilhaDoc.duracaoEstimada;
        }
      }
    }

    const progressoMedioPercent = totalTrilhasAssociadas > 0
      ? parseFloat(((totalTrilhasConcluidas / totalTrilhasAssociadas) * 100).toFixed(2))
      : 0;

    const totalTrilhasEmpresa = trilhasSet.size;

    let objetivosConcluidosPercent = 0;
    if (totalFuncionarios > 0 && totalTrilhasEmpresa > 0) {
      let somaFractions = 0;
      for (const trilhaId of trilhasSet) {
        const concluidos = trilhaConclusaoCount[trilhaId] || 0;
        somaFractions += concluidos / totalFuncionarios;
      }
      objetivosConcluidosPercent = parseFloat(((somaFractions / totalTrilhasEmpresa) * 100).toFixed(2));
    }

    // Preparar dados dos gráficos
    // Filtrar categorias pelo que está associado na empresa (se houver)
    const categoriasAssoc = (empresa.categoriasAssociadas || []).map((c: any) => c.categoria);
    const filtroPorEmpresaAtivo = categoriasAssoc.length > 0;

    const trilhasPorCategoria = Object.entries(categoriaMap)
      .filter(([categoria]) => !filtroPorEmpresaAtivo || categoriasAssoc.includes(categoria))
      .map(([categoria, dados]) => ({
      categoria,
      total: dados.total,
      concluidas: dados.concluidas,
      emAndamento: dados.emAndamento,
      pendentes: dados.pendentes,
    }));

    const categoriaDistribuicao = Object.entries(categoriaMap)
      .filter(([categoria]) => !filtroPorEmpresaAtivo || categoriasAssoc.includes(categoria))
      .map(([categoria, dados]) => {
      const percentual = totalTrilhasAssociadas > 0 
        ? parseFloat(((dados.total / totalTrilhasAssociadas) * 100).toFixed(2))
        : 0;
      return { categoria, percentual };
    });

    const metrics: DashboardMetrics = {
      updatedAt: new Date().toISOString(),
      progressoMedioPercent,
      horasEstudadasTotal,
      totalFuncionarios,
      totalTrilhasAtivas: totalTrilhasAssociadas - totalTrilhasConcluidas,
      totalTrilhasConcluidas,
      totalTrilhasEmpresa,
      objetivosConcluidosPercent,
      trilhasPorCategoria,
      categoriaDistribuicao,
      categoriasAssociadas: categoriasAssoc,
    };

    return NextResponse.json(metrics, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao calcular métricas do dashboard:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao calcular métricas" },
      { status: 500 }
    );
  }
}
