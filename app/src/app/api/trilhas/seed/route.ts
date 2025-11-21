import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Trilha from "@/models/Trilha";
import { authenticateAndAuthorize } from "@/lib/middleware/authMiddleware";

// Trilhas de exemplo (mocks)
const trilhasMock = [
  {
    nome: "Liderança Transformadora",
    descricao: "Desenvolva competências essenciais de liderança moderna, focando em gestão de equipes, comunicação efetiva e tomada de decisões estratégicas.",
    tags: ["liderança", "gestão", "comunicação", "tomada-de-decisão", "desenvolvimento-gerencial"],
    areasAbordadas: ["Liderança", "Gestão de Pessoas", "Comunicação"],
    objetivos: [
      "Desenvolver habilidades de comunicação assertiva",
      "Aprender técnicas de gestão de conflitos",
      "Fortalecer a capacidade de tomada de decisão",
      "Criar estratégias de motivação de equipes"
    ],
    duracaoEstimada: 20,
    nivel: "Intermediário",
    modulos: [
      {
        titulo: "Fundamentos da Liderança Moderna",
        descricao: "Introdução aos conceitos de liderança transformadora e situacional",
        tipo: "video",
        duracao: 45,
        url: "https://exemplo.com/modulo1",
        ordem: 1
      },
      {
        titulo: "Comunicação Efetiva para Líderes",
        descricao: "Técnicas de comunicação assertiva e feedback construtivo",
        tipo: "video",
        duracao: 60,
        url: "https://exemplo.com/modulo2",
        ordem: 2
      },
      {
        titulo: "Gestão de Conflitos",
        descricao: "Estratégias para mediação e resolução de conflitos",
        tipo: "podcast",
        duracao: 30,
        url: "https://exemplo.com/modulo3",
        ordem: 3
      },
      {
        titulo: "Avaliação de Liderança",
        descricao: "Teste seus conhecimentos adquiridos",
        tipo: "avaliacao",
        duracao: 20,
        ordem: 4
      }
    ],
    status: "ativa",
    metadados: {
      problemasRelacionados: [
        "baixa-produtividade",
        "falta-de-liderança",
        "comunicação-ineficaz",
        "conflitos-internos",
        "baixo-engajamento"
      ],
      competenciasDesenvolvidas: [
        "Liderança",
        "Comunicação",
        "Gestão de Conflitos",
        "Tomada de Decisão"
      ],
      resultadosEsperados: [
        "Melhoria na comunicação interna",
        "Redução de conflitos",
        "Aumento do engajamento da equipe"
      ]
    }
  },
  {
    nome: "Cultura Organizacional e Engajamento",
    descricao: "Aprenda a construir e fortalecer uma cultura organizacional sólida que promova engajamento, pertencimento e alta performance.",
    tags: ["cultura-organizacional", "engajamento", "valores", "clima-organizacional", "retenção-talentos"],
    areasAbordadas: ["Cultura Organizacional", "Gestão de Pessoas", "Engajamento"],
    objetivos: [
      "Compreender os pilares de uma cultura forte",
      "Identificar gaps culturais na organização",
      "Implementar práticas de engajamento",
      "Alinhar valores individuais aos organizacionais"
    ],
    duracaoEstimada: 15,
    nivel: "Intermediário",
    modulos: [
      {
        titulo: "O que é Cultura Organizacional",
        descricao: "Conceitos fundamentais e importância estratégica",
        tipo: "video",
        duracao: 40,
        url: "https://exemplo.com/cultura1",
        ordem: 1
      },
      {
        titulo: "Diagnóstico de Clima Organizacional",
        descricao: "Ferramentas e metodologias para avaliação",
        tipo: "texto",
        duracao: 30,
        conteudo: "# Diagnóstico de Clima\n\nConteúdo educacional sobre como diagnosticar...",
        ordem: 2
      },
      {
        titulo: "Estratégias de Engajamento",
        descricao: "Práticas efetivas para aumentar o engajamento",
        tipo: "video",
        duracao: 50,
        url: "https://exemplo.com/cultura3",
        ordem: 3
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
