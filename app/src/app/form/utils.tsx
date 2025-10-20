"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Ondas } from "../clientFuncs";
// IMPORT MERGE: Importando tanto a validação local (para CNPJ) quanto a de email.
import { validateField, formatCNPJ } from "./validator"; 
import validator from "validator";

// ========================
// Tipos genéricos (Mantidos, são compatíveis)
// ========================
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

// ========================
// Hook principal de controle (Mantido, é compatível)
// ========================
export function useDiagnostico<Respostas extends Record<string, string>>(
    perguntas: Pergunta<Respostas>[],
    respostasIniciais: Respostas,
    onsubmit?: (respostas: Respostas) => void
) {
    const router = useRouter();
    const [etapaAtual, setEtapaAtual] = useState(0);
    const [respostas, setRespostas] = useState<Respostas>(respostasIniciais);
    const [showValidationError, setShowValidationError] = useState(false);

    const handleInputChange = (campo: keyof Respostas, valor: string) => {
        setRespostas((prev) => ({ ...prev, [campo]: valor }));
        if (showValidationError) setShowValidationError(false);
    };

    const proximaEtapa = () => {
        if (etapaAtual < perguntas.length - 1) {
            setEtapaAtual((prev) => prev + 1);
            setShowValidationError(false);
        } else {
            finalizarFormulario();
        }
    };

    const etapaAnterior = () => {
        if (etapaAtual > 0) {
            setEtapaAtual((prev) => prev - 1);
            setShowValidationError(false);
        }
    };

    const finalizarFormulario = () => {
        console.log("Respostas finais:", respostas);
        if (onsubmit) onsubmit(respostas);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        finalizarFormulario();
    };

    return {
        etapaAtual,
        respostas,
        handleInputChange,
        proximaEtapa,
        etapaAnterior,
        handleSubmit,
        showValidationError,
        setShowValidationError,
    };
}

// ========================
// Componentes auxiliares
// ========================

