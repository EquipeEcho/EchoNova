import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";
import Empresa from "@/models/Empresa";
import { getChatProvider } from "@/lib/ai/providerFactory";
import { promptMiniDiagnostico } from "@/lib/prompts";

const mapeamentoPontuacao: Record<string, number> = {
  "p1-1": 4,
  "p2-1": 4,
  "p3-1": 4,
  "p4-1": 4,
  "p5-1": 4,
  "p6-1": 4,
  "p1-2": 3,
  "p2-2": 3,
  "p3-2": 3,
  "p4-2": 3,
  "p5-2": 3,
  "p6-2": 3,
  "p1-3": 2,
  "p2-3": 2,
  "p3-3": 2,
  "p4-3": 2,
  "p5-3": 2,
  "p6-3": 2,
  "p1-4": 1,
  "p2-4": 1,
  "p3-4": 1,
  "p4-4": 1,
  "p5-4": 1,
  "p6-4": 1,
};
const mapeamentoMetas: Record<string, { meta: string; trilha: string }> = {
  pergunta1: { meta: "Comunicação", trilha: "Feedback, escuta ativa" },
  pergunta2: { meta: "Liderança", trilha: "Delegação, engajamento" },
  pergunta3: { meta: "Criatividade", trilha: "Inovação incremental" },
  pergunta4: { meta: "Autogestão", trilha: "Gestão de tempo, priorização" },
  pergunta5: { meta: "Cultura & Valores", trilha: "Propósito, diversidade" },
  pergunta6: { meta: "Transversal", trilha: "LMS, microlearning" },
};
function calcularEstagio(media: number): string {
  if (media >= 3.5) return "Avançado";
  if (media >= 2.5) return "Intermediário";
  if (media >= 2.0) return "Básico";
  return "Inicial";
}

async function processarResultados(
  dimensoesSelecionadas: string[],
  respostasDimensoes: any,
) {
  const provider = getChatProvider();
  const message = `Dimensões selecionadas: ${JSON.stringify(dimensoesSelecionadas)}\nRespostas das dimensões: ${JSON.stringify(respostasDimensoes)}`;
  try {
    const response = await provider.sendMessage(message, [], promptMiniDiagnostico);
    console.log('Resposta da IA:', response);
    // The AI should return { resultados: { ... } }
    if (response && typeof response === 'object' && 'resultados' in response) {
      return response.resultados;
    } else {
      console.error('Resposta da IA não contém resultados:', response);
      throw new Error('Resposta da IA inválida');
    }
  } catch (error) {
    console.error('Erro ao processar resultados com IA:', error);
    // Fallback to fixed logic if AI fails
    console.log('Usando lógica de fallback');
    const resultadosFinais: Record<string, any> = {};
    for (const nomeDimensao of dimensoesSelecionadas) {
      const respostasDaDimensao = respostasDimensoes[nomeDimensao];
      if (!respostasDaDimensao) continue;
      const pontuacoesPerguntas = Object.entries(respostasDaDimensao).map(
        ([id, valor]) => ({
          id: id as string,
          pontuacao: mapeamentoPontuacao[valor as string] || 0,
        }),
      );
      const somaPontos = pontuacoesPerguntas.reduce(
        (acc, p) => acc + p.pontuacao,
        0,
      );
      const media =
        pontuacoesPerguntas.length > 0
          ? somaPontos / pontuacoesPerguntas.length
          : 0;
      const estagio = calcularEstagio(media);
      const trilhasDeMelhoria = pontuacoesPerguntas
        .filter((p) => p.pontuacao <= 2)
        .map((p) => mapeamentoMetas[p.id])
        .filter(Boolean);
      const sortedScores = [...pontuacoesPerguntas].sort(
        (a, b) => a.pontuacao - b.pontuacao,
      );
      const fragilidade =
        sortedScores.length > 0
          ? mapeamentoMetas[sortedScores[0].id] || null
          : null;
      const forca =
        sortedScores.length > 0
          ? mapeamentoMetas[sortedScores[sortedScores.length - 1].id] || null
          : null;
      resultadosFinais[nomeDimensao] = {
        media: parseFloat(media.toFixed(2)),
        estagio,
        trilhasDeMelhoria,
        resumoExecutivo: { forca, fragilidade },
      };
    }
    return resultadosFinais;
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const dados = await req.json();

    if (!dados.perfil || !dados.perfil.email || !dados.perfil.empresa) {
      return NextResponse.json(
        {
          error:
            "Dados de perfil incompletos. Email e nome da empresa são obrigatórios.",
        },
        { status: 400 },
      );
    }

    let empresa = await Empresa.findOne({ email: dados.perfil.email });

    if (!empresa) {
      console.log(
        `Empresa com email ${dados.perfil.email} não encontrada. Criando nova...`,
      );
      empresa = await Empresa.create({
        nome_empresa: dados.perfil.empresa, // O nome da empresa vem do campo 'empresa' do formulário
        email: dados.perfil.email,
        cnpj: `TEMP_${Date.now()}`,
        senha: "senha_placeholder",
      });
      console.log(`Nova empresa criada com ID: ${empresa._id}`);
    } else {
      console.log(`Empresa encontrada com ID: ${empresa._id}`);
    }

    const resultadosProcessados = await processarResultados(
      dados.dimensoesSelecionadas,
      dados.respostasDimensoes,
    );

    console.log('Resultados processados:', resultadosProcessados);

    // CRIAÇÃO DO DIAGNÓSTICO COM O OBJETO 'perfil' SIMPLIFICADO
    const novoDiagnostico = await Diagnostico.create({
      empresa: empresa._id,
      perfil: dados.perfil, // Agora 'dados.perfil' corresponde exatamente ao que o Schema espera
      dimensoesSelecionadas: dados.dimensoesSelecionadas,
      respostasDimensoes: dados.respostasDimensoes,
      resultados: resultadosProcessados,
      status: "concluido",
      dataProcessamento: new Date(),
    });
    console.log(`Novo diagnóstico criado com ID: ${novoDiagnostico._id}`);

    return NextResponse.json(
      {
        message: "Diagnóstico e empresa salvos com sucesso",
        diagnostico: novoDiagnostico,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("ERRO DETALHADO NO BACKEND (/api/diagnosticos):", err);
    return NextResponse.json(
      {
        error: "Ocorreu uma falha interna ao processar o diagnóstico.",
        details: err.message,
      },
      { status: 500 },
    );
  }
}

// ROTA GET (Permanece igual)
export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const empresaId = url.searchParams.get("empresaId");
    if (!empresaId) {
      return NextResponse.json(
        { error: "ID da empresa é obrigatório" },
        { status: 400 },
      );
    }
    const diagnosticos = await Diagnostico.find({ empresa: empresaId })
      .sort({ createdAt: -1 })
      .populate("empresa", "nome_empresa email");
    return NextResponse.json({ diagnosticos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
