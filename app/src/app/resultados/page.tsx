"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ondas } from "../clientFuncs";
import { toast } from "sonner";
import { generateDiagnosticoPDF } from "@/lib/pdfGenerator";
import { ArrowRightIcon } from "lucide-react";

// Interface mesclada que suporta todos os campos de ambos os arquivos.
interface DiagnosticoData {
  _id?: string;
  empresa?: {
    _id: string;
    nome_empresa: string;
    email: string;
  };
  perfil: {
    empresa: string;
    setor: string;
    porte: string;
    setorOutro: string;
    nome_empresa?: string;
    email?: string;
    cnpj: string; // Campo CNPJ mantido.
  };
  // Resultados processados (da branch HEAD) - opcional para o caso de fallback
  resultados?: Record<
    string,
    {
      media: number;
      estagio: string;
      trilhasDeMelhoria: { meta: string; trilha: string; explicacao?: string }[];
      resumoExecutivo: {
        forca: { meta: string } | null;
        fragilidade: { meta: string } | null;
      };
    }
  >;
  dimensoesSelecionadas: string[];
  respostasDimensoes?: Record<string, Record<string, string>>;
  dataProcessamento?: string;
  dataCriacao?: string;
  dataFinalizacao?: string;
}

const enviarEmail = async (dados: DiagnosticoData) => {
  try {
    const emailResponse = await fetch("/api/send-diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        nome: dados.perfil.empresa,
        email: dados.perfil.email,
        diagnostico: dados.resultados
          ? Object.entries(dados.resultados).map(([key, value]) => ({
            dimensao: key,
            trilhasDeMelhoria: value.trilhasDeMelhoria,
          }))
          : [],
      }),
    });

    const emailData = await emailResponse.json();

    if (emailData.success) {
      console.log("Diagnóstico enviado por e-mail!", dados.resultados);
    } else {
      console.warn("Falha ao enviar e-mail:", emailData.error);
      toast.error("Não foi possível enviar o e-mail do diagnóstico.");
    }
  } catch (emailError) {
    console.error("Erro ao enviar o e-mail:", emailError);
    toast.error("Erro ao enviar o e-mail do diagnóstico.");
  }
};

