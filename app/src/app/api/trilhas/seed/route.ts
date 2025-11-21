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
      },
      {
        titulo: "Caso Prático: Transformação Cultural",
        descricao: "Análise de casos reais de sucesso",
        tipo: "atividade_pratica",
        duracao: 45,
        ordem: 4
      }
    ],
    status: "ativa",
    metadados: {
      problemasRelacionados: [
        "baixo-engajamento",
        "alta-rotatividade",
        "falta-de-pertencimento",
        "valores-desalinhados",
        "clima-ruim"
      ],
      competenciasDesenvolvidas: [
        "Gestão Cultural",
        "Engajamento de Equipes",
        "Análise Organizacional"
      ],
      resultadosEsperados: [
        "Melhoria no clima organizacional",
        "Redução de turnover",
        "Aumento do sentimento de pertencimento"
      ]
    }
  },
  {
    nome: "Inovação e Criatividade Corporativa",
    descricao: "Estimule o pensamento criativo e a inovação na sua equipe através de metodologias ágeis e design thinking.",
    tags: ["inovação", "criatividade", "design-thinking", "metodologias-ágeis", "transformação-digital"],
    areasAbordadas: ["Inovação", "Metodologias Ágeis", "Criatividade"],
    objetivos: [
      "Desenvolver mindset inovador",
      "Aplicar técnicas de design thinking",
      "Implementar processos de inovação",
      "Criar cultura de experimentação"
    ],
    duracaoEstimada: 18,
    nivel: "Avançado",
    modulos: [
      {
        titulo: "Fundamentos da Inovação",
        descricao: "Tipos de inovação e seu impacto nos negócios",
        tipo: "video",
        duracao: 50,
        url: "https://exemplo.com/inovacao1",
        ordem: 1
      },
      {
        titulo: "Design Thinking na Prática",
        descricao: "Workshop prático de design thinking",
        tipo: "atividade_pratica",
        duracao: 90,
        ordem: 2
      },
      {
        titulo: "Metodologias Ágeis",
        descricao: "Scrum, Kanban e outras metodologias",
        tipo: "video",
        duracao: 60,
        url: "https://exemplo.com/inovacao3",
        ordem: 3
      },
      {
        titulo: "Podcast: Casos de Inovação",
        descricao: "Entrevistas com inovadores de sucesso",
        tipo: "podcast",
        duracao: 40,
        url: "https://exemplo.com/inovacao4",
        ordem: 4
      }
    ],
    status: "ativa",
    metadados: {
      problemasRelacionados: [
        "falta-de-inovação",
        "processos-obsoletos",
        "resistência-mudança",
        "baixa-competitividade",
        "estagnação"
      ],
      competenciasDesenvolvidas: [
        "Pensamento Criativo",
        "Design Thinking",
        "Gestão de Inovação",
        "Metodologias Ágeis"
      ],
      resultadosEsperados: [
        "Aumento de inovações implementadas",
        "Melhoria em processos",
        "Cultura de experimentação estabelecida"
      ]
    }
  },
  {
    nome: "Comunicação Corporativa Efetiva",
    descricao: "Aprimore as habilidades de comunicação interna e externa, incluindo apresentações, negociação e comunicação digital.",
    tags: ["comunicação", "apresentações", "negociação", "comunicação-digital", "oratória"],
    areasAbordadas: ["Comunicação", "Negociação", "Oratória"],
    objetivos: [
      "Desenvolver comunicação clara e objetiva",
      "Melhorar habilidades de apresentação",
      "Dominar técnicas de negociação",
      "Otimizar comunicação digital"
    ],
    duracaoEstimada: 12,
    nivel: "Iniciante",
    modulos: [
      {
        titulo: "Fundamentos da Comunicação",
        descricao: "Princípios básicos da comunicação efetiva",
        tipo: "video",
        duracao: 35,
        url: "https://exemplo.com/com1",
        ordem: 1
      },
      {
        titulo: "Técnicas de Apresentação",
        descricao: "Como criar e apresentar de forma impactante",
        tipo: "video",
        duracao: 45,
        url: "https://exemplo.com/com2",
        ordem: 2
      },
      {
        titulo: "Negociação Ganha-Ganha",
        descricao: "Estratégias de negociação colaborativa",
        tipo: "texto",
        duracao: 30,
        conteudo: "# Negociação\n\nTécnicas e estratégias...",
        ordem: 3
      },
      {
        titulo: "Teste de Comunicação",
        descricao: "Avalie suas habilidades comunicativas",
        tipo: "avaliacao",
        duracao: 15,
        ordem: 4
      }
    ],
    status: "ativa",
    metadados: {
      problemasRelacionados: [
        "comunicação-ineficaz",
        "ruídos-comunicação",
        "baixa-clareza",
        "conflitos-comunicação",
        "apresentações-fracas"
      ],
      competenciasDesenvolvidas: [
        "Comunicação Verbal",
        "Comunicação Escrita",
        "Oratória",
        "Negociação"
      ],
      resultadosEsperados: [
        "Melhoria na clareza comunicativa",
        "Redução de ruídos",
        "Apresentações mais efetivas"
      ]
    }
  },
  {
    nome: "Gestão de Performance e Resultados",
    descricao: "Aprenda a definir metas, acompanhar KPIs e gerir a performance individual e coletiva para alcançar resultados extraordinários.",
    tags: ["gestão-performance", "kpis", "metas", "resultados", "indicadores", "produtividade"],
    areasAbordadas: ["Gestão de Performance", "Indicadores", "Produtividade"],
    objetivos: [
      "Definir metas SMART",
      "Criar e acompanhar KPIs relevantes",
      "Implementar cultura de performance",
      "Realizar avaliações de desempenho efetivas"
    ],
    duracaoEstimada: 16,
    nivel: "Intermediário",
    modulos: [
      {
        titulo: "Gestão por Resultados",
        descricao: "Fundamentos e benefícios da gestão orientada a resultados",
        tipo: "video",
        duracao: 40,
        url: "https://exemplo.com/perf1",
        ordem: 1
      },
      {
        titulo: "KPIs e Indicadores",
        descricao: "Como definir e acompanhar indicadores de performance",
        tipo: "video",
        duracao: 55,
        url: "https://exemplo.com/perf2",
        ordem: 2
      },
      {
        titulo: "Metas SMART",
        descricao: "Metodologia para definição de metas efetivas",
        tipo: "atividade_pratica",
        duracao: 45,
        ordem: 3
      },
      {
        titulo: "Avaliação de Performance",
        descricao: "Técnicas de avaliação e feedback",
        tipo: "video",
        duracao: 50,
        url: "https://exemplo.com/perf4",
        ordem: 4
      }
    ],
    status: "ativa",
    metadados: {
      problemasRelacionados: [
        "baixa-produtividade",
        "falta-de-metas",
        "resultados-insatisfatórios",
        "falta-de-acompanhamento",
        "desempenho-baixo"
      ],
      competenciasDesenvolvidas: [
        "Gestão de Performance",
        "Definição de Metas",
        "Análise de Indicadores",
        "Avaliação de Desempenho"
      ],
      resultadosEsperados: [
        "Melhoria na produtividade",
        "Alcance de metas estabelecidas",
        "Cultura de alta performance"
      ]
    }
  },
  {
    nome: "Diversidade e Inclusão no Ambiente de Trabalho",
    descricao: "Construa um ambiente de trabalho mais inclusivo e diverso, promovendo respeito, equidade e aproveitamento de diferentes perspectivas.",
    tags: ["diversidade", "inclusão", "equidade", "respeito", "viés-inconsciente", "dei"],
    areasAbordadas: ["Diversidade e Inclusão", "Cultura Organizacional", "Ética"],
    objetivos: [
      "Compreender conceitos de D&I",
      "Identificar vieses inconscientes",
      "Implementar práticas inclusivas",
      "Promover equidade no ambiente de trabalho"
    ],
    duracaoEstimada: 10,
    nivel: "Iniciante",
    modulos: [
      {
        titulo: "Fundamentos de D&I",
        descricao: "O que é diversidade e inclusão e por que importa",
        tipo: "video",
        duracao: 35,
        url: "https://exemplo.com/dei1",
        ordem: 1
      },
      {
        titulo: "Vieses Inconscientes",
        descricao: "Identificando e combatendo vieses",
        tipo: "video",
        duracao: 40,
        url: "https://exemplo.com/dei2",
        ordem: 2
      },
      {
        titulo: "Práticas Inclusivas",
        descricao: "Como criar um ambiente mais inclusivo",
        tipo: "texto",
        duracao: 25,
        conteudo: "# Práticas Inclusivas\n\nGuia prático...",
        ordem: 3
      },
      {
        titulo: "Autoavaliação D&I",
        descricao: "Avalie seu conhecimento sobre diversidade",
        tipo: "avaliacao",
        duracao: 20,
        ordem: 4
      }
    ],
    status: "ativa",
    metadados: {
      problemasRelacionados: [
        "falta-diversidade",
        "ambiente-exclusivo",
        "discriminação",
        "vieses-decisórios",
        "baixa-representatividade"
      ],
      competenciasDesenvolvidas: [
        "Consciência sobre D&I",
        "Gestão Inclusiva",
        "Combate a Vieses",
        "Promoção de Equidade"
      ],
      resultadosEsperados: [
        "Ambiente mais inclusivo",
        "Maior diversidade de perspectivas",
        "Redução de discriminação"
      ]
    }
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
