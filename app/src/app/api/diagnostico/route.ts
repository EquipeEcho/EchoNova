// src/app/api/diagnostico/route.ts

import { NextResponse } from "next/server";

// ============================================================================
// TIPOS E INTERFACES
// Definir a estrutura dos nossos dados torna o código mais seguro e fácil de entender.
// ============================================================================

interface MetaTrilha {
  meta: string;
  trilha: string;
}

interface PontuacaoPergunta {
  id: string;
  pontuacao: number;
}

// ============================================================================
// MAPEAMENTOS DE NEGÓCIO (O "CÉREBRO" DO DIAGNÓSTICO)
// Esta seção traduz as regras de negócio dos manuais em estruturas de dados.
// ============================================================================

/**
 * Mapeia o valor da resposta (ex: "p1-1") para uma pontuação numérica de 1 a 4.
 * Conforme o "Manual Técnico 1", 4 é a melhor pontuação e 1 é a pior.
 */
const mapeamentoPontuacao: Record<string, number> = {
    "p1-1": 4, "p2-1": 4, "p3-1": 4, "p4-1": 4, "p5-1": 4, "p6-1": 4, // Estágio Avançado
    "p1-2": 3, "p2-2": 3, "p3-2": 3, "p4-2": 3, "p5-2": 3, "p6-2": 3, // Bom, com falhas
    "p1-3": 2, "p2-3": 2, "p3-3": 2, "p4-3": 2, "p5-3": 2, "p6-3": 2, // Frágil
    "p1-4": 1, "p2-4": 1, "p3-4": 1, "p4-4": 1, "p5-4": 1, "p6-4": 1, // Problemático
};

/**
 * Mapeia o ID de cada pergunta à sua "Meta de Soft Skill" e "Trilha de Melhoria" correspondente.
 * Esta estrutura é a base para as recomendações personalizadas.
 * NOTA: Este mapeamento é genérico para todas as dimensões, conforme a simplificação do manual.
 */
const mapeamentoMetas: Record<string, MetaTrilha> = {
    'pergunta1': { meta: "Comunicação", trilha: "Feedback, escuta ativa" },
    'pergunta2': { meta: "Liderança", trilha: "Delegação, engajamento" },
    'pergunta3': { meta: "Criatividade", trilha: "Inovação incremental" },
    'pergunta4': { meta: "Autogestão", trilha: "Gestão de tempo, priorização" },
    'pergunta5': { meta: "Cultura & Valores", trilha: "Propósito, diversidade" },
    'pergunta6': { meta: "Transversal", trilha: "LMS, microlearning" },
};

// ============================================================================
// FUNÇÕES AUXILIARES DE LÓGICA
// Funções puras que executam uma tarefa específica do diagnóstico.
// ============================================================================

/**
 * Classifica a média de pontuação de uma dimensão em um estágio de maturidade.
 * @param media A média das pontuações das 6 perguntas da dimensão.
 * @returns O nome do estágio (Inicial, Básico, Intermediário, Avançado).
 */
function calcularEstagio(media: number): string {
    if (media >= 3.5) return "Avançado";
    if (media >= 2.5) return "Intermediário";
    if (media >= 2.0) return "Básico";
    return "Inicial";
}

/**
 * Identifica a maior força e a maior fragilidade de uma dimensão com base nas pontuações.
 * @param pontuacoes Um array com as pontuações de cada pergunta.
 * @returns Um objeto contendo a meta/trilha da maior força e da maior fragilidade.
 */
function identificarPontosChave(pontuacoes: PontuacaoPergunta[]): { forca: MetaTrilha | null, fragilidade: MetaTrilha | null } {
    if (pontuacoes.length === 0) return { forca: null, fragilidade: null };

    // Ordena as perguntas da pior (menor pontuação) para a melhor (maior pontuação)
    const sortedScores = [...pontuacoes].sort((a, b) => a.pontuacao - b.pontuacao);
    
    const fragilidade = sortedScores[0];
    const forca = sortedScores[sortedScores.length - 1];

    return {
        forca: mapeamentoMetas[forca.id] || null,
        fragilidade: mapeamentoMetas[fragilidade.id] || null,
    };
}


// ============================================================================
// ENDPOINT PRINCIPAL DA API
// Esta função lida com as requisições POST vindas do frontend.
// ============================================================================

export async function POST(request: Request) {
  try {
    // 1. RECEBER E VALIDAR OS DADOS DO FRONTEND
    const dadosBrutos = await request.json();

    if (!dadosBrutos.perfil || !dadosBrutos.dimensoes || !dadosBrutos.dimensoesSelecionadas) {
      return NextResponse.json(
        { error: "Dados inválidos. 'perfil', 'dimensoes' e 'dimensoesSelecionadas' são obrigatórios." },
        { status: 400 }
      );
    }

    // 2. PROCESSAR O DIAGNÓSTICO
    const { perfil, dimensoes, dimensoesSelecionadas } = dadosBrutos;
    const resultadosFinais: Record<string, any> = {};

    // Itera sobre cada dimensão que o usuário selecionou para análise
    for (const nomeDimensao of dimensoesSelecionadas) {
        const respostasDaDimensao = dimensoes[nomeDimensao];
        if (!respostasDaDimensao) continue;

        // Converte as respostas em um array de objetos com ID e pontuação numérica
        const pontuacoesPerguntas = Object.entries(respostasDaDimensao).map(([id, valor]) => ({
            id: id as string,
            pontuacao: mapeamentoPontuacao[valor as string] || 0,
        }));

        // Calcula a média simples, conforme a fórmula do manual
        const somaPontos = pontuacoesPerguntas.reduce((acc, p) => acc + p.pontuacao, 0);
        const media = pontuacoesPerguntas.length > 0 ? somaPontos / pontuacoesPerguntas.length : 0;
        
        // Determina o estágio de maturidade com base na média
        const estagio = calcularEstagio(media);
        
        // Filtra as perguntas com pontuação baixa (1 ou 2) para sugerir melhorias
        const trilhasDeMelhoria = pontuacoesPerguntas
            .filter(p => p.pontuacao <= 2)
            .map(p => mapeamentoMetas[p.id])
            .filter(Boolean); // Garante que não haja entradas nulas

        // Identifica a maior força e a maior fragilidade para o resumo executivo
        const { forca, fragilidade } = identificarPontosChave(pontuacoesPerguntas);

        // Monta o objeto de resultado para esta dimensão
        resultadosFinais[nomeDimensao] = {
            media: parseFloat(media.toFixed(2)),
            estagio,
            trilhasDeMelhoria,
            resumoExecutivo: { forca, fragilidade },
        };
    }

    // Monta o objeto final que será retornado ao frontend
    const resultadoDiagnostico = {
        perfil,
        resultados: resultadosFinais,
        dimensoesSelecionadas,
        dataProcessamento: new Date().toISOString()
    };
    
    // 3. RETORNAR O RESULTADO PROCESSADO COM SUCESSO
    return NextResponse.json(resultadoDiagnostico, { status: 200 });

  } catch (error) {
    // Bloco de tratamento de erros para garantir que a API não quebre
    console.error("Erro no processamento do diagnóstico:", error);
    return NextResponse.json({ error: "Ocorreu um erro interno no servidor." }, { status: 500 });
  }
}