function ProgressBar({ etapaAtual, totalEtapas }: { etapaAtual: number; totalEtapas: number }) {
    const porcentagem = Math.round(((etapaAtual + 1) / totalEtapas) * 100);

    return (
        <div className="mb-8">
            <div className="flex justify-between mb-4">
                <span className="text-white text-sm font-medium">
                    Pergunta {etapaAtual + 1} de {totalEtapas}
                </span>
                <span className="text-white text-sm">{porcentagem}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${porcentagem}%` }}
                ></div>
            </div>
        </div>
    );
}

// MERGE: InputField combina funcionalidades de V1 e V2
function InputField<Respostas extends Record<string, string>>({
    pergunta,
    valor,
    onChange,
    respostas,
    showValidationError = false,
}: {
    pergunta: Pergunta<Respostas>;
    valor: string;
    onChange: (campo: keyof Respostas, valor: string) => void;
    respostas: Respostas;
    showValidationError?: boolean;
}) {
    // Lógica de validação genérica (de V1) e de email (de V2)
    const { valid, message } = validateField(pergunta.id as string, valor);
    const isEmailValid = !(pergunta.id === 'email' && valor && !validator.isEmail(valor));
    const showError = showValidationError && (!valid || !isEmailValid);
    const errorMessage = !isEmailValid ? "Por favor, insira um email válido." : message;

    // Lógica do campo "Outros" (de V2)
    const mostraTextAreaOutros = pergunta.temOutros && valor === "outros";

    // Lógica do CNPJ (de V1)
    const isCNPJ = pergunta.id.toString().toLowerCase().includes("cnpj");

    // MERGE: Combina o formatador de CNPJ (V1) com a lógica geral.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = isCNPJ ? formatCNPJ(e.target.value) : e.target.value;
        onChange(pergunta.id, value);
    };

    // Lógica do "Enter" para avançar (de V1)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !(pergunta.tipo === "textarea" && !e.ctrlKey)) {
            e.preventDefault();
            const proximoBtn = document.querySelector('[data-advance-button]') as HTMLButtonElement;
            if (proximoBtn && !proximoBtn.disabled) {
                proximoBtn.click();
            }
        }
    };

    if (pergunta.tipo === "select") {
        return (
            <div className="space-y-4">
                <select
                    value={valor}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-pink-500 text-center cursor-pointer"
                >
                    {pergunta.opcoes?.map((opcao) => (
                        <option key={opcao.valor} value={opcao.valor} className="text-gray-800 bg-white">
                            {opcao.texto}
                        </option>
                    ))}
                </select>
                {/* Funcionalidade "Outros" de V2 */}
                {mostraTextAreaOutros && pergunta.campoOutros && (
                    <div className="animate-fade-in-up">
                        <label className="block text-white text-sm font-medium mb-2">Por favor, especifique:</label>
                        <textarea
                            value={respostas[pergunta.campoOutros]}
                            onChange={(e) => onChange(pergunta.campoOutros!, e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                            placeholder="Descreva..."
                            rows={3}
                            autoFocus
                        />
                    </div>
                )}
            </div>
        );
    }
    
    if (pergunta.tipo === "textarea") {
        return (
            <textarea
                value={valor}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                rows={pergunta.rows || 4}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                placeholder={pergunta.placeholder}
            />
        );
    }

    // Input de texto (padrão)
    return (
        <div className="space-y-2">
            <input
                type={pergunta.id === 'email' ? 'email' : 'text'}
                value={valor}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={`w-full px-4 py-3 rounded-lg bg-white/20 border ${showError ? "border-red-400" : "border-white/30"} text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 text-center`}
                placeholder={pergunta.placeholder}
                maxLength={isCNPJ ? 18 : undefined}
            />
            {showError && <p className="text-red-400 text-sm text-center">{errorMessage}</p>}
        </div>
    );
}

// MERGE: Usando a versão de NavigationButtons de V2, que tem melhor lógica de texto.
function NavigationButtons({
    etapaAtual,
    totalEtapas,
    podeAvancar,
    onProximo,
    onAnterior,
    onSubmit,
    isUltimaDimensao = true,
    onTryAdvance,
}: {
    etapaAtual: number;
    totalEtapas: number;
    podeAvancar: boolean;
    onProximo: () => void;
    onAnterior: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isUltimaDimensao?: boolean;
    onTryAdvance?: () => void;
}) {
    const ehUltimaEtapa = etapaAtual === totalEtapas - 1;
    const ehFinalDiagnostico = ehUltimaEtapa && isUltimaDimensao;

    const handleAdvanceClick = () => {
        onTryAdvance?.();
        if (podeAvancar) {
            if (ehFinalDiagnostico || ehUltimaEtapa) {
                onSubmit(new Event("submit") as any);
            } else {
                onProximo();
            }
        }
    };

    const buttonText = ehFinalDiagnostico ? "Finalizar Diagnóstico" : (ehUltimaEtapa ? "Próxima Dimensão" : "Próxima");

    return (
        <div className="flex justify-between items-center pt-6">
            <button
                type="button"
                onClick={onAnterior}
                disabled={etapaAtual === 0}
                className={`cursor-pointer px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${etapaAtual === 0 ? "bg-gray-500/50 text-gray-400 cursor-not-allowed" : "bg-white/20 text-white hover:bg-white/30 transform hover:scale-105"}`}
            >
                Anterior
            </button>
            <button
                data-advance-button
                type="button"
                onClick={handleAdvanceClick}
                className={`cursor-pointer px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${podeAvancar ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg" : "bg-gray-500/50 text-gray-400 cursor-not-allowed"}`}
            >
                {buttonText}
            </button>
        </div>
    );
}

// ========================
// Página principal genérica
// ========================
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
    const {
        etapaAtual,
        respostas,
        handleInputChange,
        proximaEtapa,
        etapaAnterior,
        handleSubmit,
        showValidationError,
        setShowValidationError,
    } = useDiagnostico(perguntas, respostasIniciais, onSubmit);

    const perguntaAtual = perguntas[etapaAtual];
    const valorAtual = respostas[perguntaAtual.id];
    
    // MERGE: Lógica de validação `podeAvancar` combina V1 e V2.
    const { valid } = validateField(perguntaAtual.id as string, valorAtual);
    const isEmailValid = !(perguntaAtual.id === 'email' && valorAtual && !validator.isEmail(valorAtual));

    let podeAvancar = true;
    if (perguntaAtual.required) {
        podeAvancar = valorAtual.trim() !== "" && valid && isEmailValid;
        // Validação do campo "Outros" (de V2)
        if (perguntaAtual.temOutros && valorAtual === "outros" && perguntaAtual.campoOutros) {
            const valorOutros = respostas[perguntaAtual.campoOutros];
            podeAvancar = podeAvancar && valorOutros.trim() !== "";
        }
    } else {
        podeAvancar = valid && isEmailValid;
    }

    const handleTryAdvance = () => {
        if (!podeAvancar) {
            setShowValidationError(true);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-8 relative">
            <Link
                href="/"
                className="absolute top-6 left-6 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2 7-7 7 7M5 10v10h4v-4h6v4h4V10" />
                </svg>
                <span className="hidden sm:inline">Home</span>
            </Link>

            <div className="max-w-2xl w-full bg-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                <ProgressBar etapaAtual={etapaAtual} totalEtapas={perguntas.length} />

                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Image src="/img/logo.png" alt="Logo" width={120} height={40} priority />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{titulo}</h1>
                </div>

                <div className="mb-8 min-h-[200px] flex flex-col justify-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-6 text-center">
                        {perguntaAtual.titulo}
                    </h2>
                    <InputField
                        pergunta={perguntaAtual}
                        valor={valorAtual}
                        onChange={handleInputChange}
                        respostas={respostas}
                        showValidationError={showValidationError}
                    />
                </div>

                <NavigationButtons
                    etapaAtual={etapaAtual}
                    totalEtapas={perguntas.length}
                    podeAvancar={podeAvancar}
                    onProximo={proximaEtapa}
                    onAnterior={etapaAnterior}
                    onSubmit={handleSubmit}
                    isUltimaDimensao={isUltimaDimensao}
                    onTryAdvance={handleTryAdvance}
                />
            </div>

            <div className="-z-10">
                <Ondas />
            </div>
        </main>
    );
}