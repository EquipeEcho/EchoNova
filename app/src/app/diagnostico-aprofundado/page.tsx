// src/app/diagnostico-aprofundado/page.tsx
"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/useAuthStore";

// Componentes da UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  tipo_resposta:
    | "texto"
    | "numero"
    | "multipla_escolha"
    | "selecao"
    | "sim_nao";
  opcoes: string[] | null;
  placeholder?: string | null;
}

interface ProgressState {
  currentStep: number;
  totalSteps: number;
}

const initialSetupQuestions = [
  { id: "nomeEmpresa", label: "Nome da Empresa", type: "texto" },
  { id: "nomeRepresentante", label: "Nome do Representante", type: "texto" },
  {
    id: "setor",
    label: "Setor de Atuação",
    type: "selecao",
    opcoes: [
      "Tecnologia",
      "Saúde",
      "Educação",
      "Financeiro",
      "Varejo",
      "Industrial",
      "Outros",
    ],
  },
  { id: "numFuncionarios", label: "Número de Funcionários", type: "numero" },
  { id: "numUnidades", label: "Número de Unidades/Filiais", type: "numero" },
  {
    id: "politicaLgpd",
    label: "Há políticas de LGPD a respeitar?",
    type: "sim_nao",
    opcoes: ["Sim", "Não"],
  },
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
    nomeEmpresa: "",
    nomeRepresentante: "",
    setor: "",
    numFuncionarios: "",
    numUnidades: "",
    politicaLgpd: "",
  });
  const [editingField, setEditingField] = useState<keyof SetupData | null>(
    null
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [perguntaAtual, setPerguntaAtual] = useState<Pergunta | null>(null);
  const [resposta, setResposta] = useState<string>("");
  const [relatorioFinal, setRelatorioFinal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [dadosColetados, setDadosColetados] = useState<any | null>(null); // Estado para o resumo

  useEffect(() => {
    if (isClient && user) {
      setSetupData((prev) => ({ ...prev, nomeEmpresa: user.nome_empresa || "" }));
    }
  }, [isClient, user]);

  const handleSetupChange = (field: keyof SetupData, value: string) => {
    setSetupData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextSetupStep = () => {
    const currentField = initialSetupQuestions[setupStep].id as keyof SetupData;
    if (!setupData[currentField] || setupData[currentField].trim() === "") {
      toast.error("Por favor, preencha o campo para continuar.");
      return;
    }
    if (setupStep < initialSetupQuestions.length - 1) {
      setSetupStep((prev) => prev + 1);
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
    if (
      perguntaAtual?.texto.includes("Estou pronto para compilar") &&
      respostaUsuario.toLowerCase() === "não"
    ) {
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
        body: JSON.stringify({
          sessionId: isInitial ? null : sessionId,
          resposta_usuario: respostaUsuario,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Falha no servidor: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.details || data.error);

      if (!sessionId) setSessionId(data.sessionId);
      
      setDadosColetados(data.dados_coletados); // Salva os dados para o resumo

      if (data.progress) {
        setProgress({
          currentStep: data.progress.currentStep,
          totalSteps: data.progress.totalSteps,
        });
      }

      if (data.status === "finalizado" && data.finalDiagnosticId) {
        toast.success("Diagnóstico concluído! Redirecionando para os resultados...");
        router.push(
          `/diagnostico-aprofundado/resultados/${data.finalDiagnosticId}`
        );
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
    setDadosColetados(null); // Limpa o resumo
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fase === 'setup') {
        handleNextSetupStep();
      } else if (fase === 'diagnostico' && resposta.trim() !== '') {
        processarResposta(resposta);
      }
    }
  };

  const renderInputField = () => {
    if (!perguntaAtual) return null;

    const commonProps = {
      value: resposta,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setResposta(e.target.value),
      onKeyDown: handleKeyDown,
      placeholder: perguntaAtual.placeholder || "Digite sua resposta...",
      className: "w-full bg-slate-700 border-slate-600 text-white rounded-lg p-3",
      autoFocus: isClient
    };

    switch (perguntaAtual.tipo_resposta) {
      case "selecao":
      case "multipla_escolha":
      case "sim_nao":
        return (
          <div className="flex flex-col gap-2">
            {perguntaAtual.opcoes?.map((opcao) => (
              <Button
                key={opcao}
                variant="outline"
                className="justify-start text-left h-auto py-3 whitespace-normal border-slate-600 hover:bg-slate-700 text-white"
                onClick={() => processarResposta(opcao)}
              >
                {opcao}
              </Button>
            ))}
          </div>
        );
      case "numero":
        return <Input type="number" {...commonProps} />;
      case "texto":
      default:
        return <Input type="text" {...commonProps} />;
    }
  };
  
  const renderContent = () => {
    if (isLoading) return <Loader text="Processando..." />;
    if (error && fase !== "diagnostico") return <div className="text-red-400 text-center">{error}</div>;

    switch (fase) {
      case "setup":
        const currentQuestion = initialSetupQuestions[setupStep];
        return (
          <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h1 className="text-2xl font-bold text-center mb-2">
              Configuração Inicial
            </h1>
            <p className="text-center text-slate-400 mb-8">
              Vamos começar com alguns dados básicos sobre sua empresa.
            </p>
            <ProgressBar
              currentStep={setupStep}
              totalSteps={initialSetupQuestions.length}
            />
            <div className="space-y-4">
              <label className="block text-lg text-center font-semibold text-white">
                {currentQuestion.label}
              </label>
              {currentQuestion.type === "selecao" || currentQuestion.type === "sim_nao" ? (
                <Select
                  value={setupData[currentQuestion.id as keyof SetupData]}
                  onValueChange={(value) => handleSetupChange(currentQuestion.id as keyof SetupData, value)}
                >
                  <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white border-slate-700">
                    {currentQuestion.opcoes?.map((opt) => (
                      <SelectItem key={opt} value={opt} className="cursor-pointer hover:bg-slate-700">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={currentQuestion.type === "numero" ? "number" : "text"}
                  value={setupData[currentQuestion.id as keyof SetupData]}
                  onChange={(e) => handleSetupChange(currentQuestion.id as keyof SetupData, e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-700 border-slate-600 text-white rounded-lg p-3 text-center"
                  autoFocus={isClient}
                />
              )}
            </div>
            <PrimaryButton onClick={handleNextSetupStep} className="w-full mt-8">
              Próximo
            </PrimaryButton>
          </div>
        );

      case "confirmacao":
        return (
          <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h1 className="text-2xl font-bold text-center mb-2">
              Confirme os Dados
            </h1>
            <p className="text-center text-slate-400 mb-8">
              Por favor, revise as informações antes de iniciar o diagnóstico.
            </p>
            <div className="bg-slate-900/50 p-6 rounded-lg space-y-4">
              {initialSetupQuestions.map(({ id, label }) => (
                <div key={id} className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300">{label}:</span>
                  <span className="text-white">
                    {setupData[id as keyof SetupData]}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Button
                variant="outline"
                onClick={handleRefazerDiagnostico}
                className="w-full border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refazer
              </Button>
              <PrimaryButton onClick={iniciarDiagnostico} className="w-full">
                Confirmar e Iniciar
              </PrimaryButton>
            </div>
          </div>
        );

      case "diagnostico":
        // Verifica se é a tela final de confirmação
        if (perguntaAtual?.texto.includes("Estou pronto para compilar")) {
          return (
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
              <h1 className="text-2xl font-bold text-center mb-2">
                Revise suas Respostas
              </h1>
              <p className="text-center text-slate-400 mb-6">
                {perguntaAtual.texto}
              </p>
              
              {/* --- INÍCIO DA CORREÇÃO --- */}
              <div className="bg-slate-900/50 p-4 rounded-lg space-y-3 max-h-60 overflow-y-auto mb-6 text-sm">
                {dadosColetados && Object.entries(dadosColetados).map(([key, value]: [string, any]) => (
                  <div key={key} className="border-b border-slate-700/50 pb-2 last:border-b-0">
                    <h3 className="font-bold text-pink-400 capitalize mb-1">{key.replace(/_/g, ' ')}</h3>
                    <div className="pl-2 text-slate-300">
                      {typeof value === 'string' ? (
                        <p>{value}</p>
                      ) : Array.isArray(value) ? (
                        <ul className="list-disc list-inside">
                          {value.map((item, index) => <li key={index}>{String(item)}</li>)}
                        </ul>
                      ) : typeof value === 'object' && value !== null ? (
                        <ul className="space-y-1">
                          {Object.entries(value).map(([subKey, subValue]) => (
                             <li key={subKey}>
                               <span className="font-semibold capitalize text-slate-400">{subKey.replace(/_/g, ' ')}:</span> {String(subValue)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>{String(value)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* --- FIM DA CORREÇÃO --- */}
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={handleRefazerDiagnostico}
                  className="w-full border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refazer Diagnóstico
                </Button>
                <PrimaryButton onClick={() => processarResposta("Sim")} className="w-full">
                  Confirmar e Gerar Relatório
                </PrimaryButton>
              </div>
            </div>
          );
        }

        // Renderização padrão para as outras perguntas do diagnóstico
        return (
          <div className="relative bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-xl">
            {progress && progress.totalSteps > initialSetupQuestions.length && (
              <ProgressBar currentStep={progress.currentStep} totalSteps={progress.totalSteps}/>
            )}
            {perguntaAtual && (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-6">
                  <ReactMarkdown>{perguntaAtual.texto}</ReactMarkdown>
                </h2>
                <div className="max-w-md mx-auto">
                  {renderInputField()}
                </div>
                {perguntaAtual.tipo_resposta !== 'selecao' && perguntaAtual.tipo_resposta !== 'sim_nao' && (
                  <PrimaryButton onClick={() => processarResposta(resposta)} className="mt-6" disabled={!resposta.trim()}>
                    Enviar Resposta
                  </PrimaryButton>
                )}
                 {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
              </div>
            )}
          </div>
        );
    }
    return null;
  };

  return (
    <main className="min-h-screen text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-3xl relative z-10 flex items-center justify-center">
        {renderContent()}
      </div>
      <div className="-z-10">
        <Ondas />
      </div>
    </main>
  );
}