// app/src/app/diagnostico-aprofundado/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { jsPDF } from "jspdf";

// Componentes da UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ondas } from "../clientFuncs";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Pencil, Save, RefreshCw } from "lucide-react";

type FaseDiagnostico = "setup" | "confirmacao" | "diagnostico" | "finalizado";

interface SetupData {
    nomeEmpresa: string;
    nomeRepresentante: string;
    setor: string;
    numFuncionarios: string;
    numUnidades: string;
    politicaLgpd: string;
}

interface Pergunta {
    texto: string;
    tipo_resposta: "texto" | "numero" | "multipla_escolha" | "selecao" | "sim_nao";
    opcoes: string[] | null;
    placeholder?: string | null;
}

interface ProgressState {
    currentStep: number;
    totalSteps: number;
}

const initialSetupQuestions = [
    { id: 'nomeEmpresa', label: 'Nome da Empresa', type: 'texto' },
    { id: 'nomeRepresentante', label: 'Nome do Representante', type: 'texto' },
    { id: 'setor', label: 'Setor de Atuação', type: 'selecao', opcoes: ["Tecnologia", "Saúde", "Educação", "Financeiro", "Varejo", "Industrial", "Outros"] },
    { id: 'numFuncionarios', label: 'Número de Funcionários', type: 'numero' },
    { id: 'numUnidades', label: 'Número de Unidades/Filiais', type: 'numero' },
    { id: 'politicaLgpd', label: 'Há políticas de LGPD a respeitar?', type: 'sim_nao' },
];

export default function DiagnosticoAprofundadoPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    const [fase, setFase] = useState<FaseDiagnostico>("setup");
    const [setupStep, setSetupStep] = useState(0);
    const [setupData, setSetupData] = useState<SetupData>({
        nomeEmpresa: "", nomeRepresentante: "", setor: "", numFuncionarios: "", numUnidades: "", politicaLgpd: ""
    });
    const [editingField, setEditingField] = useState<keyof SetupData | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [perguntaAtual, setPerguntaAtual] = useState<Pergunta | null>(null);
    const [resposta, setResposta] = useState<string>("");
    const [relatorioFinal, setRelatorioFinal] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<ProgressState | null>(null);

    useEffect(() => {
      if (isClient && user) {
        setSetupData(prev => ({ ...prev, nomeEmpresa: user.nome_empresa || "" }));
      }
    }, [isClient, user]);
    
    const handleSetupChange = (field: keyof SetupData, value: string) => {
        setSetupData(prev => ({ ...prev, [field]: value }));
    };

    const handleNextSetupStep = () => {
        const currentField = initialSetupQuestions[setupStep].id as keyof SetupData;
        if (!setupData[currentField] || setupData[currentField].trim() === "") {
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
        setProgress(null);
        const setupResumo = `
            Os dados iniciais da empresa já foram coletados e CONFIRMADOS pelo usuário. São eles:
            - Nome da Empresa: ${setupData.nomeEmpresa}
            - Representante: ${setupData.nomeRepresentante}
            - Setor: ${setupData.setor}
            - Nº de Funcionários: ${setupData.numFuncionarios}
            - Nº de Unidades: ${setupData.numUnidades}
            - Respeitar LGPD: ${setupData.politicaLgpd}
            A etapa de confirmação está CONCLUÍDA.
            Por favor, inicie o diagnóstico fazendo a PRIMEIRA PERGUNTA INVESTIGATIVA agora.
        `;
        setFase("diagnostico");
        await processarResposta(setupResumo, true);
    };

    const processarResposta = async (respostaUsuario: string, isInitial = false) => {
        if (perguntaAtual?.texto.includes("Estou pronto para compilar") && respostaUsuario.toLowerCase() === 'não') {
            toast.error("Geração do relatório cancelada. O diagnóstico foi reiniciado.");
            handleRefazerDiagnostico();
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/diagnostico-ia", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: isInitial ? null : sessionId, resposta_usuario: respostaUsuario }),
            });
            if (!res.ok) {
                 const errorData = await res.json();
                 throw new Error(errorData.error || `Falha no servidor: ${res.statusText}`);
            }
            const data = await res.json();
            if (data.error) throw new Error(data.details || data.error);

            if (!sessionId) setSessionId(data.sessionId);
            
            if(data.progress) {
                setProgress({
                    currentStep: data.progress.currentStep,
                    totalSteps: data.progress.totalSteps
                });
            }

            if (data.status === "finalizado") {
                setRelatorioFinal(data.relatorio_final);
                setFase("finalizado");
                setProgress(null);
            } else if (data.status === "confirmacao" || data.status === "confirmação") {
                setFase("confirmacao");
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

    const handleRefazerDiagnostico = () => {
        toast.info("O diagnóstico foi reiniciado.");
        setFase("setup");
        setSetupStep(0);
        setSetupData({
            nomeEmpresa: user?.nome_empresa || "",
            nomeRepresentante: "",
            setor: "",
            numFuncionarios: "",
            numUnidades: "",
            politicaLgpd: "",
        });
        setEditingField(null);
        setSessionId(null);
        setPerguntaAtual(null);
        setResposta("");
        setRelatorioFinal(null);
        setIsLoading(false);
        setError(null);
        setProgress(null);
    };

    const handleDownloadPdf = () => {
        if (!relatorioFinal) {
            toast.error("Conteúdo do relatório não disponível.");
            return;
        }
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const textWidth = pageWidth - margin * 2;
            let yPos = margin;
            const lineHeight = 7;
            const backgroundColor = '#1E293B';

            const addNewPage = () => {
                doc.addPage();
                doc.setFillColor(backgroundColor);
                doc.rect(0, 0, pageWidth, pageHeight, 'F');
                yPos = margin;
            };

            doc.setFillColor(backgroundColor);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            doc.setTextColor(255, 255, 255);

            const markdownLines = relatorioFinal.split('\n');

            markdownLines.forEach(line => {
                if (yPos > pageHeight - margin) addNewPage();

                let processedLine = line;
                doc.setFont("helvetica", "normal");
                doc.setFontSize(11);

                if (line.startsWith('# ')) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(18);
                    processedLine = line.substring(2);
                    yPos += lineHeight / 2;
                } else if (line.startsWith('### ')) {
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(14);
                    processedLine = line.substring(4);
                    yPos += lineHeight / 3;
                } else if (line.startsWith('* ')) {
                    processedLine = `• ${line.substring(2)}`;
                } else if (line.trim() === '***') {
                    doc.setDrawColor(255, 255, 255);
                    doc.line(margin, yPos, pageWidth - margin, yPos);
                    yPos += lineHeight;
                    return;
                }
                
                const textLines = doc.splitTextToSize(processedLine, textWidth);
                
                textLines.forEach((textLine: string) => {
                    if (yPos > pageHeight - margin) addNewPage();
                    doc.text(textLine, margin, yPos);
                    yPos += lineHeight;
                });

                if (line.startsWith('# ') || line.startsWith('### ')) yPos += lineHeight / 2;
            });

            doc.save(`diagnostico-${setupData.nomeEmpresa.replace(/\s+/g, '_')}.pdf`);
            toast.success("Download do PDF iniciado!");
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            toast.error("Não foi possível gerar o PDF.");
        }
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const form = event.currentTarget.closest('form');
            if (form) {
                const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                if (submitButton && !submitButton.disabled) submitButton.click();
            }
        }
    };
    
    const renderInputField = (currentFase: FaseDiagnostico, type: string, value: string, onChange: (value: string) => void, options?: string[] | null, placeholder?: string | null) => {
        const commonInputProps = {
            className: "bg-slate-700 border-slate-500 text-center text-lg",
            autoFocus: true,
            placeholder: placeholder || undefined,
            onKeyDown: handleKeyDown,
        };
        
        const commonSelectProps = {
            className: "bg-slate-700 border-slate-500 text-center text-lg w-full h-auto py-3",
        };

        switch (type) {
            case 'numero':
            case 'texto':
                return <Input {...commonInputProps} type="text" value={value} onChange={(e) => onChange(e.target.value)} />;
            case 'selecao':
                const handleSelectChange = (selectValue: string) => {
                    onChange(selectValue);
                    if (currentFase === 'diagnostico') {
                        setTimeout(() => processarResposta(selectValue), 100);
                    }
                };
                return <Select value={value} onValueChange={handleSelectChange}>
                    <SelectTrigger {...commonSelectProps}><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                        {options && options.map(opt => <SelectItem key={opt} value={opt} className="focus:bg-pink-500/20 focus:text-white cursor-pointer">{opt}</SelectItem>)}
                    </SelectContent>
                </Select>;
            case 'sim_nao':
                const handleButtonClick = (buttonValue: string) => {
                    onChange(buttonValue);
                    if (currentFase === 'diagnostico') {
                        setTimeout(() => processarResposta(buttonValue), 100);
                    }
                };
                return <div className="flex justify-center gap-4">
                    <Button
                        size="lg"
                        onClick={() => handleButtonClick("Sim")}
                        className={value === "Sim" ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white" : "border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-white"}
                        variant={value === "Sim" ? "default" : "outline"}
                    >
                        Sim
                    </Button>
                    <Button
                        size="lg"
                        onClick={() => handleButtonClick("Não")}
                        className={value === "Não" ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white" : "border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-white"}
                        variant={value === "Não" ? "default" : "outline"}
                    >
                        Não
                    </Button>
                </div>;
            default:
                return <Input {...commonInputProps} type="text" value={value} onChange={(e) => onChange(e.target.value)} />;
        }
    };
    
     const renderContent = () => {
        if (isLoading) return <Loader text="Carregando..." />;
        if (error && fase !== 'diagnostico') return <div className="text-red-400 text-center">{error}</div>;

        switch (fase) {
            case 'setup':
                const currentQ = initialSetupQuestions[setupStep];
                return (
                    <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full text-center" key={`setup-fase-${setupStep}`}>
                        <ProgressBar currentStep={setupStep} totalSteps={initialSetupQuestions.length} />
                        <h2 className="text-2xl font-semibold leading-relaxed mb-8">{currentQ.label}</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleNextSetupStep(); }} className="space-y-4">
                            {renderInputField(fase, currentQ.type, setupData[currentQ.id as keyof SetupData], (val) => handleSetupChange(currentQ.id as keyof SetupData, val), currentQ.opcoes)}
                            <PrimaryButton 
                                size="lg" 
                                type="submit"
                                disabled={!setupData[currentQ.id as keyof SetupData]?.trim()}
                            >
                                {setupStep === initialSetupQuestions.length - 1 ? "Revisar Dados" : "Próximo"}
                            </PrimaryButton>
                        </form>
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
                            <PrimaryButton size="lg" onClick={iniciarDiagnostico}>Confirmar e Iniciar</PrimaryButton>
                            <Button size="lg" variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-white" onClick={() => { setFase('setup'); setSetupStep(0); }}>Voltar e Corrigir</Button>
                        </div>
                    </div>
                );

            case 'diagnostico':
                if (!perguntaAtual) return <Loader text="Aguardando primeira pergunta..." />;
                return (
                    <div className="bg-slate-800 p-8 rounded-lg shadow-xl text-center space-y-8 w-full">
                        {progress ? (
                            // Se o total de passos for maior que 2, significa que a IA já calculou o total real.
                            progress.totalSteps > 2 ? (
                                <ProgressBar currentStep={progress.currentStep - 1} totalSteps={progress.totalSteps} />
                            ) : (
                                // Caso contrário, mostramos apenas a etapa atual, sem a barra percentual.
                                <div className="mb-8 w-full h-[35px] flex items-center justify-center">
                                    <h3 className="text-lg font-semibold text-neutral-300">
                                        Etapa {progress.currentStep}
                                    </h3>
                                </div>
                            )
                        ) : (
                            <div className="h-[35px] mb-8 w-full"></div>
                        )}
                        <h2 className="text-2xl font-semibold leading-relaxed">{perguntaAtual.texto}</h2>
                         <form onSubmit={(e) => { e.preventDefault(); if (resposta.trim() || perguntaAtual.tipo_resposta === 'sim_nao') processarResposta(resposta, false); }}>
                            <div className="space-y-4">
                                {renderInputField(fase, perguntaAtual.tipo_resposta, resposta, setResposta, perguntaAtual.opcoes, perguntaAtual.placeholder)}
                                { (perguntaAtual.tipo_resposta !== "selecao" && perguntaAtual.tipo_resposta !== "sim_nao") && (
                                    <PrimaryButton type="submit" size="lg" disabled={!resposta.trim()}>
                                        Próximo
                                    </PrimaryButton>
                                )}
                            </div>
                        </form>
                    </div>
                );
                
            case 'finalizado':
                 return (
                    <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full">
                        <h1 className="text-3xl font-bold text-center mb-6 border-b border-slate-600 pb-4">Diagnóstico Concluído</h1>
                        <div className="prose prose-invert prose-lg max-w-none mb-8">
                            <ReactMarkdown>{relatorioFinal}</ReactMarkdown>
                        </div>
                        
                        <div className="mt-10 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-center gap-4">
                            <PrimaryButton 
                                size="lg"
                                onClick={handleDownloadPdf}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Salvar em PDF
                            </PrimaryButton>
                            <Button 
                                size="lg" 
                                variant="outline" 
                                className="border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-white"
                                onClick={handleRefazerDiagnostico}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refazer Diagnóstico
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    if (!isClient) {
        return (
            <main className="flex h-screen items-center justify-center bg-slate-900">
                <Loader text="Carregando..." />
            </main>
        );
    }

    return (
        <main className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full max-w-3xl relative z-10">
                {renderContent()}
            </div>
            <div className="-z-10">
                <Ondas />
            </div>
        </main>
    );
}