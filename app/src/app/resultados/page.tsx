"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Ondas } from "../clientFuncs";

// Interface mesclada para suportar tanto dados brutos quanto processados
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
        cnpj: string;
    };
    // Resultados processados (da branch HEAD) - opcional para o caso de fallback
    resultados?: Record<string, {
        media: number;
        estagio: string;
        trilhasDeMelhoria: { meta: string; trilha: string }[];
        resumoExecutivo: {
            forca: { meta: string } | null;
            fragilidade: { meta: string } | null;
        };
    }>;
    dimensoesSelecionadas: string[];
    // Respostas brutas (da branch main)
    respostasDimensoes?: Record<string, Record<string, string>>;
    dataProcessamento?: string; // Mantido para compatibilidade do relatório
    dataCriacao?: string;
    dataFinalizacao?: string;
}

export default function Resultados() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const diagnosticoId = searchParams.get('id');
    
    const [diagnosticoData, setDiagnosticoData] = useState<DiagnosticoData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Lógica de carregamento de dados da branch `main`
    useEffect(() => {
        const carregarDiagnostico = async () => {
            if (diagnosticoId) {
                // Buscar do banco de dados
                await carregarDoBanco(diagnosticoId);
            } else {
                // Fallback para localStorage
                carregarDoLocalStorage();
            }
        };

        carregarDiagnostico();
    }, [diagnosticoId]);

    const carregarDoBanco = async (id: string) => {
        try {
            const response = await fetch(`/api/diagnosticos/${id}`);
            const data = await response.json();
            
            if (response.ok) {
                setDiagnosticoData(data.diagnostico);
            } else {
                console.error('Erro ao carregar diagnóstico:', data.error);
                carregarDoLocalStorage();
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            carregarDoLocalStorage();
        } finally {
            setIsLoading(false);
        }
    };

    const carregarDoLocalStorage = () => {
        const dados = localStorage.getItem('diagnosticoCompleto');
        if (dados) {
            try {
                const parsedData = JSON.parse(dados);
                // Mapeia os dados do localStorage para a nova interface
                const diagnosticoMapeado: DiagnosticoData = {
                    perfil: parsedData.perfil,
                    respostasDimensoes: parsedData.dimensoes,
                    dimensoesSelecionadas: parsedData.dimensoesSelecionadas,
                    dataFinalizacao: parsedData.dataFinalizacao
                };
                setDiagnosticoData(diagnosticoMapeado);
            } catch (error) {
                console.error('Erro ao carregar dados do localStorage:', error);
                router.push('/form');
            }
        } else {
            router.push('/form');
        }
        setIsLoading(false);
    };

    // Função de geração de relatório da branch `HEAD` (mais analítica)
    const generateReportContent = (data: DiagnosticoData): string => {
        const dataFormatada = new Date(data.dataProcessamento || data.dataFinalizacao || Date.now()).toLocaleDateString('pt-BR');

        let content = `
RELATÓRIO DE DIAGNÓSTICO EMPRESARIAL - ECHONOVA
================================================

Data do Processamento: ${dataFormatada}

PERFIL DA EMPRESA
-----------------
Empresa: ${data.perfil.empresa}

RESULTADOS POR DIMENSÃO
-------------------------
`;

        if (data.resultados) {
            data.dimensoesSelecionadas.forEach(dimensao => {
                const resultado = data.resultados![dimensao];
                if (!resultado) return;

                content += `\nDIMENSÃO: ${dimensao.toUpperCase()}\n`;
                content += '-'.repeat(9 + dimensao.length) + '\n';
                content += `ESTÁGIO DE MATURIDADE: ${resultado.estagio}\n`;
                content += `Média de Pontuação: ${resultado.media.toFixed(2)} / 4.00\n\n`;

                content += 'PONTO FORTE PRINCIPAL (Pode inspirar outras áreas):\n';
                content += `  - Meta: ${resultado.resumoExecutivo.forca?.meta || 'N/A'}\n\n`;

                content += 'PRIORIDADE DE AÇÃO (Maior oportunidade de impacto):\n';
                content += `  - Meta: ${resultado.resumoExecutivo.fragilidade?.meta || 'N/A'}\n\n`;

                content += 'TRILHAS DE MELHORIA RECOMENDADAS:\n';
                if (resultado.trilhasDeMelhoria.length > 0) {
                    resultado.trilhasDeMelhoria.forEach(trilha => {
                        content += `  - Meta: ${trilha.meta} -> Trilha Sugerida: ${trilha.trilha}\n`;
                    });
                } else {
                    content += '  - Nenhum ponto crítico que exige ação imediata foi identificado. Ótimo trabalho!\n';
                }
                content += '\n';
            });
        } else {
            content += "\nNenhum resultado processado disponível. O relatório conterá as respostas brutas.\n";
            // Aqui poderia-se adicionar a lógica de relatório da `main` como fallback
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
        const reportContent = generateReportContent(diagnosticoData);

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const nomeEmpresa = diagnosticoData.perfil.nome_empresa || diagnosticoData.perfil.empresa;
        link.download = `diagnostico-${nomeEmpresa.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleNewDiagnostic = () => {
        localStorage.removeItem('diagnosticoCompleto');
        router.push('/form');
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando resultados...</div>;
    }

    if (!diagnosticoData) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Dados do diagnóstico não encontrados.</div>;
    }

    // Renderização principal da página da branch `HEAD`
    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
            <Link href="/" className="absolute top-6 left-6 z-10 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                <span className="hidden sm:inline">Home</span>
            </Link>

            <div className="max-w-4xl w-full bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Seu Retrato Inicial</h1>
                    <p className="text-white/80 mt-2">Um resumo prático sobre a maturidade de <span className="font-bold text-white">{diagnosticoData.perfil.empresa}</span> em áreas-chave.</p>
                </div>

                {diagnosticoData.resultados ? (
                    <div className="flex flex-wrap gap-6 mb-8 justify-center">
                        {diagnosticoData.dimensoesSelecionadas.map((dimensao) => {
                            const resultado = diagnosticoData.resultados![dimensao];
                            if (!resultado) return null;

                            return (
                                <div key={dimensao} className="bg-white/5 w-sm p-6 rounded-lg border border-white/10 flex flex-col">
                                    <div>
                                        <h3 className="text-xl font-bold text-pink-400 mb-2">{dimensao}</h3>
                                        <p className="mb-4 text-white/90">Sua empresa está no estágio <span className="font-bold">{resultado.estagio}</span>.</p>
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-white mb-2">Trilhas de Melhoria:</h4>
                                        {resultado.trilhasDeMelhoria.length > 0 ? (
                                            <ul className="list-disc list-inside space-y-1 text-sm text-white/80">
                                                {resultado.trilhasDeMelhoria.map(trilha => (
                                                    <li key={trilha.meta}><strong>{trilha.meta}:</strong> {trilha.trilha}</li>
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

                <div className="space-y-4">
                    <button onClick={handleDownloadReport} className="cursor-pointer w-full px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        📥 Baixar Relatório Completo
                    </button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={handleNewDiagnostic} className="cursor-pointer px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105">
                            🔄 Fazer Novo Diagnóstico
                        </button>
                        <button onClick={() => router.push('/')} className="cursor-pointer px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105">
                            🏠 Voltar para a Página Inicial
                        </button>
                    </div>
                </div>
            </div>

            <div className="-z-10"><Ondas /></div>
        </main>
    );
}