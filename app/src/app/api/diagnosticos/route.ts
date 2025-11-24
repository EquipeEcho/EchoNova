import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";
import Empresa from "@/models/Empresa";
import { getChatProvider } from "@/lib/ai/providerFactory";
import { promptMiniDiagnostico } from "@/lib/prompts";
import bcrypt from "bcryptjs"; // --- CORREÇÃO: Importar bcryptjs ---

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

function classificarLead(
  perfil: { empresa: string; email: string; cnpj: string; setor: string; porte: string; setorOutro?: string },
  dimensoesSelecionadas: string[],
  respostasDimensoes: Record<string, Record<string, string>>
): "frio" | "morno" | "quente" {
  // Critérios para classificação de leads:
  // QUENTE: Empresas que mostram urgência e necessidade de soluções (muitas respostas negativas)
  // MORNO: Empresas com algumas necessidades identificadas
  // FRIO: Empresas que estão bem ou não mostram necessidades claras

  let pontosUrgencia = 0;
  let totalPerguntas = 0;

  // Analisa respostas negativas (opções 3 e 4 indicam problemas)
  for (const dimensao of dimensoesSelecionadas) {
    const respostas = respostasDimensoes[dimensao];
    if (!respostas) continue;

    for (const resposta of Object.values(respostas)) {
      totalPerguntas++;
      // Respostas "p*-3" e "p*-4" indicam problemas (pontuações 2 e 1)
      if (resposta.includes('-3') || resposta.includes('-4')) {
        pontosUrgencia += 2; // Peso maior para problemas graves
      } else if (resposta.includes('-2')) {
        pontosUrgencia += 1; // Peso médio para problemas moderados
      }
    }
  }

  // Critérios adicionais baseados no perfil
  const setorTecnologico = ['tecnologia', 'informática', 'software'].some(s =>
    perfil.setor.toLowerCase().includes(s) || (perfil.setorOutro || '').toLowerCase().includes(s)
  );

  const porteGrande = ['grande', '200'].some(p => perfil.porte.toLowerCase().includes(p));

  // Bônus para setores tecnológicos e empresas maiores (mais propensos a investir)
  if (setorTecnologico) pontosUrgencia += 1;
  if (porteGrande) pontosUrgencia += 1;

  // Classificação baseada nos pontos de urgência
  const percentualProblemas = totalPerguntas > 0 ? (pontosUrgencia / totalPerguntas) * 100 : 0;

  if (percentualProblemas >= 60 || pontosUrgencia >= 8) {
    return "quente"; // Muitos problemas = alta urgência = lead quente
  } else if (percentualProblemas >= 30 || pontosUrgencia >= 4) {
    return "morno"; // Alguns problemas = interesse moderado = lead morno
  } else {
    return "frio"; // Poucos problemas = baixa urgência = lead frio
  }
}

