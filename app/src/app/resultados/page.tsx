"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Ondas } from "../clientFuncs";

interface DiagnosticoData {
    perfil: {
        empresa: string;
        setor: string;
        porte: string;
        setorOutro: string;
    };
    dimensoes: Record<string, Record<string, string>>;
    dimensoesSelecionadas: string[];
    dataFinalizacao: string;
}

export default function Resultados() {
    const router = useRouter();
    const [diagnosticoData, setDiagnosticoData] = useState<DiagnosticoData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Recuperar dados do localStorage
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
            // Se não há dados, redirecionar para o formulário
            router.push('/form');
        }
        setIsLoading(false);
    }, [router]);

    const handleDownloadReport = () => {
        if (!diagnosticoData) return;

        // Gerar conteúdo do relatório
        const reportContent = generateReportContent(diagnosticoData);

        // Criar e baixar arquivo
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

    const generateReportContent = (data: DiagnosticoData): string => {
        const dataFormatada = new Date(data.dataFinalizacao).toLocaleDateString('pt-BR');

        let content = `
RELATÓRIO DE DIAGNÓSTICO EMPRESARIAL - ECHONOVA
================================================

Data de Finalização: ${dataFormatada}

PERFIL DA EMPRESA
-----------------
Empresa: ${data.perfil.empresa}
Setor: ${data.perfil.setor === 'outros' ? data.perfil.setorOutro : data.perfil.setor}
Porte: ${data.perfil.porte}

DIMENSÕES AVALIADAS
-------------------
${data.dimensoesSelecionadas.map(dim => `• ${dim}`).join('\n')}

RESPOSTAS POR DIMENSÃO
----------------------
`;

        data.dimensoesSelecionadas.forEach(dimensao => {
            content += `\n${dimensao.toUpperCase()}\n`;
            content += '-'.repeat(dimensao.length) + '\n';

            const respostas = data.dimensoes[dimensao];
            if (respostas) {
                Object.entries(respostas).forEach(([pergunta, resposta], index) => {
                    content += `${index + 1}. ${resposta}\n`;
                });
            }
            content += '\n';
        });

        content += `
SOBRE O DIAGNÓSTICO
-------------------
Este diagnóstico foi gerado pelo sistema EchoNova em parceria com a Entrenova.
O relatório apresenta as respostas fornecidas durante a avaliação das dimensões
selecionadas para análise empresarial.

Para mais informações sobre nossos serviços de treinamento e consultoria,
entre em contato com a Entrenova.
`;

        return content;
    };

    const handleNewDiagnostic = () => {
        // Limpar dados do localStorage
        localStorage.removeItem('diagnosticoCompleto');
        // Redirecionar para novo diagnóstico
        router.push('/form');
    };

    const handleGoHome = () => {
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-white text-xl">Carregando resultados...</div>
            </div>
        );
    }

    if (!diagnosticoData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-white text-xl">Dados não encontrados.</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-8 relative">
            {/* Botão Home no canto superior esquerdo */}
            <Link
                href="/"
                className="absolute top-6 left-6 z-10 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Home</span>
            </Link>

            <div className="max-w-2xl w-full bg-slate-800 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                {/* Header com logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/img/logo.png"
                            alt="EchoNova - Diagnóstico Inteligente"
                            width={120}
                            height={40}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Diagnóstico Finalizado!
                    </h1>
                    <p className="text-white/80 text-lg">
                        Parabéns, {diagnosticoData.perfil.empresa}!
                    </p>
                </div>

                {/* Ícone de sucesso */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Resumo do diagnóstico */}
                <div className="bg-white/10 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Resumo do Diagnóstico</h2>
                    <div className="space-y-2 text-white/90">
                        <p><strong>Empresa:</strong> {diagnosticoData.perfil.empresa}</p>
                        <p><strong>Setor:</strong> {diagnosticoData.perfil.setor === 'outros' ? diagnosticoData.perfil.setorOutro : diagnosticoData.perfil.setor}</p>
                        <p><strong>Porte:</strong> {diagnosticoData.perfil.porte}</p>
                        <p><strong>Dimensões Avaliadas:</strong> {diagnosticoData.dimensoesSelecionadas.length}</p>
                        <p><strong>Data:</strong> {new Date(diagnosticoData.dataFinalizacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>

                {/* Lista de dimensões avaliadas */}
                <div className="bg-white/10 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Dimensões Avaliadas:</h3>
                    <div className="grid gap-2">
                        {diagnosticoData.dimensoesSelecionadas.map((dimensao, index) => (
                            <div key={dimensao} className="flex items-center text-white/90">
                                <span className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                    {index + 1}
                                </span>
                                {dimensao}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="space-y-4">
                    <button
                        onClick={handleDownloadReport}
                        className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        📥 Baixar Relatório Completo
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={handleNewDiagnostic}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                        >
                            🔄 Novo Diagnóstico
                        </button>

                        <button
                            onClick={handleGoHome}
                            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105"
                        >
                            🏠 Página Inicial
                        </button>
                    </div>
                </div>

                {/* Nota sobre os resultados */}
                <div className="mt-8 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <p className="text-blue-200 text-sm text-center">
                        💡 Seu relatório contém insights valiosos sobre as dimensões avaliadas.
                        Use essas informações para identificar oportunidades de melhoria e crescimento.
                    </p>
                </div>
            </div>
            <div className="-z-10">
                <Ondas />
            </div>
        </main>
    );
}