// ... (imports permanecem os mesmos) ...

// --- ATENÇÃO: Apenas a função `processarResposta` e a `case 'finalizado'` mudam. O resto do arquivo fica igual. ---
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

            // --- CORREÇÃO (Fluxo Pós-Diagnóstico) ---
            // Verifica se a API retornou o ID do diagnóstico finalizado.
            if (data.status === "finalizado" && data.finalDiagnosticId) {
                toast.success("Diagnóstico concluído! Redirecionando para os resultados...");
                // Redireciona para a página de resultados dedicada.
                router.push(`/diagnostico-aprofundado/resultados/${data.finalDiagnosticId}`);
                // Não precisamos mais das linhas abaixo, pois a nova página cuidará da exibição.
                // setRelatorioFinal(data.relatorio_final);
                // setFase("finalizado");
                // setProgress(null);
            } else if (data.status === "confirmacao" || data.status === "confirmação") {
                setFase("confirmacao"); // Mantém a lógica de confirmação se necessário
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
    
    // As funções handleDownloadPdf e handleKeyDown podem permanecer as mesmas,
    // pois a lógica de download agora estará na página de resultados.
    // ... (resto do arquivo permanece igual até a função renderContent)
    
    // --- FUNÇÕES REMOVIDAS POIS NÃO SÃO MAIS NECESSÁRIAS NESTA PÁGINA ---
    // const handleDownloadPdf = () => { ... }

     const renderContent = () => {
        if (isLoading) return <Loader text="Processando..." />;
        if (error && fase !== 'diagnostico') return <div className="text-red-400 text-center">{error}</div>;

        switch (fase) {
            case 'setup':
                 // ... (código da fase 'setup' permanece o mesmo)
            case 'confirmacao':
                // ... (código da fase 'confirmacao' permanece o mesmo)
            case 'diagnostico':
                 // ... (código da fase 'diagnostico' permanece o mesmo)

            // --- REMOÇÃO ---
            // A fase 'finalizado' não é mais renderizada aqui. O usuário será redirecionado
            // para a página de resultados, tornando este bloco obsoleto.
            /*
            case 'finalizado':
                 return ( ... );
            */
        }
         // ... (renderInputField, etc., permanecem iguais) ...
    };

    // O restante do arquivo (funções de renderização, JSX) permanece o mesmo.
    // A única alteração visual é que o case 'finalizado' dentro de `renderContent` nunca mais será alcançado.
    // O código completo é omitido por brevidade, mas as mudanças lógicas estão acima.
    // ... (cole o restante do arquivo original aqui, exceto o case 'finalizado' e handleDownloadPdf)
}