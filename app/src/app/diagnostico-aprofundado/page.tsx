"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import Link from "next/link";
import Image from "next/image";

// Componentes da UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
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
import { RefreshCw } from "lucide-react";

type FaseDiagnostico = "setup" | "confirmacao" | "diagnostico" | "finalizado";

interface SetupData {
  nomeEmpresa: string;
  nomeRepresentante: string;
  setor: string;
  setorOutro: string;
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
  const logout = useAuthStore((state) => state.logout);
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const [fase, setFase] = useState<FaseDiagnostico>("setup");
  const [setupStep, setSetupStep] = useState(0);
  const [setupData, setSetupData] = useState<SetupData>({
    nomeEmpresa: "",
    nomeRepresentante: "",
    setor: "",
    setorOutro: "",
    numFuncionarios: "",
    numUnidades: "",
    politicaLgpd: "",
  });
  const [_editingField, setEditingField] = useState<keyof SetupData | null>(
    null
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [perguntaAtual, setPerguntaAtual] = useState<Pergunta | null>(null);
  const [resposta, setResposta] = useState<string>("");
  const [_relatorioFinal, setRelatorioFinal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [dadosColetados, setDadosColetados] = useState<Record<string, unknown> | null>(null); // Estado para o resumo
  const [progressoRestaurado, setProgressoRestaurado] = useState(false); // Indica se o progresso foi restaurado

  // Chave de armazenamento local
  const STORAGE_KEY = 'diagnostico_aprofundado_state';

  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    if (!isClient) return;
    
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // Verificar se o estado não está muito antigo (mais de 24 horas)
        const ageInHours = (Date.now() - (parsed.timestamp || 0)) / (1000 * 60 * 60);
        if (ageInHours > 24) {
          localStorage.removeItem(STORAGE_KEY);
          console.log('⏰ Estado expirado removido');
          return;
        }
        
        // Restaurar estados
        if (parsed.fase) setFase(parsed.fase);
        if (parsed.setupStep !== undefined) setSetupStep(parsed.setupStep);
        if (parsed.setupData) setSetupData(parsed.setupData);
        if (parsed.sessionId) setSessionId(parsed.sessionId);
        if (parsed.perguntaAtual) setPerguntaAtual(parsed.perguntaAtual);
        if (parsed.progress) setProgress(parsed.progress);
        if (parsed.dadosColetados) setDadosColetados(parsed.dadosColetados);
        
        setProgressoRestaurado(true);
        console.log('📦 Estado do diagnóstico restaurado do localStorage');
        toast.success('Progresso anterior restaurado! Você pode continuar de onde parou.');
      }
    } catch (error) {
      console.error('Erro ao restaurar estado do diagnóstico:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isClient]);

  // Salvar dados automaticamente quando houver mudanças
  useEffect(() => {
    if (!isClient) return;
    
    // Não salvar se estiver no estado inicial
    if (fase === 'setup' && setupStep === 0 && !sessionId) return;
    
    try {
      const stateToSave = {
        fase,
        setupStep,
        setupData,
        sessionId,
        perguntaAtual,
        progress,
        dadosColetados,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      console.log('💾 Estado do diagnóstico salvo automaticamente');
    } catch (error) {
      console.error('Erro ao salvar estado do diagnóstico:', error);
    }
  }, [isClient, fase, setupStep, setupData, sessionId, perguntaAtual, progress, dadosColetados])

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
    
    // Validação especial para setor "Outros"
    if (currentField === "setor" && setupData.setor === "Outros" && !setupData.setorOutro.trim()) {
      toast.error("Por favor, especifique qual é o setor de atuação.");
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
    const setorFinal = setupData.setor === "Outros" ? setupData.setorOutro : setupData.setor;
    const setupResumo = `
            Os dados iniciais da empresa já foram coletados e CONFIRMADOS pelo usuário. São eles:
            - Nome da Empresa: ${setupData.nomeEmpresa}
            - Representante: ${setupData.nomeRepresentante}
            - Setor: ${setorFinal}
            - Nº de Funcionários: ${setupData.numFuncionarios}
            - Nº de Unidades: ${setupData.numUnidades}
            - Respeitar LGPD: ${setupData.politicaLgpd}
            A etapa de confirmação está CONCLUÍDA.
            Por favor, inicie o diagnóstico fazendo a PRIMEIRA PERGUNTA INVESTIGATIVA agora.
        `;
    setFase("diagnostico");
    await processarResposta(setupResumo, true);
  };

  // Helper function para renderizar valores de forma mais amigável
  const renderValue = (key: string, value: unknown): JSX.Element => {
    const keyLower = key.toLowerCase();
    
    // Tratamento especial para problemas/desafios priorizados/identificados
    if ((keyLower.includes('problema') || keyLower.includes('desafio')) && 
        (keyLower.includes('priorizado') || keyLower.includes('identificado') || keyLower.includes('prioritario'))) {
      
      if (Array.isArray(value)) {
        // Se for array de objetos (formato detalhado)
        if (value.length > 0 && typeof value[0] === 'object') {
          return (
            <div className="space-y-3">
              {value.map((problema, index) => {
                const prob = problema as Record<string, unknown>;
                const nome = prob.nome || prob.problema || `Problema ${index + 1}`;
                
                return (
                  <div key={index} className="bg-slate-800/30 p-3 rounded border border-slate-700/30">
                    <h4 className="font-bold text-pink-300 mb-2">📌 {String(nome)}</h4>
                    <ul className="space-y-1 text-sm">
                      {Object.entries(prob)
                        .filter(([k]) => k !== 'nome' && k !== 'problema' && k !== 'priorizado')
                        .map(([k, v]) => (
                          <li key={k} className="flex gap-2">
                            <span className="text-slate-400 capitalize min-w-[120px]">
                              {k.replace(/_/g, ' ')}:
                            </span>
                            <span className="text-slate-200">{String(v)}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          );
        }
        
        // Se for array de strings simples
        return (
          <ul className="list-disc list-inside space-y-1">
            {value.map((item, index) => (
              <li key={index} className="text-slate-200 font-medium">📌 {String(item)}</li>
            ))}
          </ul>
        );
      }
    }

    // Tratamento para arrays genéricos
    if (Array.isArray(value)) {
      // Se for array de objetos
      if (value.length > 0 && typeof value[0] === 'object') {
        return (
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="bg-slate-800/20 p-2 rounded text-sm">
                {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}:</span>{' '}
                    <span className="text-slate-200">{String(v)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      }
      
      // Array de valores simples
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-slate-200">{String(item)}</li>
          ))}
        </ul>
      );
    }

    // Tratamento para objetos aninhados (como empresa:{nome, setor...})
    if (typeof value === 'object' && value !== null) {
      return (
        <ul className="space-y-1">
          {Object.entries(value).map(([subKey, subValue]) => (
            <li key={subKey}>
              <span className="font-semibold capitalize text-slate-400">
                {subKey.replace(/_/g, ' ')}:
              </span>{' '}
              <span className="text-slate-200">{String(subValue)}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Tratamento para strings e outros tipos
    return <p className="text-slate-200">{String(value)}</p>;
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
      
      console.log("Dados coletados recebidos:", data.dados_coletados); // Debug
      setDadosColetados(data.dados_coletados); // Salva os dados para o resumo

      if (data.progress) {
        setProgress({
          currentStep: data.progress.currentStep,
          totalSteps: data.progress.totalSteps,
        });
      }

      if (data.status === "finalizado" && data.finalDiagnosticId) {
        toast.success("Diagnóstico concluído! Redirecionando para os resultados...");
        // Limpar dados salvos quando finalizar
        localStorage.removeItem(STORAGE_KEY);
        router.push(
          `/diagnostico-aprofundado/resultados/${data.finalDiagnosticId}`
        );
      } else if (data.status === "confirmacao" || data.status === "confirmação") {
        setFase("confirmacao");
      } else {
        setPerguntaAtual(data.proxima_pergunta);
        setFase("diagnostico");
      }
    } catch (err: unknown) {
        let message = err instanceof Error ? err.message : String(err);
        // Se for resposta do backend, tente extrair detalhes
        if (typeof err === 'object' && err !== null && 'details' in err) {
          message += `\n${(err as any).details}`;
        }
        setError(message);
        toast.error(message);
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
      setorOutro: "",
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
    
    // Limpar dados salvos
    setProgressoRestaurado(false);
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Estado do diagnóstico limpo');
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

    // Fallback: se não houver opções, sempre mostrar campo de texto
    if (!perguntaAtual.tipo_resposta || (!perguntaAtual.opcoes && (!['numero','selecao','multipla_escolha','sim_nao'].includes(perguntaAtual.tipo_resposta)))) {
      return <Input type="text" {...commonProps} />;
    }

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
        return <NumberInput {...commonProps} />;
      default:
        return <Input type="text" {...commonProps} />;
    }
  };
  
  const renderContent = () => {
    if (isLoading) return <Loader text="Processando..." />;
    if (error && fase !== "diagnostico") return <div className="text-red-400 text-center">{error}</div>;

    switch (fase) {
      case "setup": {
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
              <h3 className="block text-lg text-center font-semibold text-white">
                {currentQuestion.label}
              </h3>
              {currentQuestion.type === "selecao" || currentQuestion.type === "sim_nao" ? (
                <>
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
                  
                  {/* Campo condicional para especificar setor quando "Outros" é selecionado */}
                  {currentQuestion.id === "setor" && setupData.setor === "Outros" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Especifique o setor de atuação:
                      </label>
                      <Input
                        type="text"
                        value={setupData.setorOutro}
                        onChange={(e) => handleSetupChange("setorOutro", e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-slate-700 border-slate-600 text-white rounded-lg p-3"
                        placeholder="Ex: Agronegócio, Consultoria, etc."
                        autoFocus={isClient}
                      />
                    </div>
                  )}
                </>
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
      }

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
              {initialSetupQuestions.map(({ id, label }) => {
                const value = setupData[id as keyof SetupData];
                const displayValue = id === "setor" && value === "Outros" && setupData.setorOutro
                  ? `${value} (${setupData.setorOutro})`
                  : value;
                
                return (
                  <div key={id} className="flex justify-between items-center">
                    <span className="font-semibold text-slate-300">{label}:</span>
                    <span className="text-white">{displayValue}</span>
                  </div>
                );
              })}
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
        if (perguntaAtual?.texto.includes("Estou pronto para compilar")) {
          return (
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
              <h1 className="text-2xl font-bold text-center mb-2">
                Revise suas Respostas
              </h1>
              <p className="text-center text-slate-400 mb-6">
                {perguntaAtual.texto}
              </p>
              
              <div className="bg-slate-900/50 p-4 rounded-lg space-y-3 max-h-60 overflow-y-auto mb-6 text-sm">
                {dadosColetados && Object.entries(dadosColetados).map(([key, value]: [string, unknown]) => (
                  <div key={key} className="border-b border-slate-700/50 pb-2 last:border-b-0">
                    <h3 className="font-bold text-pink-400 capitalize mb-1">{key.replace(/_/g, ' ')}</h3>
                    <div className="pl-2 text-slate-300">
                      {renderValue(key, value)}
                    </div>
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
                  Refazer Diagnóstico
                </Button>
                <PrimaryButton onClick={() => processarResposta("Sim")} className="w-full">
                  Confirmar e Gerar Relatório
                </PrimaryButton>
              </div>
            </div>
          );
        }

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
    <main className="min-h-screen text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="logo-container hover:scale-100">
            <Link href="/pos-login">
              <Image
                src="/img/logo.png"
                alt="EchoNova"
                width={120}
                height={40}
                className="h-8 w-auto object-contain sm:h-10 md:h-12 lg:h-14"
                priority
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                <span className="text-gray-300 text-sm">{user.nome_empresa}</span>
              </div>
            )}

            <div className="relative">
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-slate-800 p-0 cursor-pointer"
                onClick={toggleMenu}
              >
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                  {user?.nome_empresa?.charAt(0) || "U"}
                </div>
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.nome_empresa || "Empresa"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email || "email@exemplo.com"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/perfil")}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Meu Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja cancelar o diagnóstico e voltar à página inicial?")) {
                        router.push("/pos-login");
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Voltar ao Início
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content com padding-top para compensar navbar fixa */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-28 md:pt-32">
        {/* Indicador de progresso restaurado */}
        {progressoRestaurado && fase !== 'setup' && (
        <div className="absolute top-4 right-4 z-20 bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2 flex items-center gap-2">
          <span className="text-green-400 text-sm font-medium">✓ Progresso restaurado</span>
          <button
            onClick={handleRefazerDiagnostico}
            className="text-xs text-green-300 hover:text-green-100 underline"
            title="Começar do zero"
          >
            Recomeçar
          </button>
        </div>
      )}
      
        <div className="w-full max-w-3xl relative z-10 flex items-center justify-center">
          {renderContent()}
        </div>
      </div>
      
      <div className="-z-10 fixed inset-0">
        <Ondas />
      </div>
    </main>
  );
}