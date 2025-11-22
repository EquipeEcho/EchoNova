import { NextResponse } from "next/server";
import Diagnostico from "@/models/Diagnostico";
import { connectDB } from "@/lib/mongodb";

// Função auxiliar para datas
function getDateRange() {
  const now = new Date();

  // Mês atual
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Mês anterior
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  return {
    startOfCurrentMonth,
    endOfCurrentMonth,
    startOfLastMonth,
    endOfLastMonth,
  };
}

export async function GET() {
  try {
    await connectDB();

    const {
      startOfCurrentMonth,
      endOfCurrentMonth,
      startOfLastMonth,
      endOfLastMonth,
    } = getDateRange();

    // ================================
    //  AGGREGATION ÚNICO
    // ================================
    const result = await Diagnostico.aggregate([
      {
        $facet: {
          diagnosticosMesAtual: [
            {
              $match: {
                createdAt: {
                  $gte: startOfCurrentMonth,
                  $lte: endOfCurrentMonth,
                },
              },
            },
            { $count: "total" },
          ],

          diagnosticosMesAnterior: [
            {
              $match: {
                createdAt: {
                  $gte: startOfLastMonth,
                  $lte: endOfLastMonth,
                },
              },
            },
            { $count: "total" },
          ],

          empresasMesAtual: [
            {
              $match: {
                createdAt: {
                  $gte: startOfCurrentMonth,
                  $lte: endOfCurrentMonth,
                },
              },
            },
            { $group: { _id: "$empresa" } },
            { $count: "total" },
          ],

          empresasMesAnterior: [
            {
              $match: {
                createdAt: {
                  $gte: startOfLastMonth,
                  $lte: endOfLastMonth,
                },
              },
            },
            { $group: { _id: "$empresa" } },
            { $count: "total" },
          ],

          historicoMensal: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                total: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],

          distribuicaoDimensoes: [
            { $unwind: "$dimensoesSelecionadas" },
            {
              $group: {
                _id: "$dimensoesSelecionadas",
                total: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
          ],
        },
      },
    ]);

    // Extração dos dados
    const data = result[0];

    const totalAtual = data.diagnosticosMesAtual[0]?.total || 0;
    const totalAnterior = data.diagnosticosMesAnterior[0]?.total || 0;

    const empresasAtual = data.empresasMesAtual[0]?.total || 0;
    const empresasAnterior = data.empresasMesAnterior[0]?.total || 0;

    // Crescimento (%)
    const growth =
      totalAnterior === 0
        ? 100
        : ((totalAtual - totalAnterior) / totalAnterior) * 100;

    // Retenção de empresas (%)
    const retention =
      empresasAnterior === 0
        ? 100
        : (empresasAtual / empresasAnterior) * 100;

    return NextResponse.json({
      ok: true,

      diagnosticos: {
        atual: totalAtual,
        anterior: totalAnterior,
        crescimentoPercentual: Number(growth.toFixed(2)),
      },

      empresas: {
        atual: empresasAtual,
        anterior: empresasAnterior,
        retencaoPercentual: Number(retention.toFixed(2)),
      },

      historicoMensal: data.historicoMensal.map((m:any) => ({
        year: m._id.year,
        month: m._id.month,
        total: m.total,
      })),

      distribuicaoDimensoes: data.distribuicaoDimensoes.map((d:any) => ({
        dimensao: d._id,
        total: d.total,
      })),
    });
  } catch (err) {
    console.error("Erro ao buscar métricas:", err);
    return NextResponse.json(
      { ok: false, error: "Erro ao buscar métricas", detalhes: err },
      { status: 500 }
    );
  }
}
