// src/app/resultados/page.tsx

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Ondas } from "../clientFuncs";

// Estrutura de dados esperada da API após o processamento do diagnóstico
interface DiagnosticoData {
    perfil: {
        empresa: string;
    };
    resultados: Record<string, {
        media: number;
        estagio: string;
        trilhasDeMelhoria: { meta: string; trilha: string }[];
        resumoExecutivo: {
            forca: { meta: string } | null;
            fragilidade: { meta: string } | null;
        };
    }>;
    dimensoesSelecionadas: string[];
    dataProcessamento: string;
}

export default function Resultados() {
    const router = useRouter();
    const [diagnosticoData, setDiagnosticoData] = useState<DiagnosticoData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const dados = localStorage.getItem('diagnosticoCompleto');
        if (dados) {
            try {
                const parsedData = JSON.parse(dados);
                setDiagnosticoData(parsedData);
            } catch (error) {
                console.error('Erro ao carregar dados do diagnóstico:', error);
                router.push('/form');
            }
        } else {
            router.push('/form');
        }
        setIsLoading(false);
    }, [router]);

    // Gera o conteúdo de texto para o arquivo de download
    const generateReportContent = (data: DiagnosticoData): string => {
        const dataFormatada = new Date(data.dataProcessamento).toLocaleDateString('pt-BR');

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

        data.dimensoesSelecionadas.forEach(dimensao => {
            const resultado = data.resultados[dimensao];
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

        content += `
-------------------
Este é um retrato consultivo da sua empresa hoje, mostrando onde estão os
pontos fortes e onde há mais espaço para evoluir. Para um diagnóstico
aprofundado e um plano de ação detalhado, entre em contato.
`;
        return content;
    };

    // Aciona o download do arquivo .txt
    const handleDownloadReport = () => {
        if (!diagnosticoData) return;
        const reportContent = generateReportContent(diagnosticoData);

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `diagnostico-${diagnosticoData.perfil.empresa.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Limpa o localStorage e volta para o início do formulário
    const handleNewDiagnostic = () => {
        localStorage.removeItem('diagnosticoCompleto');
        router.push('/form');
    };

    // Renderiza um estado de carregamento
    if (isLoading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando resultados...</div>;
    }

    // Renderiza um estado de erro se os dados não forem encontrados
    if (!diagnosticoData) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Dados do diagnóstico não encontrados.</div>;
    }

    // Renderização principal da página de resultados
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

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {diagnosticoData.dimensoesSelecionadas.map((dimensao) => {
                        const resultado = diagnosticoData.resultados[dimensao];
                        if (!resultado) return null;

                        return (
                            <div key={dimensao} className="bg-white/5 p-6 rounded-lg border border-white/10 flex flex-col justify-between">
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

                <div className="space-y-4">
                    <button onClick={handleDownloadReport} className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        📥 Baixar Relatório Completo
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={handleNewDiagnostic} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105">
                            🔄 Fazer Novo Diagnóstico
                        </button>
                        <button onClick={() => router.push('/')} className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105">
                            🏠 Voltar para a Página Inicial
                        </button>
                    </div>
                </div>
            </div>

            <div className="-z-10"><Ondas /></div>
        </main>
    );
}