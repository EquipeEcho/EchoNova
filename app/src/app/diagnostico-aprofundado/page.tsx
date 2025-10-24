// app/src/app/diagnostico-aprofundado/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/useAuthStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Headernaofix, Ondas } from "../clientFuncs";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Pencil } from "lucide-react";

// --- (As interfaces e constantes permanecem as mesmas) ---
// --- TIPOS E INTERFACES ---
type FaseDiagnostico = "setup" | "confirmacao" | "diagnostico" | "finalizado";

interface SetupData {
    nomeEmpresa: string;
    nomeRepresentante: string;
    setor: string;
    numFuncionarios: string;
    numUnidades: string;
    politicaLgpd: string;
    prazo: string;
}

interface Pergunta {
    texto: string;
    tipo_resposta: "texto" | "numero" | "multipla_escolha" | "selecao" | "sim_nao";
    opcoes: string[] | null;
    placeholder?: string | null;
}

const initialSetupQuestions = [
    { id: 'nomeEmpresa', label: 'Nome da Empresa', type: 'texto' },
    { id: 'nomeRepresentante', label: 'Nome do Representante', type: 'texto' },
    { id: 'setor', label: 'Setor de Atuação', type: 'selecao', opcoes: ["Tecnologia", "Saúde", "Educação", "Financeiro", "Varejo", "Industrial", "Outros"] },
    { id: 'numFuncionarios', label: 'Número de Funcionários', type: 'numero' },
    { id: 'numUnidades', label: 'Número de Unidades/Filiais', type: 'numero' },
    { id: 'politicaLgpd', label: 'Há políticas de LGPD a respeitar?', type: 'sim_nao' },
    { id: 'prazo', label: 'Prazo para entrega do diagnóstico?', type: 'texto' },
];

