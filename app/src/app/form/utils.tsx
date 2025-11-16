"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import validator from "validator";
import { Ondas } from "../clientFuncs";
import { validateField, formatCNPJ, validateCNPJ } from "./validator";
import { toast } from "sonner";

// ========================
// Funções de validação assíncrona
// ========================
export async function verificarEmailDuplicado(email: string): Promise<{ duplicado: boolean; mensagem?: string }> {
    try {
        const response = await fetch("/api/empresas/check-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            console.warn("Erro ao verificar email", response.status);
            return { duplicado: false };
        }

        const data = await response.json();
        if (data.exists) {
            return { duplicado: true, mensagem: "Este email já foi cadastrado. Por favor, use outro email." };
        }
        return { duplicado: false };
    } catch (error) {
        console.error("Erro ao verificar email:", error);
        return { duplicado: false };
    }
}

export async function verificarCNPJDuplicado(cnpj: string): Promise<{ duplicado: boolean; mensagem?: string }> {
    try {
        const response = await fetch("/api/empresas/check-cnpj", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cnpj }),
        });

        if (!response.ok) {
            console.warn("Erro ao verificar CNPJ", response.status);
            return { duplicado: false };
        }

        const data = await response.json();
        if (data.exists) {
            return { duplicado: true, mensagem: "Este CNPJ já foi cadastrado. Por favor, use outro CNPJ." };
        }
        return { duplicado: false };
    } catch (error) {
        console.error("Erro ao verificar CNPJ:", error);
        return { duplicado: false };
    }
}

// ========================
// Funções de transação (integração com o backend)
// ========================
export async function iniciarTransacao(empresaId: string, plano: string) {
    try {
        const response = await fetch("/api/transacoes/iniciar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ empresaId, plano }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao iniciar transação");

        return data.transacao;
    } catch (error) {
        console.error("Erro ao iniciar transação:", error);
        throw error;
    }
}

export async function finalizarTransacao(transacaoId: string) {
    try {
        const response = await fetch("/api/transacoes/finalizar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transacaoId }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao finalizar transação");

        return data;
    } catch (error) {
        console.error("Erro ao finalizar transação:", error);
        throw error;
    }
}

// ========================
// Tipos genéricos
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
// Hook principal de controle
// ========================
export function useDiagnostico<Respostas extends Record<string, string>>(
    perguntas: Pergunta<Respostas>[],
    respostasIniciais: Respostas,
    onsubmit?: (respostas: Respostas) => void,
) {
    const _router = useRouter();
    const [etapaAtual, setEtapaAtual] = useState(0);
    const [respostas, setRespostas] = useState<Respostas>(respostasIniciais);
    const [showValidationError, setShowValidationError] = useState(false);
    const [erroCnpj, setErroCnpj] = useState("");
    const [erroEmail, setErroEmail] = useState("");

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
        erroCnpj,
        setErroCnpj,
        erroEmail,
        setErroEmail,
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
                    className="bg-linear-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${porcentagem}%` }}
                ></div>
            </div>
        </div>
    );
}