async function processarResultados(
  dimensoesSelecionadas: string[],
  respostasDimensoes: Record<string, Record<string, string>>,
) {
  const provider = getChatProvider();
  const message = `Dimensões selecionadas: ${JSON.stringify(dimensoesSelecionadas)}\nRespostas das dimensões: ${JSON.stringify(respostasDimensoes)}`;
  
  console.log('📊 [DIAGNOSTICO] Processando respostas:');
  console.log('📊 Dimensões:', dimensoesSelecionadas);
  console.log('📊 Respostas:', JSON.stringify(respostasDimensoes, null, 2));
  
  try {
    const response = await provider.sendMessage(message, [], promptMiniDiagnostico);
    console.log('🤖 [IA] Resposta completa:', JSON.stringify(response, null, 2));
    // The AI should return { resultados: { ... } }
    if (response && typeof response === 'object' && 'resultados' in response) {
      console.log('✅ [IA] Usando resultados da IA');
      return response.resultados;
    } else {
      console.error('❌ [IA] Resposta da IA não contém resultados:', response);
      throw new Error('Resposta da IA inválida');
    }
  } catch (error) {
    console.error('⚠️ [IA] Erro ao processar resultados com IA:', error);
    // Fallback to fixed logic if AI fails
    console.log('🔄 [FALLBACK] Usando lógica de fallback');
  const resultadosFinais: Record<string, unknown> = {};
    for (const nomeDimensao of dimensoesSelecionadas) {
      const respostasDaDimensao = respostasDimensoes[nomeDimensao];
      if (!respostasDaDimensao) continue;
      
      console.log(`📝 [FALLBACK] Processando dimensão: ${nomeDimensao}`);
      console.log(`📝 Respostas da dimensão:`, respostasDaDimensao);
      
      const pontuacoesPerguntas = Object.entries(respostasDaDimensao).map(
        ([id, valor]) => {
          const pontuacao = mapeamentoPontuacao[valor as string] || 0;
          console.log(`   ${id}: "${valor}" → ${pontuacao} pontos`);
          return {
            id: id as string,
            pontuacao,
          };
        },
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
      
      console.log(`📊 Soma: ${somaPontos}, Média: ${media.toFixed(2)}, Estágio: ${estagio}`);
            const trilhasDeMelhoria = pontuacoesPerguntas
        .filter((p) => p.pontuacao <= 2)
        .map((p) => {
          const meta = mapeamentoMetas[p.id];
          let explicacao = "";
          switch (p.id) {
            case "pergunta1":
              explicacao = "Problemas de comunicação levam a mal-entendidos, conflitos e baixa eficiência. Para resolver: 1) Estabeleça canais de comunicação claros e regulares; 2) Treine a equipe em técnicas de escuta ativa e feedback construtivo; 3) Use ferramentas digitais para centralizar informações. Exemplo: Empresas que implementaram reuniões diárias reduziram erros em 25%. Benefícios: Melhora a colaboração e reduz retrabalho.";
              break;
            case "pergunta2":
              explicacao = "Falta de liderança resulta em equipes desmotivadas e sem direção. Para resolver: 1) Desenvolva planos de delegação eficazes; 2) Capacite líderes em engajamento emocional; 3) Estabeleça metas compartilhadas e monitore progresso. Exemplo: Líderes treinados aumentaram o engajamento em 40%. Benefícios: Aumenta motivação e produtividade da equipe.";
              break;
            case "pergunta3":
              explicacao = "Baixa criatividade impede inovação e adaptação. Para resolver: 1) Incentive sessões de brainstorming regulares; 2) Implemente programas de inovação incremental; 3) Forneça recursos para experimentação. Exemplo: Empresas com programas de inovação lançaram 2x mais produtos. Benefícios: Gera novas ideias e vantagem competitiva.";
              break;
            case "pergunta4":
              explicacao = "Gestão de tempo ineficiente causa atrasos e estresse. Para resolver: 1) Adote técnicas de priorização como Eisenhower; 2) Use ferramentas de gestão de tarefas; 3) Treine em autogestão. Exemplo: Funcionários treinados reduziram prazos perdidos em 30%. Benefícios: Aumenta eficiência e reduz burnout.";
              break;
            case "pergunta5":
              explicacao = "Valores e cultura fracos levam a desengajamento. Para resolver: 1) Defina e comunique valores claros; 2) Promova diversidade e inclusão; 3) Alinhe ações com propósito. Exemplo: Empresas com cultura forte têm 50% menos turnover. Benefícios: Fortalece identidade e retém talentos.";
              break;
            case "pergunta6":
              explicacao = "Falta de transversalidade impede aprendizado contínuo. Para resolver: 1) Implemente LMS para treinamentos; 2) Incentive microlearning diário; 3) Crie comunidades de prática. Exemplo: Equipes com LMS aumentaram habilidades em 35%. Benefícios: Acelera desenvolvimento profissional e inovação.";
              break;
            default:
              explicacao = `Para resolver o problema em ${meta.meta}, implemente a trilha "${meta.trilha}".`;
          }
          return { ...meta, explicacao };
        })
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
      // Tenta buscar por CNPJ também
      const cnpjInformado = dados.perfil.cnpj;
      const empresaComMesmoCnpj = await Empresa.findOne({ cnpj: cnpjInformado });

      if (empresaComMesmoCnpj) {
        // ALTERADO: Usar empresa existente ao invés de bloquear
        console.log(`[API Diagnosticos] Empresa já existe com CNPJ ${cnpjInformado}, reutilizando...`);
        empresa = empresaComMesmoCnpj;
      } else {
        // Cria nova empresa
        console.log(`[API Diagnosticos] Empresa com email ${dados.perfil.email} não encontrada. Criando nova...`);
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(`temp_${Date.now()}`, salt);

        empresa = await Empresa.create({
          nome_empresa: dados.perfil.empresa,
          email: dados.perfil.email,
          cnpj: cnpjInformado || `TEMP_${Date.now()}`,
          senha: hashedPassword,
        });

        console.log(`[API Diagnosticos] Nova empresa criada com ID: ${empresa._id}`);
      }
    } else {
      console.log(`[API Diagnosticos] Empresa encontrada com ID: ${empresa._id}`);
    }

    const resultadosProcessados = await processarResultados(
      dados.dimensoesSelecionadas,
      dados.respostasDimensoes,
    );

    console.log('Resultados processados:', resultadosProcessados);

    // Classificar o lead baseado nas respostas
    const leadScore = classificarLead(
      dados.perfil,
      dados.dimensoesSelecionadas,
      dados.respostasDimensoes
    );

    console.log('Lead classificado como:', leadScore);

    // CRIAÇÃO DO DIAGNÓSTico COM O OBJETO 'perfil' SIMPLIFICADO
    const novoDiagnostico = await Diagnostico.create({
      empresa: empresa._id,
      perfil: dados.perfil, // Agora 'dados.perfil' corresponde exatamente ao que o Schema espera
      dimensoesSelecionadas: dados.dimensoesSelecionadas,
      respostasDimensoes: dados.respostasDimensoes,
      resultados: resultadosProcessados,
      status: "concluido",
      leadScore: leadScore, // Classificação do lead
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
  } catch (err: unknown) {
    console.error("ERRO DETALHADO NO BACKEND (/api/diagnosticos):", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Ocorreu uma falha interna ao processar o diagnóstico.",
        details: message,
      },
      { status: 500 },
    );
  }
}

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}