export default function DiagnosticoAprofundadoPage() {
    const router = useRouter();
    // Verifica se o usuário está logado usando nosso store
    const user = useAuthStore((state) => state.user);

    // Redireciona se não estiver logado
    useEffect(() => {
        if (!user) {
            toast.error("Você precisa estar logado para acessar esta página.");
            router.push("/cadastroLogin");
        }
    }, [user, router]);
    
    // --- (O resto dos seus estados permanecem os mesmos) ---
    const [fase, setFase] = useState<FaseDiagnostico>("setup");
    const [setupStep, setSetupStep] = useState(0);
    const [setupData, setSetupData] = useState<SetupData>({
        nomeEmpresa: user?.nome_empresa || "", nomeRepresentante: "", setor: "", numFuncionarios: "", numUnidades: "", politicaLgpd: "", prazo: ""
    });
    const [editingField, setEditingField] = useState<keyof SetupData | null>(null);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [perguntaAtual, setPerguntaAtual] = useState<Pergunta | null>(null);
    const [resposta, setResposta] = useState<string>("");
    const [relatorioFinal, setRelatorioFinal] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- (Lógicas de handleSetupChange, handleNextSetupStep, iniciarDiagnostico permanecem as mesmas) ---
     const handleSetupChange = (field: keyof SetupData, value: string) => {
        setSetupData(prev => ({ ...prev, [field]: value }));
    };

    const handleNextSetupStep = () => {
        const currentField = initialSetupQuestions[setupStep].id as keyof SetupData;
        if (setupData[currentField].trim() === "") {
            toast.error("Por favor, preencha o campo para continuar.");
            return;
        }
        if (setupStep < initialSetupQuestions.length - 1) {
            setSetupStep(prev => prev + 1);
        } else {
            setFase("confirmacao");
        }
    };
    
     const iniciarDiagnostico = async () => {
        setIsLoading(true);
        setFase("diagnostico");
        const setupResumo = `
            Aqui estão os dados iniciais da empresa:
            - Nome da Empresa: ${setupData.nomeEmpresa}
            - Representante: ${setupData.nomeRepresentante}
            - Setor: ${setupData.setor}
            - Nº de Funcionários: ${setupData.numFuncionarios}
            - Nº de Unidades: ${setupData.numUnidades}
            - Respeitar LGPD: ${setupData.politicaLgpd}
            - Prazo: ${setupData.prazo}
            
            Com base nisso, pode começar o diagnóstico com a primeira pergunta investigativa.
        `;
        await processarResposta(setupResumo, true);
    };

    const processarResposta = async (respostaUsuario: string, isInitial = false) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const res = await fetch("/api/diagnostico-ia", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId: isInitial ? null : sessionId,
                    resposta_usuario: respostaUsuario,
                    // CORREÇÃO: Removemos o empresaId daqui. O backend vai pegá-lo do cookie.
                }),
            });

            if (!res.ok) {
                 const errorData = await res.json();
                 throw new Error(errorData.error || `Falha no servidor: ${res.statusText}`);
            }
            
            const data = await res.json();
            if (data.error) throw new Error(data.details || data.error);

            if (!sessionId) setSessionId(data.sessionId);

            if (data.status === "finalizado") {
                setRelatorioFinal(data.relatorio_final);
                setFase("finalizado");
            } else {
                setPerguntaAtual(data.proxima_pergunta);
                setFase("diagnostico");
            }
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
            setResposta("");
        }
    };
    
    // --- (Todas as funções de renderização permanecem as mesmas) ---
    const renderInputField = (type: string, value: string, onChange: (value: string) => void, options?: string[], placeholder?: string | null) => {
        const commonProps = {
            className: "bg-slate-700 border-slate-500 text-center text-lg",
            autoFocus: true,
            placeholder: placeholder || undefined,
        };

        switch (type) {
            case 'numero':
                return <Input {...commonProps} type="text" inputMode="numeric" pattern="[0-9]*" value={value} onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))} placeholder={placeholder || "Digite um número..."} />;
            case 'selecao':
                return <Select value={value} onValueChange={onChange}>
                    <SelectTrigger {...commonProps} className="w-full h-auto py-3"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                        {options?.map(opt => <SelectItem key={opt} value={opt} className="focus:bg-[#ff0055]/20 focus:text-white cursor-pointer">{opt}</SelectItem>)}
                    </SelectContent>
                </Select>;
            case 'sim_nao':
                return <div className="flex justify-center gap-4">
                    <Button
                        size="lg"
                        variant={value === "Sim" ? "default" : "outline"}
                        className={value === "Sim" 
                            ? "bg-[#ff0055] hover:bg-[#ff3366] text-white" 
                            : "border-slate-500 text-slate-300 hover:bg-slate-600"
                        }
                        onClick={() => onChange("Sim")}
                    >
                        Sim
                    </Button>
                    <Button
                        size="lg"
                        variant={value === "Não" ? "default" : "outline"}
                        className={value === "Não" 
                            ? "bg-[#ff0055] hover:bg-[#ff3366] text-white" 
                            : "border-slate-500 text-slate-300 hover:bg-slate-600"
                        }
                        onClick={() => onChange("Não")}
                    >
                        Não
                    </Button>
                </div>;
            default: // texto
                return <Input {...commonProps} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Digite sua resposta..."} />;
        }
    };
    
     const renderContent = () => {
        if (isLoading) return <Loader text="Carregando..." />;
        if (error && fase !== 'diagnostico') return <div className="text-red-400 text-center">{error}</div>;

        switch (fase) {
            case 'setup':
                const currentQ = initialSetupQuestions[setupStep];
                return (
                    <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full text-center">
                        <ProgressBar currentStep={setupStep} totalSteps={initialSetupQuestions.length} />
                        <h2 className="text-2xl font-semibold leading-relaxed mb-8">{currentQ.label}</h2>
                        <div className="space-y-4">
                            {renderInputField(currentQ.type, setupData[currentQ.id as keyof SetupData], (val) => handleSetupChange(currentQ.id as keyof SetupData, val), currentQ.opcoes)}
                            <PrimaryButton 
                                size="lg" 
                                onClick={handleNextSetupStep} 
                                disabled={!setupData[currentQ.id as keyof SetupData]?.trim()}
                            >
                                {setupStep === initialSetupQuestions.length - 1 ? "Revisar Dados" : "Próximo"}
                            </PrimaryButton>
                        </div>
                    </div>
                );

            case 'confirmacao':
                return (
                    <div className="bg-slate-800 p-8 rounded-lg shadow-xl text-center space-y-6 w-full">
                        <h2 className="text-2xl font-semibold">Confirme os dados coletados</h2>
                        <div className="text-left p-4 bg-slate-700 rounded-md border border-slate-600 space-y-3">
                            {initialSetupQuestions.map(({ id, label }) => (
                                <div key={id} className="flex justify-between items-center gap-4">
                                    <span className="font-semibold text-neutral-300">{label}:</span>
                                    {editingField === id ? (
                                        <Input
                                            type="text"
                                            value={setupData[id as keyof SetupData]}
                                            onChange={(e) => handleSetupChange(id as keyof SetupData, e.target.value)}
                                            onBlur={() => setEditingField(null)}
                                            autoFocus
                                            className="bg-slate-600 border-slate-500 text-right text-lg"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-white text-right">{setupData[id as keyof SetupData]}</span>
                                            <Pencil className="h-4 w-4 text-neutral-400 hover:text-white cursor-pointer" onClick={() => setEditingField(id as keyof SetupData)} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-4 pt-4">
                            <PrimaryButton size="lg" onClick={iniciarDiagnostico}>Confirmar e Iniciar Diagnóstico</PrimaryButton>
                            <Button size="lg" variant="outline" className="border-[#ff0055] text-[#ff0055] hover:bg-[#ff0055]/10" onClick={() => { setFase('setup'); setSetupStep(0); }}>Voltar e Corrigir</Button>
                        </div>
                    </div>
                );

            case 'diagnostico':
                if (!perguntaAtual) return <Loader text="Aguardando primeira pergunta..." />;
                return (
                    <div className="bg-slate-800 p-8 rounded-lg shadow-xl text-center space-y-8 w-full">
                        <h2 className="text-2xl font-semibold leading-relaxed">{perguntaAtual.texto}</h2>
                         <form onSubmit={(e) => { e.preventDefault(); if (resposta.trim()) processarResposta(resposta, false); }}>
                            <div className="space-y-4">
                                {renderInputField(perguntaAtual.tipo_resposta, resposta, setResposta, perguntaAtual.opcoes, perguntaAtual.placeholder)}
                                {
                                    (perguntaAtual.tipo_resposta === "texto" ||
                                     perguntaAtual.tipo_resposta === "numero" ||
                                     perguntaAtual.tipo_resposta === "selecao") && (
                                        <PrimaryButton type="submit" size="lg" disabled={!resposta.trim()}>
                                            Próximo
                                        </PrimaryButton>
                                    )
                                }
                            </div>
                        </form>
                    </div>
                );
                
            case 'finalizado':
                 return (
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full">
                        <h1 className="text-3xl font-bold mb-4 border-b border-slate-600 pb-2">Diagnóstico Concluído</h1>
                        <div className="prose prose-invert prose-lg max-w-none"><ReactMarkdown>{relatorioFinal}</ReactMarkdown></div>
                    </div>
                );
        }
    };

    return (
        <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                {renderContent()}
            </div>
            <div className="-z-10">
                <Ondas />
            </div>
        </main>
    );
}