function InputField<Respostas extends Record<string, string>>({
    pergunta,
    valor,
    onChange,
    respostas,
    showValidationError = false,
    erroCnpj,
    setErroCnpj,
    erroEmail,
    setErroEmail,
}: {
    pergunta: Pergunta<Respostas>;
    valor: string;
    onChange: (campo: keyof Respostas, valor: string) => void;
    respostas: Respostas;
    showValidationError?: boolean;
    erroCnpj: string;
    setErroCnpj: React.Dispatch<React.SetStateAction<string>>;
    erroEmail: string;
    setErroEmail: React.Dispatch<React.SetStateAction<string>>;
}) {
    const { valid, message } = validateField(pergunta.id as string, valor);
    const isCNPJ = pergunta.id.toString().toLowerCase().includes("cnpj");
    const isEmail = pergunta.id.toString().toLowerCase().includes("email");
    const hasError = showValidationError && (
        isCNPJ ? (!valid || erroCnpj !== "") : 
        isEmail ? (!valid || erroEmail !== "") : 
        !valid
    );

    const handleTextChange = async (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = isCNPJ ? formatCNPJ(e.target.value) : e.target.value;
        onChange(pergunta.id, value);

        // Limpa erros quando usuário edita o campo
        if (isEmail && erroEmail) {
            setErroEmail("");
        }
        if (isCNPJ && erroCnpj) {
            setErroCnpj("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !(pergunta.tipo === "textarea" && !e.ctrlKey)) {
            e.preventDefault();
            const proximoBtn = document.querySelector(
                "[data-advance-button]"
            ) as HTMLButtonElement;
            if (proximoBtn && !proximoBtn.disabled) {
                proximoBtn.click();
            }
        }
    };
    
    if (pergunta.tipo === "select") {
        const mostraTextAreaOutros = pergunta.temOutros && valor === "outros";
        return (
            <div className="space-y-4">
                <select
                    value={valor}
                    onChange={(e) => onChange(pergunta.id, e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-pink-500 text-center cursor-pointer"
                >
                    {pergunta.opcoes?.map((opcao) => (
                        <option key={opcao.valor} value={opcao.valor} className="text-gray-800 bg-white">
                            {opcao.texto}
                        </option>
                    ))}
                </select>
                {mostraTextAreaOutros && pergunta.campoOutros && (
                    <div className="animate-fade-in-up">
                        <label htmlFor={`outros-${String(pergunta.id)}`} className="block text-white text-sm font-medium mb-2">Por favor, especifique:</label>
                        <textarea
                            id={`outros-${String(pergunta.id)}`}
                            value={respostas[pergunta.campoOutros as keyof Respostas]}
                            onChange={(e) => onChange(pergunta.campoOutros as keyof Respostas, e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                            placeholder="Descreva..."
                            rows={3}
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
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                className={`w-full px-4 py-3 rounded-lg bg-white/20 border ${hasError ? "border-red-400" : "border-white/30"} text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                placeholder={pergunta.placeholder}
                rows={pergunta.rows || 4}
            />
        );
    }
    
    return (
        <div className="space-y-2">
            <input
                type={pergunta.id === 'email' ? 'email' : 'text'}
                value={valor}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                className={`w-full px-4 py-3 rounded-lg bg-white/20 border ${hasError ? "border-red-400" : "border-white/30"} text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center`}
                placeholder={pergunta.placeholder}
                maxLength={isCNPJ ? 18 : undefined}
            />
            {hasError && (
                <p className="text-red-400 text-sm text-center">
                    {isEmail && erroEmail ? erroEmail : isCNPJ && erroCnpj ? erroCnpj : message}
                </p>
            )}
        </div>
    );
}

function NavigationButtons({
    etapaAtual,
    totalEtapas,
    podeAvancar,
    onProximo,
    onAnterior,
    onSubmit,
    isUltimaDimensao = true,
    onTryAdvance,
    showValidationError,
}: {
    etapaAtual: number;
    totalEtapas: number;
    podeAvancar: boolean;
    onProximo: () => void | Promise<void>;
    onAnterior: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isUltimaDimensao?: boolean;
    onTryAdvance?: () => void;
    showValidationError: boolean;
}) {
    const ehUltimaEtapa = etapaAtual === totalEtapas - 1;
    const ehFinalDiagnostico = ehUltimaEtapa && isUltimaDimensao;

    const handleAdvanceClick = async () => {
        onTryAdvance?.();
        if (podeAvancar) {
                if (ehUltimaEtapa) {
                onSubmit(new Event("submit") as unknown as React.FormEvent);
            } else {
                await onProximo();
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
                disabled={!podeAvancar && showValidationError}
                className={`cursor-pointer px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${podeAvancar ? "bg-linear-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg" : "bg-gray-500/50 text-gray-400 cursor-not-allowed"}`}
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
        erroCnpj,
        setErroCnpj,
        erroEmail,
        setErroEmail,
    } = useDiagnostico(perguntas, respostasIniciais, onSubmit);

    const perguntaAtual = perguntas[etapaAtual];
    const valorAtual = respostas[perguntaAtual.id] || "";
    
    const { valid } = validateField(perguntaAtual.id as string, valorAtual);
    const isEmailValid = !(perguntaAtual.id === 'email' && valorAtual && !validator.isEmail(valorAtual));
    const isCNPJField = perguntaAtual.id.toString().toLowerCase().includes("cnpj");
    const isEmailField = perguntaAtual.id.toString().toLowerCase().includes("email");
    
    let podeAvancar = valid && isEmailValid && (!isCNPJField || erroCnpj === "") && (!isEmailField || erroEmail === "");
    
    if (perguntaAtual.required) {
        podeAvancar = podeAvancar && valorAtual.trim() !== "";
    }
    
    if (perguntaAtual.temOutros && valorAtual === "outros" && perguntaAtual.campoOutros) {
        const valorOutros = respostas[perguntaAtual.campoOutros] || "";
        podeAvancar = podeAvancar && valorOutros.trim() !== "";
    }

    const handleProximaEtapaComValidacao = async () => {
        // Limpa erros anteriores
        setErroEmail("");
        setErroCnpj("");
        
        // Valida email duplicado
        if (isEmailField && valorAtual && validator.isEmail(valorAtual)) {
            const { duplicado, mensagem } = await verificarEmailDuplicado(valorAtual);
            if (duplicado) {
                setErroEmail("Email já utilizado, tente outro!");
                setShowValidationError(true);
                return;
            }
        }
        
        // Valida CNPJ duplicado
        if (isCNPJField && valorAtual && validateCNPJ(valorAtual)) {
            const { duplicado, mensagem } = await verificarCNPJDuplicado(valorAtual);
            if (duplicado) {
                setErroCnpj("CNPJ já utilizado, tente outro!");
                setShowValidationError(true);
                return;
            }
        }
        
        // Se passou nas validações, avança
        proximaEtapa();
    };

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
                <svg aria-hidden="true" focusable="false" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        erroCnpj={erroCnpj}
                        setErroCnpj={setErroCnpj}
                        erroEmail={erroEmail}
                        setErroEmail={setErroEmail}
                    />
                </div>

                <NavigationButtons
                    etapaAtual={etapaAtual}
                    totalEtapas={perguntas.length}
                    podeAvancar={podeAvancar}
                    onProximo={handleProximaEtapaComValidacao}
                    onAnterior={etapaAnterior}
                    onSubmit={handleSubmit}
                    isUltimaDimensao={isUltimaDimensao}
                    onTryAdvance={handleTryAdvance}
                    showValidationError={showValidationError}
                />
            </div>

            <div className="-z-10">
                <Ondas />
            </div>
        </main>
    );
}