export default function Resultados() {
  const router = useRouter();
  // Avoid useSearchParams (prerender-time issues). Read search on client mount.
  const [diagnosticoId, setDiagnosticoId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const id = sp.get("id");
      console.log("[Resultados] ID capturado da URL:", id);
      setDiagnosticoId(id);
    }
  }, []);

  const [diagnosticoData, setDiagnosticoData] =
    useState<DiagnosticoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lógica de carregamento de dados (idêntica e preservada).
  const carregarDoLocalStorage = useCallback(() => {
    console.log("[Resultados] Tentando carregar do localStorage...");
    const dados = localStorage.getItem("diagnosticoCompleto");
    if (dados) {
      try {
        const parsedData = JSON.parse(dados);
        const diagnosticoMapeado: DiagnosticoData = {
          perfil: parsedData.perfil,
          respostasDimensoes: parsedData.dimensoes,
          dimensoesSelecionadas: parsedData.dimensoesSelecionadas,
          dataFinalizacao: parsedData.dataFinalizacao,
        };
        console.log("[Resultados] Dados carregados do localStorage com sucesso");
        setDiagnosticoData(diagnosticoMapeado);
      } catch (error) {
        console.error("[Resultados] Erro ao carregar dados do localStorage:", error);
        console.warn("[Resultados] Redirecionando para /form por erro no localStorage");
        router.push("/form");
      }
    } else {
      console.warn("[Resultados] Nenhum dado no localStorage, redirecionando para /form");
      router.push("/form");
    }
    setIsLoading(false);
  }, [router]);

  const carregarDoBanco = useCallback(async (id: string) => {
    console.log("[Resultados] Carregando diagnóstico do banco com ID:", id);
    try {
      const response = await fetch(`/api/diagnosticos/${id}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        console.log("[Resultados] Diagnóstico carregado com sucesso:", data.diagnostico._id);
        setDiagnosticoData(data.diagnostico);
      } else {
        console.error("[Resultados] Erro ao carregar diagnóstico do banco:", data.error);
        console.log("[Resultados] Tentando fallback para localStorage...");
        carregarDoLocalStorage();
      }
    } catch (error) {
      console.error("[Resultados] Erro de conexão ao carregar do banco:", error);
      console.log("[Resultados] Tentando fallback para localStorage...");
      carregarDoLocalStorage();
    } finally {
      setIsLoading(false);
    }
  }, [carregarDoLocalStorage]);

  useEffect(() => {
    console.log("[Resultados] useEffect disparado. diagnosticoId:", diagnosticoId);
    
    // undefined = ainda não capturou o ID da URL
    // null = capturou e não há ID
    // string = capturou e há ID válido
    
    if (diagnosticoId === undefined) {
      // Ainda não capturou, aguarda próximo render
      console.log("[Resultados] Estado inicial, aguardando captura do ID...");
      return;
    }
    
    if (diagnosticoId) {
      // Tem ID válido, carrega do banco
      console.log("[Resultados] ID válido detectado, carregando do banco...");
      void carregarDoBanco(diagnosticoId);
    } else {
      // diagnosticoId é null, não há ID na URL
      console.log("[Resultados] Nenhum ID na URL, tentando localStorage...");
      carregarDoLocalStorage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagnosticoId]);

  // Envia o e-mail apenas quando os dados do diagnóstico estiverem disponíveis
  useEffect(() => {
    if (diagnosticoData) {
      void enviarEmail(diagnosticoData);
    }
  }, [diagnosticoData]);

  /* carregamento functions are defined above using useCallback */



  // Função de geração de relatório do LADO 2 (com CNPJ).
  const generateReportContent = (data: DiagnosticoData): string => {
    const dataFormatada = new Date(
      data.dataProcessamento || data.dataFinalizacao || Date.now(),
    ).toLocaleDateString("pt-BR");

    let content = `
RELATÓRIO DE DIAGNÓSTICO EMPRESARIAL - ECHONOVA
================================================

Data do Processamento: ${dataFormatada}

PERFIL DA EMPRESA
-----------------
Empresa: ${data.perfil.empresa}
CNPJ: ${data.perfil.cnpj || 'Não informado'}

RESULTADOS POR DIMENSÃO
-------------------------
`;

    if (data.resultados) {
      data.dimensoesSelecionadas.forEach((dimensao) => {
        const resultado = data.resultados?.[dimensao];
        if (!resultado) return;

        content += `\nDIMENSÃO: ${dimensao.toUpperCase()}\n`;
  content += `${"-".repeat(9 + dimensao.length)}\n`;
        content += `ESTÁGIO DE MATURIDADE: ${resultado.estagio}\n`;
        content += `Média de Pontuação: ${resultado.media.toFixed(2)} / 4.00\n\n`;
        content += "PONTO FORTE PRINCIPAL (Pode inspirar outras áreas):\n";
        content += `  - Meta: ${resultado.resumoExecutivo.forca?.meta || "N/A"}\n\n`;
        content += "PRIORIDADE DE AÇÃO (Maior oportunidade de impacto):\n";
        content += `  - Meta: ${resultado.resumoExecutivo.fragilidade?.meta || "N/A"}\n\n`;
        content += "TRILHAS DE MELHORIA RECOMENDADAS:\n";
        if (resultado.trilhasDeMelhoria.length > 0) {
          resultado.trilhasDeMelhoria.forEach((trilha) => {
            content += `  - Meta: ${trilha.meta} -> Trilha Sugerida: ${trilha.trilha}\n`;
            if (trilha.explicacao) {
              content += `    Explicação: ${trilha.explicacao}\n`;
            }
          });
        } else {
          content += "  - Nenhum ponto crítico que exige ação imediata foi identificado. Ótimo trabalho!\n";
        }
        content += "\n";
      });
    } else {
      content += "\nNenhum resultado processado disponível. O relatório conterá as respostas brutas.\n";
    }

    content += `
-------------------
Este é um retrato consultivo da sua empresa hoje, mostrando onde estão os
pontos fortes e onde há mais espaço para evoluir. Para um diagnóstico
aprofundado e um plano de ação detalhado, entre em contato.
`;
    return content;
  };

  const handleDownloadReport = () => {
    if (!diagnosticoData) return;
    generateDiagnosticoPDF(diagnosticoData);
  };

  const handleNewDiagnostic = () => {
    localStorage.removeItem("diagnosticoCompleto");
    router.push("/form");
  };

  // Tela de Loading do LADO 1 (melhor UX).
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <Link
          href="/"
          className="absolute top-6 left-6 z-10 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30 flex items-center gap-2"
        >
          <svg aria-hidden="true" focusable="false" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="hidden sm:inline">Home</span>
        </Link>
        <div className="max-w-4xl w-full bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 animate-pulse">
          <div className="text-center mb-8">
            <div className="h-8 bg-slate-700 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto mt-3"></div>
          </div>
          <div className="flex flex-wrap gap-6 mb-8 justify-center">
            <div className="bg-white/5 p-6 rounded-lg border border-white/10 flex flex-col h-48 w-64"></div>
            <div className="bg-white/5 p-6 rounded-lg border border-white/10 flex flex-col h-48 w-64"></div>
          </div>
        </div>
        <div className="-z-10">
          <Ondas />
        </div>
      </main>
    );
  }

  if (!diagnosticoData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Dados do diagnóstico não encontrados.
      </div>
    );
  }

  // Layout principal com a seção de ações do LADO 2 (mais rica).
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <Link href="/" className="absolute top-6 left-6 z-10 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30 flex items-center gap-2">
        <svg aria-hidden="true" focusable="false" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        <span className="hidden sm:inline">Home</span>
      </Link>

      <div className="max-w-4xl w-full bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Seu Retrato Inicial</h1>
          <p className="text-white/80 mt-2">Um resumo prático sobre a maturidade de <span className="font-bold text-white">{diagnosticoData.perfil.empresa}</span> em áreas-chave.</p>
        </div>

        {diagnosticoData.resultados ? (
          <div className={`grid gap-6 mb-8 ${
            diagnosticoData.dimensoesSelecionadas.length === 1 
              ? 'grid-cols-1' 
              : diagnosticoData.dimensoesSelecionadas.length === 2 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {diagnosticoData.dimensoesSelecionadas.map((dimensao) => {
              const resultado = diagnosticoData.resultados?.[dimensao];
              if (!resultado) return null;

              return (
                <div key={dimensao} className="bg-white/5 p-6 rounded-lg border border-white/10 flex flex-col h-full">
                  <div>
                    <h3 className="text-xl font-bold text-pink-400 mb-2">{dimensao}</h3>
                    <p className="mb-4 text-white/90">Sua empresa está no estágio <span className="font-bold">{resultado.estagio}</span>.</p>
                  </div>
                  <div className="mt-4 grow">
                    <h4 className="font-semibold text-white mb-2">Trilhas de Melhoria:</h4>
                    {resultado.trilhasDeMelhoria.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2 text-sm text-white/80">
                        {resultado.trilhasDeMelhoria.map((trilha) => (
                          <li key={trilha.meta}>
                            <strong>{trilha.meta}:</strong> {trilha.trilha}
                            {trilha.explicacao && (
                              <p className="mt-1 text-m text-white/90 italic">
                                {trilha.explicacao}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-400">Nenhum ponto crítico identificado. Ótimo trabalho!</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/10 rounded-lg p-6 mb-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Diagnóstico Recebido</h2>
            <p className="text-white/80">Os resultados detalhados não puderam ser carregados. Verifique o relatório para ver suas respostas.</p>
          </div>
        )}

        <div className="relative rounded-xl p-6 mb-6 text-center shadow-lg border border-white/10 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-purple-700 via-pink-600 to-pink-500 opacity-30 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              🚀 Transforme Estes Insights em Ação!
            </h2>
            <p className="text-white/90 mb-6">
              Agora que você conhece os desafios da sua empresa, que tal receber trilhas personalizadas e conteúdo sob medida para acelerar o crescimento da sua equipe?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  // Salva informações básicas do diagnóstico antes de ir pros planos
                  if (diagnosticoData?.perfil) {
                    localStorage.setItem(
                      "dadosQuestionario",
                      JSON.stringify({
                        nome: diagnosticoData.perfil.empresa || "",
                        email: diagnosticoData.perfil.email || "",
                        cnpj: diagnosticoData.perfil.cnpj || "",
                        empresa: diagnosticoData.perfil.empresa || "",
                      })
                    );
                    console.log("DadosQuestionario salvos:", diagnosticoData.perfil);
                  }
                  router.push("/planos");
                }}
                className="flex-1 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                ⭐ Ver Planos e Começar Jornada
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDownloadReport}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                📥 Baixar Relatório Completo
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleNewDiagnostic}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            🔄 Fazer Novo Diagnóstico
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            🏠 Voltar para a Página Inicial
          </button>
        </div>
      </div>
      <div className="-z-10"><Ondas /></div>
    </main>
  );
}