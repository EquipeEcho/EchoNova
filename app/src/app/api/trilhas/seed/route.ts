import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trilha from "@/models/Trilha";
import { authenticateAndAuthorize } from "@/lib/middleware/authMiddleware";

// Trilhas de exemplo (mocks) — 3 por categoria com cobertura dos níveis
const trilhasMock = [
  // Comunicação
  {
    nome: "Comunicação Corporativa Efetiva",
    descricao: "Aprimore a comunicação interna e externa com técnicas práticas.",
    categoria: "Comunicação",
    tags: ["comunicação", "apresentações", "negociação", "oratória"],
    areasAbordadas: ["Comunicação", "Negociação", "Oratória"],
    objetivos: [
      "Desenvolver comunicação clara e objetiva",
      "Melhorar habilidades de apresentação",
      "Dominar técnicas de negociação"
    ],
    duracaoEstimada: 12,
    nivel: "Iniciante",
    modulos: [
      { titulo: "Fundamentos da Comunicação", descricao: "Princípios básicos", tipo: "video", duracao: 35, ordem: 1 },
      { titulo: "Técnicas de Apresentação", descricao: "Como apresentar bem", tipo: "video", duracao: 45, ordem: 2 },
      { titulo: "Negociação Ganha-Ganha", descricao: "Estratégias", tipo: "texto", duracao: 30, ordem: 3 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["comunicação-ineficaz", "ruídos-comunicação"], competenciasDesenvolvidas: ["Comunicação Verbal", "Negociação"], resultadosEsperados: ["Clareza comunicativa"] }
  },
  {
    nome: "Comunicação Assertiva para Times",
    descricao: "Reduza ruídos e aumente a assertividade entre áreas.",
    categoria: "Comunicação",
    tags: ["comunicação", "feedback", "alinhamento"],
    areasAbordadas: ["Comunicação", "Gestão de Conflitos"],
    objetivos: ["Aplicar feedback construtivo", "Estruturar mensagens claras", "Definir canais"],
    duracaoEstimada: 16,
    nivel: "Intermediário",
    modulos: [
      { titulo: "Canais e Ritmos", descricao: "Rotinas de comunicação", tipo: "video", duracao: 40, ordem: 1 },
      { titulo: "Feedback 360º", descricao: "Prática guiada", tipo: "atividade_pratica", duracao: 45, ordem: 2 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["baixa-clareza", "alinhamento-fraco"], competenciasDesenvolvidas: ["Feedback", "Comunicação"], resultadosEsperados: ["Menos retrabalho"] }
  },
  {
    nome: "Comunicação Estratégica e Influência",
    descricao: "Desenvolva narrativas e influencie decisões corporativas.",
    categoria: "Comunicação",
    tags: ["comunicação", "influência", "storytelling"],
    areasAbordadas: ["Comunicação", "Estratégia"],
    objetivos: ["Storytelling executivo", "Pitch de projetos", "Influência sem autoridade"],
    duracaoEstimada: 20,
    nivel: "Avançado",
    modulos: [
      { titulo: "Storytelling", descricao: "Estruturas e casos", tipo: "video", duracao: 50, ordem: 1 },
      { titulo: "Influência Prática", descricao: "Laboratório", tipo: "atividade_pratica", duracao: 60, ordem: 2 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["decisões-lentas", "baixa-aderência"], competenciasDesenvolvidas: ["Apresentação", "Influência"], resultadosEsperados: ["Aprovação de propostas"] }
  },

  // Gestão de Tempo
  {
    nome: "Fundamentos de Gestão de Tempo",
    descricao: "Organize seu dia com foco e priorização.",
    categoria: "Gestão de Tempo",
    tags: ["tempo", "priorização", "produtividade"],
    areasAbordadas: ["Produtividade"],
    objetivos: ["Matriz Eisenhower", "Time blocking", "Higiene digital"],
    duracaoEstimada: 8,
    nivel: "Iniciante",
    modulos: [
      { titulo: "Prioridades", descricao: "Eisenhower", tipo: "video", duracao: 30, ordem: 1 },
      { titulo: "Agenda", descricao: "Time blocking", tipo: "atividade_pratica", duracao: 30, ordem: 2 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["atrasos", "procrastinação"], competenciasDesenvolvidas: ["Gestão do tempo"], resultadosEsperados: ["Cumprimento de prazos"] }
  },
  {
    nome: "Produtividade de Times",
    descricao: "Fluxos, WIP e cerimônias para equipes.",
    categoria: "Gestão de Tempo",
    tags: ["fluxo", "wip", "cerimônias"],
    areasAbordadas: ["Produtividade", "Processos"],
    objetivos: ["Limite WIP", "Daily efetiva", "Quadros visuais"],
    duracaoEstimada: 14,
    nivel: "Intermediário",
    modulos: [
      { titulo: "WIP e Fluxo", descricao: "Teoria das filas", tipo: "video", duracao: 40, ordem: 1 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["fila-acumulada", "atrasos"], competenciasDesenvolvidas: ["Gestão de fluxo"], resultadosEsperados: ["Lead time menor"] }
  },
  {
    nome: "Alta Performance Pessoal",
    descricao: "Rotinas e métricas para resultados superiores.",
    categoria: "Gestão de Tempo",
    tags: ["hábitos", "otimização", "foco"],
    areasAbordadas: ["Produtividade"],
    objetivos: ["KPIs pessoais", "Rotinas de energia", "Proteção de foco"],
    duracaoEstimada: 18,
    nivel: "Avançado",
    modulos: [
      { titulo: "Rotinas", descricao: "Energia e foco", tipo: "video", duracao: 50, ordem: 1 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["baixa-produtividade"], competenciasDesenvolvidas: ["Autogestão"], resultadosEsperados: ["Mais entregas"] }
  },

  // Inovação
  {
    nome: "Introdução à Inovação",
    descricao: "Conceitos e exemplos práticos para iniciar.",
    categoria: "Inovação",
    tags: ["inovação", "cases"],
    areasAbordadas: ["Inovação"],
    objetivos: ["Tipos de inovação", "Ciclo de vida"],
    duracaoEstimada: 10,
    nivel: "Iniciante",
    modulos: [
      { titulo: "Panorama", descricao: "Cenário e tipos", tipo: "video", duracao: 35, ordem: 1 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["estagnação"], competenciasDesenvolvidas: ["Mindset inovador"], resultadosEsperados: ["Pipelines criados"] }
  },
  {
    nome: "Design Thinking na Prática",
    descricao: "Oficinas e validações centradas no usuário.",
    categoria: "Inovação",
    tags: ["design-thinking", "prototipagem"],
    areasAbordadas: ["Inovação", "Produto"],
    objetivos: ["Descoberta", "Prototipagem", "Teste"],
    duracaoEstimada: 16,
    nivel: "Intermediário",
    modulos: [
      { titulo: "Descoberta", descricao: "Entrevistas", tipo: "atividade_pratica", duracao: 60, ordem: 1 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["baixa-competitividade"], competenciasDesenvolvidas: ["DT"], resultadosEsperados: ["Hipóteses validadas"] }
  },
  {
    nome: "Portfólio de Inovação",
    descricao: "Estruture e priorize iniciativas de impacto.",
    categoria: "Inovação",
    tags: ["OKR", "priorização", "portfólio"],
    areasAbordadas: ["Estratégia", "Inovação"],
    objetivos: ["Mapa de iniciativas", "Medição de valor"],
    duracaoEstimada: 22,
    nivel: "Avançado",
    modulos: [
      { titulo: "Portfólio", descricao: "Balanceamento", tipo: "video", duracao: 55, ordem: 1 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["recursos-mal-alocados"], competenciasDesenvolvidas: ["Gestão de portfólio"], resultadosEsperados: ["ROI de inovação"] }
  },

  // Liderança
  {
    nome: "Comunicação para Líderes Iniciantes",
    descricao: "Base de liderança e comunicação com o time.",
    categoria: "Liderança",
    tags: ["liderança", "comunicação"],
    areasAbordadas: ["Liderança", "Comunicação"],
    objetivos: ["1:1 efetivo", "acordos de trabalho"],
    duracaoEstimada: 10,
    nivel: "Iniciante",
    modulos: [
      { titulo: "Primeiros 90 dias", descricao: "Plano de entrada", tipo: "video", duracao: 30, ordem: 1 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["baixa-liderança"], competenciasDesenvolvidas: ["Gestão de pessoas"], resultadosEsperados: ["Clareza de papéis"] }
  },
  {
    nome: "Liderança Transformadora",
    descricao: "Gestão de equipes, conflitos e decisões.",
    categoria: "Liderança",
    tags: ["liderança", "gestão", "decisão"],
    areasAbordadas: ["Liderança", "Gestão de Pessoas"],
    objetivos: ["Feedback", "Conflitos", "Decisão"],
    duracaoEstimada: 20,
    nivel: "Intermediário",
    modulos: [
      { titulo: "Estilos de liderança", descricao: "Situacional", tipo: "video", duracao: 45, ordem: 1 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["conflitos-internos"], competenciasDesenvolvidas: ["Tomada de decisão"], resultadosEsperados: ["Menos conflitos"] }
  },
  {
    nome: "Liderança Estratégica",
    descricao: "Direção, governança e resultados.",
    categoria: "Liderança",
    tags: ["estratégia", "governança"],
    areasAbordadas: ["Liderança", "Estratégia"],
    objetivos: ["North star", "Cascata de metas", "Governança"],
    duracaoEstimada: 24,
    nivel: "Avançado",
    modulos: [
      { titulo: "Direcionamento", descricao: "Visão e metas", tipo: "texto", duracao: 40, ordem: 1 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["falta-de-direcionamento"], competenciasDesenvolvidas: ["Planejamento"], resultadosEsperados: ["Alinhamento"] }
  },

  // Diversidade
  {
    nome: "Introdução à Diversidade e Inclusão",
    descricao: "Conceitos fundamentais e boas práticas.",
    categoria: "Diversidade",
    tags: ["diversidade", "inclusão"],
    areasAbordadas: ["Diversidade e Inclusão", "Cultura"],
    objetivos: ["Conceitos", "Benefícios", "Primeiros passos"],
    duracaoEstimada: 8,
    nivel: "Iniciante",
    modulos: [
      { titulo: "Fundamentos de D&I", descricao: "Por que importa", tipo: "video", duracao: 35, ordem: 1 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["ambiente-exclusivo"], competenciasDesenvolvidas: ["Consciência D&I"], resultadosEsperados: ["Sensibilização"] }
  },
  {
    nome: "Práticas Inclusivas no Dia a Dia",
    descricao: "Ferramentas para reduzir vieses e incluir mais.",
    categoria: "Diversidade",
    tags: ["viés", "equidade"],
    areasAbordadas: ["Diversidade e Inclusão"],
    objetivos: ["Vieses", "Políticas inclusivas", "Canais seguros"],
    duracaoEstimada: 14,
    nivel: "Intermediário",
    modulos: [
      { titulo: "Vieses Inconscientes", descricao: "Identificar e agir", tipo: "video", duracao: 40, ordem: 1 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["discriminação"], competenciasDesenvolvidas: ["Gestão Inclusiva"], resultadosEsperados: ["Ambiente seguro"] }
  },
  {
    nome: "Estratégia de D&I para Líderes",
    descricao: "Planeje e governe iniciativas de D&I sustentáveis.",
    categoria: "Diversidade",
    tags: ["estratégia", "governança", "indicadores"],
    areasAbordadas: ["Diversidade e Inclusão", "Estratégia"],
    objetivos: ["Metas e indicadores", "Patrocínio executivo"],
    duracaoEstimada: 18,
    nivel: "Avançado",
    modulos: [
      { titulo: "Plano de D&I", descricao: "Roadmap e KPIs", tipo: "texto", duracao: 45, ordem: 1 }
    ],
    status: "ativa",
    metadados: { problemasRelacionados: ["baixa-representatividade"], competenciasDesenvolvidas: ["Gestão de D&I"], resultadosEsperados: ["Metas atingidas"] }
  }
];

// POST - Popular banco com trilhas de exemplo
export async function POST(req: Request) {
  try {
    // Autenticar e autorizar como admin
    const authResult = await authenticateAndAuthorize(req as any, "ADMIN");
    if (!authResult.isAuthorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();

    // Limpar índices problemáticos (arrays paralelos)
    try {
      const Trilha = (await import("@/models/Trilha")).default;
      const collection = Trilha.collection;
      const indexes = await collection.indexes();
      
      for (const index of indexes) {
        const keys = Object.keys(index.key);
        // Remover índice composto com múltiplos arrays
        if (keys.includes('tags') && keys.includes('areasAbordadas')) {
          if (index.name) {
            await collection.dropIndex(index.name);
            console.log(`Índice problemático removido: ${index.name}`);
          }
        }
      }
    } catch (indexError) {
      console.log('Verificação de índices:', indexError instanceof Error ? indexError.message : 'OK');
    }

    // Ler parâmetro force do corpo da requisição
    let force = false;
    try {
      const body = await req.json();
      force = body.force === true;
    } catch {
      // Se não houver body ou não for JSON, continua com force = false
    }

    // Verificar se já existem trilhas
    const count = await Trilha.countDocuments();
    
    if (count > 0 && !force) {
      return NextResponse.json(
        { 
          message: `Banco já possui ${count} trilhas cadastradas. Use force=true para adicionar mais.`,
          count 
        },
        { status: 200 }
      );
    }

    // Inserir trilhas de exemplo
    const trilhasCriadas = await Trilha.insertMany(trilhasMock);

    return NextResponse.json(
      { 
        message: `${trilhasCriadas.length} trilhas de exemplo criadas com sucesso! Total agora: ${count + trilhasCriadas.length}`,
        trilhas: trilhasCriadas 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao popular trilhas:", error);
    return NextResponse.json(
      { error: "Erro ao popular trilhas de exemplo" },
      { status: 500 }
    );
  }
}
