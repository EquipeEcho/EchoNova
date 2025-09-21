"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Ondas } from "../clientFuncs";

// Tipos genéricos
export interface Pergunta<Respostas> {
    id: keyof Respostas;
    titulo: string;
    tipo: "select" | "texto" | "textarea";
    placeholder?: string;
    rows?: number;
    required: boolean;
    opcoes?: { valor: string; texto: string }[];
    temOutros?: boolean;
    campoOutros?: keyof Respostas;
}

// Hook genérico para gerenciar diagnóstico
export function useDiagnostico<Respostas extends Record<string, string>>(
    perguntas: Pergunta<Respostas>[],
    respostasIniciais: Respostas,
    onsubmit?: (respostas: Respostas) => void
) {
    const router = useRouter();
    const [etapaAtual, setEtapaAtual] = useState(0);
    const [respostas, setRespostas] = useState<Respostas>(respostasIniciais);

    const handleInputChange = (campo: keyof Respostas, valor: string) => {
        setRespostas(prev => ({ ...prev, [campo]: valor }));
    };

    const proximaEtapa = () => {
        if (etapaAtual < perguntas.length - 1) setEtapaAtual(prev => prev + 1);
        else finalizarFormulario();
    };

    const etapaAnterior = () => {
        if (etapaAtual > 0) setEtapaAtual(prev => prev - 1);
    };

    const finalizarFormulario = () => {
        console.log("Respostas finais:", respostas);
        if (onsubmit) {
            onsubmit(respostas);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        finalizarFormulario();
    };

    return { etapaAtual, respostas, handleInputChange, proximaEtapa, etapaAnterior, handleSubmit };
}

// Componente de barra de progresso
function ProgressBar({ etapaAtual, totalEtapas }: { etapaAtual: number; totalEtapas: number }) {
    const porcentagem = Math.round(((etapaAtual + 1) / totalEtapas) * 100);

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <span className="text-white text-sm font-medium">
                    Pergunta {etapaAtual + 1} de {totalEtapas}
                </span>
                <span className="text-white text-sm">{porcentagem}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${porcentagem}%` }}
                ></div>
            </div>
        </div>
    );
}

// Componente InputField
function InputField<Respostas extends Record<string, string>>({
    pergunta,
    valor,
    onChange,
    respostas
}: {
    pergunta: Pergunta<Respostas>;
    valor: string;
    onChange: (campo: keyof Respostas, valor: string) => void;
    respostas: Respostas;
}) {
    const mostraTextAreaOutros = pergunta.temOutros && valor === "outros";

    switch (pergunta.tipo) {
        case "texto":
            return (
                <input
                    type="text"
                    value={valor}
                    onChange={(e) => onChange(pergunta.id, e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center"
                    placeholder={pergunta.placeholder}
                    autoFocus
                />
            );

        case "select":
            return (
                <div className="space-y-4">
                    <select
                        value={valor}
                        onChange={(e) => onChange(pergunta.id, e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center"
                        autoFocus={!mostraTextAreaOutros}
                    >
                        {pergunta.opcoes?.map((opcao) => (
                            <option key={opcao.valor} value={opcao.valor} className="text-gray-800 bg-white">
                                {opcao.texto}
                            </option>
                        ))}
                    </select>

                    {mostraTextAreaOutros && pergunta.campoOutros && (
                        <div className="animate-fade-in-up">
                            <label className="block text-white text-sm font-medium mb-2">Por favor, especifique:</label>
                            <textarea
                                value={respostas[pergunta.campoOutros]}
                                onChange={(e) => onChange(pergunta.campoOutros!, e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                                placeholder="Descreva..."
                                rows={3}
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            );

        case "textarea":
            return (
                <textarea
                    value={valor}
                    onChange={(e) => onChange(pergunta.id, e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    placeholder={pergunta.placeholder}
                    rows={pergunta.rows || 4}
                    autoFocus
                />
            );

        default:
            return null;
    }
}

// Componente NavigationButtons
function NavigationButtons({
    etapaAtual,
    totalEtapas,
    podeAvancar,
    onProximo,
    onAnterior,
    onSubmit,
    isUltimaDimensao = true,
}: {
    etapaAtual: number;
    totalEtapas: number;
    podeAvancar: boolean;
    onProximo: () => void;
    onAnterior: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isUltimaDimensao?: boolean;
}) {
    const ehUltimaEtapa = etapaAtual === totalEtapas - 1;
    const ehFinalDiagnostico = ehUltimaEtapa && isUltimaDimensao;

    return (
        <div className="flex justify-between items-center pt-6">
            <button
                type="button"
                onClick={onAnterior}
                disabled={etapaAtual === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${etapaAtual === 0
                        ? "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                        : "bg-white/20 text-white hover:bg-white/30 transform hover:scale-105"
                    }`}
            >
                Anterior
            </button>

            {ehFinalDiagnostico ? (
                <button
                    onClick={onSubmit}
                    disabled={!podeAvancar}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${podeAvancar
                            ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl"
                            : "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    Finalizar Diagnóstico
                </button>
            ) : ehUltimaEtapa ? (
                <button
                    onClick={onSubmit}
                    disabled={!podeAvancar}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${podeAvancar
                            ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl"
                            : "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    Próxima Dimensão
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onProximo}
                    disabled={!podeAvancar}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${podeAvancar
                            ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl"
                            : "bg-gray-500/50 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    Próxima
                </button>
            )}
        </div>
    );
}

// Componente principal genérico
export default function DiagnosticoPage<Respostas extends Record<string, string>>({
    perguntas,
    respostasIniciais,
    titulo,
    onSubmit,
    isUltimaDimensao = true,
}: {
    perguntas: Pergunta<Respostas>[];
    respostasIniciais: Respostas;
    titulo: string;
    onSubmit: (respostas: Respostas) => void;
    isUltimaDimensao?: boolean;
}) {
    const { etapaAtual, respostas, handleInputChange, proximaEtapa, etapaAnterior, handleSubmit } =
        useDiagnostico<Respostas>(perguntas, respostasIniciais, onSubmit);

    const perguntaAtual = perguntas[etapaAtual];
    const valorAtual = respostas[perguntaAtual.id];

    let podeAvancar = true;
    if (perguntaAtual.required) {
        podeAvancar = valorAtual.trim() !== "";
        if (perguntaAtual.temOutros && valorAtual === "outros" && perguntaAtual.campoOutros) {
            const valorOutros = respostas[perguntaAtual.campoOutros];
            podeAvancar = podeAvancar && valorOutros.trim() !== "";
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-8 relative">
            {/* Botão Home no canto superior esquerdo */}
            <Link 
                href="/" 
                className="absolute z-0 top-6 left-6 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Home</span>

            </Link>

            <div className="max-w-2xl w-full bg-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                {/* Barra de progresso */}
                <ProgressBar etapaAtual={etapaAtual} totalEtapas={perguntas.length} />

                {/* Header com logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/img/logo.png"
                            alt="Logo"
                            width={120}
                            height={40}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{titulo}</h1>
                </div>

                {/* Pergunta atual */}
                <div className="mb-8 min-h-[200px] flex flex-col justify-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-6 text-center leading-relaxed">
                        {perguntaAtual.titulo}
                    </h2>

                    <div className="space-y-4">
                        <InputField pergunta={perguntaAtual} valor={valorAtual} onChange={handleInputChange} respostas={respostas} />
                    </div>
                </div>

                {/* Botões de navegação */}
                <NavigationButtons
                    etapaAtual={etapaAtual}
                    totalEtapas={perguntas.length}
                    podeAvancar={podeAvancar}
                    onProximo={proximaEtapa}
                    onAnterior={etapaAnterior}
                    onSubmit={handleSubmit}
                    isUltimaDimensao={isUltimaDimensao}
                />
            </div>
            <div className="-z-10">
                <Ondas />
            </div>
        </main>
    );
}
