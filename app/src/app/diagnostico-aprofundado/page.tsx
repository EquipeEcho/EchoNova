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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  problema?: string; // Propriedade opcional para focar em problemas específicos
}

interface ProgressState {
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
  currentQuestion?: number;
  totalQuestions?: number;
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

  // Verificar autenticação
  useEffect(() => {
    if (isClient && !user) {
      router.push("/");
    }
  }, [isClient, user, router]);

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
  const [showRestoreModal, setShowRestoreModal] = useState(false); // Modal de restauração
  const [savedStateData, setSavedStateData] = useState<any>(null); // Dados salvos temporariamente

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
        
        // Mostrar modal de restauração em vez de restaurar automaticamente
        setSavedStateData(parsed);
        setShowRestoreModal(true);
        console.log('📦 Estado salvo encontrado, mostrando modal de restauração');
      }
    } catch (error) {
      console.error('Erro ao carregar estado do diagnóstico:', error);
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

  const handleRestoreProgress = () => {
    if (!savedStateData) return;
    
    // Restaurar estados
    if (savedStateData.fase) setFase(savedStateData.fase);
    if (savedStateData.setupStep !== undefined) setSetupStep(savedStateData.setupStep);
    if (savedStateData.setupData) setSetupData(savedStateData.setupData);
    if (savedStateData.sessionId) setSessionId(savedStateData.sessionId);
    if (savedStateData.perguntaAtual) setPerguntaAtual(savedStateData.perguntaAtual);
    if (savedStateData.progress) setProgress(savedStateData.progress);
    if (savedStateData.dadosColetados) setDadosColetados(savedStateData.dadosColetados);
    
    setProgressoRestaurado(true);
    setShowRestoreModal(false);
    setSavedStateData(null);
    console.log('📦 Estado do diagnóstico restaurado do localStorage');
    toast.success('Progresso anterior restaurado! Você pode continuar de onde parou.');
  };

  const handleStartFresh = () => {
    // Limpar dados salvos e começar do zero
    localStorage.removeItem(STORAGE_KEY);
    setShowRestoreModal(false);
    setSavedStateData(null);
    console.log('🗑️ Estado salvo descartado, começando do zero');
    toast.info('Começando um novo diagnóstico.');
  };

  // Função para gerar respostas simuladas que seguem o fluxo completo do diagnóstico
  const gerarRespostasTeste = (nomeEmpresa: string) => {
    const setor = setupData.setor === "Outros" ? setupData.setorOutro : setupData.setor;
    const numFuncionarios = setupData.numFuncionarios;
    const numUnidades = setupData.numUnidades;

    // Respostas que simulam problemas específicos que correspondem às trilhas disponíveis
    // Baseado nas trilhas do sistema: Comunicação, Liderança, Gestão de Tempo, Inovação, Diversidade
    const respostas = [
      // Etapa 2: Identificação de problemas (Pergunta inicial)
      `Como ${nomeEmpresa}, uma empresa do setor ${setor.toLowerCase()} com ${numFuncionarios} funcionários distribuídos em ${numUnidades} unidade(s), enfrentamos vários desafios significativos. Os principais problemas que identificamos são: comunicação ineficiente entre equipes, falta de liderança inspiradora, dificuldade em gerenciar o tempo de forma produtiva, resistência à inovação e falta de diversidade nas equipes.`,

      // Etapa 2: Priorização (escolher os 3 mais críticos)
      `Dos desafios mencionados, os três mais críticos para nosso negócio neste momento são: 1) Comunicação ineficiente entre equipes, 2) Falta de liderança inspiradora, e 3) Dificuldade em gerenciar o tempo de forma produtiva.`,

      // Etapa 3: Aprofundamento do Problema 1 - Comunicação ineficiente
      // Impacto
      "4",
      // Frequência
      "5",
      // Alcance
      "4",
      // Evidência 1
      "Recentemente, um projeto importante atrasou duas semanas porque a equipe de desenvolvimento não recebeu informações atualizadas sobre mudanças nos requisitos do cliente. Isso resultou em retrabalho significativo e insatisfação do cliente.",
      // Evidência 2
      "Em outra situação, a equipe de vendas não foi informada sobre uma promoção especial, perdendo uma oportunidade de venda significativa para um cliente importante.",
      // Causa raiz
      "A causa raiz é a falta de canais de comunicação estruturados e uma cultura organizacional que não valoriza o compartilhamento de informações.",

      // Etapa 3: Aprofundamento do Problema 2 - Processos operacionais ineficientes
      // Impacto
      "4",
      // Frequência
      "4",
      // Alcance
      "5",
      // Evidência 1
      "Nossos processos de aprovação de projetos levam em média 3 semanas, muito acima do necessário, causando perda de oportunidades de negócio.",
      // Evidência 2
      "A gestão de estoque ainda é feita manualmente com planilhas Excel, gerando erros frequentes e falta de visibilidade em tempo real.",
      // Causa raiz
      "A causa raiz é a combinação de ferramentas tecnológicas obsoletas com processos burocráticos excessivos herdados de uma estrutura organizacional antiga.",

      // Etapa 3: Aprofundamento do Problema 3 - Dificuldade em gerenciar o tempo
      // Impacto
      "5",
      // Frequência
      "3",
      // Alcance
      "5",
      // Evidência 1
      "Temos observado um aumento significativo na rotatividade de funcionários, com 4 profissionais-chave saindo nos últimos 6 meses, citando falta de desenvolvimento profissional como motivo principal.",
      // Evidência 2
      "Em reuniões de equipe, há pouca participação e engajamento, com funcionários demonstrando desmotivação e falta de clareza sobre os objetivos da empresa.",
      // Causa raiz
      "A causa raiz é a ausência de um estilo de liderança que inspire, motive e desenvolva as equipes, combinada com uma cultura organizacional conservadora.",

      // Etapa 4: Confirmação para gerar relatório
      "Sim"
    ];

    return respostas;
  };

  const iniciarDiagnosticoTeste = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Gerar respostas simuladas que seguem o fluxo completo
      const respostasTeste = gerarRespostasTeste(setupData.nomeEmpresa);

      // Enviar o resumo inicial para começar o diagnóstico
      const setupResumo = `
        Os dados iniciais da empresa já foram coletados e CONFIRMADOS pelo usuário. São eles:
        - Nome da Empresa: ${setupData.nomeEmpresa}
        - Representante: ${setupData.nomeRepresentante}
        - Setor: ${setupData.setor === "Outros" ? setupData.setorOutro : setupData.setor}
        - Nº de Funcionários: ${setupData.numFuncionarios}
        - Nº de Unidades: ${setupData.numUnidades}
        - Respeitar LGPD: ${setupData.politicaLgpd}
        A etapa de confirmação está CONCLUÍDA.
        Por favor, inicie o diagnóstico fazendo a PRIMEIRA PERGUNTA INVESTIGATIVA agora.
      `;

      // Iniciar diagnóstico com o resumo
      let sessionId: string | null = null;
      let finalDiagnosticId: string | null = null;

      // Função auxiliar para retry com backoff exponencial
      const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3, baseDelay = 2000) => {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            return await fn();
          } catch (error: any) {
            if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
              if (attempt === maxRetries) throw error;

              const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000; // Backoff exponencial + jitter
              console.log(`Rate limit atingido, tentando novamente em ${Math.round(delay/1000)}s (tentativa ${attempt + 1}/${maxRetries + 1})`);
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              throw error;
            }
          }
        }
      };

      // Primeira chamada - setup
      const primeiraData = await retryWithBackoff(async () => {
        const res = await fetch("/api/diagnostico-ia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            sessionId: null,
            resposta_usuario: setupResumo,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Falha ao iniciar diagnóstico: ${res.status}`);
        }

        return await res.json();
      });

      sessionId = primeiraData.sessionId;

      // Enviar respostas sequencialmente simulando um usuário real
      for (let i = 0; i < respostasTeste.length; i++) {
        const resposta = respostasTeste[i];
        
        console.log(`🧪 [TESTE] Enviando resposta ${i + 1}/${respostasTeste.length}: "${resposta.substring(0, 50)}${resposta.length > 50 ? '...' : ''}"`);

        const data = await retryWithBackoff(async () => {
          const res = await fetch("/api/diagnostico-ia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              sessionId,
              resposta_usuario: resposta,
            }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Falha ao processar resposta ${i + 1}: ${res.status}`);
          }

          return await res.json();
        });
        
        console.log(`✅ [TESTE] Resposta ${i + 1} processada. Status: ${data.status}${data.progress ? ` - Pergunta ${data.progress.currentStep}/${data.progress.totalSteps}` : ''}`);

        // Verificar se o diagnóstico foi finalizado
        if (data.status === "finalizado" && data.finalDiagnosticId) {
          finalDiagnosticId = data.finalDiagnosticId;
          break;
        }

        // Delay entre chamadas para evitar rate limiting (1-2 segundos)
        const delay = 1000 + Math.random() * 1000; // 1-2 segundos + jitter
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      if (!finalDiagnosticId) {
        throw new Error("Diagnóstico de teste não foi finalizado corretamente.");
      }

      // Limpar dados salvos do localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Redirecionar para os resultados
      toast.success("Diagnóstico de teste gerado com sucesso!");
      router.push(`/diagnostico-aprofundado/resultados/${finalDiagnosticId}`);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      toast.error("Erro ao gerar diagnóstico de teste: " + message);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para gerar respostas aleatórias e realistas como se fosse uma empresa
  const gerarRespostaAleatoria = (perguntaIndex: number): string => {
    const respostasPorCategoria = {
      // Mercado e Clientes (0-4)
      mercado: [
        "Operamos em um mercado altamente competitivo com muitos concorrentes inovadores, especialmente startups que estão revolucionando o setor.",
        "O mercado está em constante transformação digital, com pressão para inovação e eficiência operacional.",
        "Somos um player tradicional em um mercado que está sendo disruptado por novas tecnologias e modelos de negócio.",
        "Nosso setor enfrenta desafios significativos de regulamentação e mudanças nas preferências dos consumidores.",
        "A concorrência internacional está cada vez mais presente, pressionando os preços e exigindo diferenciação."
      ],
      receita: [
        "Nossa principal receita vem de produtos SaaS e soluções digitais para empresas, mas estamos vendo uma queda nas vendas.",
        "Trabalhamos principalmente com contratos de prestação de serviços e consultoria especializada.",
        "Temos uma base diversificada de receita, incluindo vendas de produtos, serviços e licenciamento de tecnologia.",
        "A maior parte da nossa receita vem de clientes recorrentes através de contratos de manutenção e suporte.",
        "Focamos em projetos customizados de grande porte, mas estamos enfrentando dificuldades em fechar novos contratos."
      ],
      diferenciacao: [
        "Nos diferenciamos pela experiência do usuário e suporte personalizado, embora nossa tecnologia esteja ficando ultrapassada.",
        "Oferecemos soluções completas e integradas, ao contrário dos concorrentes que focam em nichos específicos.",
        "Nossa vantagem competitiva está no conhecimento profundo do mercado local e relacionamentos de longo prazo.",
        "Temos uma equipe altamente qualificada e especializada, o que nos permite oferecer soluções de alta qualidade.",
        "Investimos em pesquisa e desenvolvimento próprio, criando soluções proprietárias que os concorrentes não têm."
      ],
      perfil_cliente: [
        "Nossos clientes típicos são empresas de médio porte que buscam soluções digitais para otimizar seus processos.",
        "Atendemos principalmente grandes corporações com necessidades complexas de transformação digital.",
        "Trabalhamos com startups e empresas em crescimento que precisam de soluções escaláveis e flexíveis.",
        "Nosso público-alvo são organizações do setor público e privado que precisam cumprir regulamentações específicas.",
        "Focamos em clientes de diversos setores que buscam modernização de seus sistemas legados."
      ],
      desafios_clientes: [
        "Os principais desafios incluem digitalização de processos, adaptação tecnológica e redução de custos operacionais.",
        "Nossos clientes enfrentam pressão para inovação, compliance regulatório e eficiência operacional.",
        "As maiores dificuldades são relacionadas à transformação cultural, capacitação de equipes e integração de sistemas.",
        "Os clientes precisam lidar com concorrência internacional, mudanças no comportamento do consumidor e volatilidade econômica.",
        "Os desafios principais envolvem cibersegurança, privacidade de dados e adaptação às novas tecnologias emergentes."
      ],

      // Estrutura e Operações (5-9)
      estrutura: [
        "Temos uma estrutura hierárquica muito rígida com muitas camadas de decisão, o que torna tudo muito lento.",
        "A organização é bastante centralizada, com decisões importantes tomadas no topo da hierarquia.",
        "Mantemos uma estrutura tradicional com departamentos funcionais bem definidos, mas com pouca flexibilidade.",
        "Somos organizados por unidades de negócio independentes, mas com coordenação limitada entre elas.",
        "A estrutura é matricial, o que às vezes gera conflitos de prioridades e responsabilidades."
      ],
      processos: [
        "Os principais processos incluem desenvolvimento de software, atendimento ao cliente e gestão de projetos.",
        "Nossa operação envolve produção, logística, vendas e suporte pós-venda como processos principais.",
        "Focamos em processos de consultoria, implementação de soluções e manutenção contínua.",
        "Os processos centrais são pesquisa e desenvolvimento, produção e distribuição de produtos.",
        "Trabalhamos com processos de captação de recursos, investimento e gestão de portfólio."
      ],
      fluxo_trabalho: [
        "O fluxo de trabalho ainda é muito manual e baseado em planilhas Excel, com pouca automação.",
        "Usamos uma combinação de ferramentas digitais e processos manuais, mas com ineficiências significativas.",
        "Temos alguns sistemas automatizados, mas muitos processos ainda dependem de intervenção manual.",
        "O trabalho é organizado em projetos, mas com coordenação limitada entre diferentes equipes.",
        "Mantemos uma abordagem tradicional waterfall, com pouca agilidade para mudanças."
      ],
      ferramentas: [
        "Usamos principalmente Excel, email e algumas ferramentas básicas de gestão. Não temos um sistema integrado.",
        "Temos vários sistemas isolados que não se comunicam entre si, gerando retrabalho e inconsistências.",
        "Investimos em algumas ferramentas modernas, mas a adoção pelas equipes é limitada.",
        "Usamos uma mistura de ferramentas legadas e soluções modernas, mas sem integração adequada.",
        "Temos sistemas específicos para cada departamento, mas falta uma visão unificada da operação."
      ],
      gestao_projetos: [
        "A gestão de projetos é caótica, com atrasos frequentes e orçamentos que sempre estouram.",
        "Usamos metodologias tradicionais que não se adaptam bem às mudanças e imprevistos.",
        "Temos dificuldade em estimar prazos e custos com precisão, levando a constantes revisões.",
        "A comunicação entre equipes de projeto é deficiente, gerando desalinhamentos e retrabalho.",
        "Faltam ferramentas adequadas e processos padronizados para gestão de projetos."
      ],

      // Pessoas e Cultura (10-14)
      cultura: [
        "A cultura organizacional é bastante conservadora e resistente a mudanças tecnológicas.",
        "Temos uma cultura de estabilidade e previsibilidade, mas que limita a inovação.",
        "A organização valoriza a experiência e o conhecimento técnico acima da adaptabilidade.",
        "Mantemos uma cultura hierárquica e formal, com pouca abertura para novas ideias.",
        "Somos uma empresa tradicional com valores sólidos, mas que precisa se modernizar."
      ],
      valores: [
        "Nossos valores principais incluem inovação, qualidade e foco no cliente, mas eles não são realmente vivenciados no dia a dia.",
        "Pregamos excelência, integridade e trabalho em equipe, mas a prática nem sempre reflete esses valores.",
        "Valorizamos a inovação e a criatividade, mas a estrutura organizacional limita sua expressão.",
        "Temos valores tradicionais como ética, profissionalismo e compromisso, mas precisamos evoluir.",
        "Focamos em resultados e eficiência, mas às vezes em detrimento do bem-estar das pessoas."
      ],
      clima: [
        "O clima organizacional está tenso, com funcionários desmotivados e alta rotatividade.",
        "Há um ambiente competitivo interno que gera conflitos e reduz a colaboração.",
        "Os funcionários estão sobrecarregados e com pouco reconhecimento pelo seu trabalho.",
        "Existe uma cultura de medo de errar, que limita a inovação e a assunção de riscos.",
        "O clima é instável devido às constantes mudanças e incertezas sobre o futuro."
      ],
      desafios_pessoas: [
        "Os principais desafios são falta de liderança inspiradora e ausência de programas de desenvolvimento.",
        "Temos dificuldade em atrair e reter talentos qualificados para as posições-chave.",
        "A capacitação técnica não acompanha a evolução das tecnologias e necessidades do mercado.",
        "Faltam programas de desenvolvimento de carreira e sucessão para posições estratégicas.",
        "Há problemas de comunicação e alinhamento entre diferentes níveis hierárquicos."
      ],
      avaliacao: [
        "A avaliação de desempenho é puramente burocrática, sem feedback construtivo ou planos de desenvolvimento.",
        "Usamos um sistema anual de avaliação que não reflete o desempenho real ao longo do ano.",
        "Os critérios de avaliação são subjetivos e não estão alinhados com os objetivos estratégicos.",
        "Faltam ferramentas e processos para feedback contínuo e desenvolvimento profissional.",
        "A avaliação está desvinculada das oportunidades de crescimento e reconhecimento."
      ],

      // Direção Futura (15-19)
      objetivos: [
        "Nossos objetivos estratégicos incluem crescimento incremental de 20% ao ano, sem uma visão clara de futuro.",
        "Buscamos manter a posição atual no mercado, mas sem estratégias claras de crescimento.",
        "Temos metas de curto prazo focadas em sobrevivência, mas falta uma visão de longo prazo.",
        "Os objetivos são definidos de forma reativa, respondendo às pressões do mercado imediato.",
        "Focamos em eficiência operacional, mas negligenciamos investimentos em inovação e crescimento."
      ],
      ameacas: [
        "As principais ameaças incluem concorrência digital, mudanças tecnológicas rápidas e entrada de novos players.",
        "Enfrentamos riscos de obsolescência tecnológica e perda de participação de mercado.",
        "A volatilidade econômica e mudanças regulatórias representam ameaças significativas.",
        "Temos vulnerabilidades em cibersegurança e dependência de fornecedores críticos.",
        "A concorrência internacional e mudanças nas preferências dos consumidores são grandes ameaças."
      ],
      preparacao: [
        "Estamos nos preparando pouco para o futuro, com investimento mínimo em inovação e pesquisa.",
        "Temos iniciativas isoladas de inovação, mas sem estratégia coordenada e recursos adequados.",
        "Faltam investimentos em capacitação digital e atualização tecnológica da equipe.",
        "Mantemos uma postura reativa em relação às tendências do mercado e tecnologias emergentes.",
        "Há resistência cultural a mudanças, limitando nossa capacidade de adaptação."
      ],
      oportunidades: [
        "Identificamos oportunidades no mercado internacional, mas não temos estratégia definida para isso.",
        "Há potencial em novos segmentos de mercado e diversificação de produtos/serviços.",
        "Podemos explorar parcerias estratégicas e aquisições para acelerar o crescimento.",
        "Existem oportunidades em digitalização de processos e novos modelos de negócio.",
        "Podemos desenvolver novos produtos e serviços baseados em tecnologias emergentes."
      ],
      inovacao: [
        "Avalio nossa capacidade de inovação como baixa, com uma cultura organizacional que resiste fortemente a mudanças.",
        "Temos algumas iniciativas inovadoras, mas sem estrutura e recursos dedicados.",
        "A inovação é vista como risco, não como oportunidade de crescimento.",
        "Faltam processos e metodologias para promover e capturar ideias inovadoras.",
        "A organização tem dificuldade em experimentar e aprender com falhas."
      ],

      // Perguntas adicionais (20-24)
      retencao: [
        "Temos dificuldade em reter talentos porque não oferecemos um ambiente de trabalho atrativo e oportunidades de crescimento.",
        "Os salários estão abaixo do mercado e faltam benefícios competitivos para reter profissionais qualificados.",
        "A cultura organizacional conservadora afasta profissionais que buscam ambientes mais dinâmicos.",
        "Faltam oportunidades de desenvolvimento profissional e carreira dentro da empresa.",
        "Os processos de gestão de pessoas são antiquados e não motivam a permanência dos talentos."
      ],
      decisoes: [
        "Nossas decisões estratégicas são tomadas centralizadamente pelo CEO, criando gargalos no processo.",
        "Temos um comitê executivo que decide sobre assuntos estratégicos, mas com participação limitada.",
        "As decisões são tomadas de forma reativa, respondendo a crises em vez de planejamento estratégico.",
        "Faltam processos estruturados para análise de dados e tomada de decisão informada.",
        "Há conflitos entre decisões de curto e longo prazo, gerando inconsistências estratégicas."
      ],
      comunicacao: [
        "A comunicação interna é deficiente, com informações que não fluem adequadamente entre os diferentes setores.",
        "Usamos principalmente email e reuniões presenciais, mas com baixa frequência e efetividade.",
        "Há silos entre departamentos que impedem o compartilhamento de informações e conhecimentos.",
        "Faltam canais digitais eficientes para comunicação rápida e transparente.",
        "A comunicação descendente funciona melhor que a ascendente, limitando o feedback das equipes."
      ],
      marketing: [
        "Não temos uma estratégia clara de marketing digital e nossas vendas estão estagnadas.",
        "Usamos abordagens tradicionais de marketing que não alcançam o público-alvo atual.",
        "Faltam investimentos em branding e presença digital consistente.",
        "A equipe de vendas não está alinhada com as estratégias de marketing.",
        "Não acompanhamos métricas de performance de marketing e vendas de forma integrada."
      ],
      financeira: [
        "A gestão financeira é conservadora demais e não apoia investimentos em crescimento.",
        "Temos controle rigoroso de custos, mas isso limita investimentos estratégicos.",
        "A alocação de recursos segue critérios tradicionais, não considerando inovação e crescimento.",
        "Faltam processos para avaliação de retorno sobre investimentos em projetos estratégicos.",
        "A gestão financeira está desvinculada dos objetivos estratégicos de longo prazo."
      ]
    };

    // Mapear pergunta para categoria
    let categoria: keyof typeof respostasPorCategoria;
    if (perguntaIndex >= 0 && perguntaIndex <= 4) categoria = 'mercado';
    else if (perguntaIndex >= 5 && perguntaIndex <= 9) categoria = 'estrutura';
    else if (perguntaIndex >= 10 && perguntaIndex <= 14) categoria = 'cultura';
    else if (perguntaIndex >= 15 && perguntaIndex <= 19) categoria = 'objetivos';
    else categoria = 'mercado'; // fallback

    // Ajustar categoria específica baseada no índice exato
    if (perguntaIndex === 0) categoria = 'mercado';
    else if (perguntaIndex === 1) categoria = 'receita';
    else if (perguntaIndex === 2) categoria = 'diferenciacao';
    else if (perguntaIndex === 3) categoria = 'perfil_cliente';
    else if (perguntaIndex === 4) categoria = 'desafios_clientes';
    else if (perguntaIndex === 5) categoria = 'estrutura';
    else if (perguntaIndex === 6) categoria = 'processos';
    else if (perguntaIndex === 7) categoria = 'fluxo_trabalho';
    else if (perguntaIndex === 8) categoria = 'ferramentas';
    else if (perguntaIndex === 9) categoria = 'gestao_projetos';
    else if (perguntaIndex === 10) categoria = 'cultura';
    else if (perguntaIndex === 11) categoria = 'valores';
    else if (perguntaIndex === 12) categoria = 'clima';
    else if (perguntaIndex === 13) categoria = 'desafios_pessoas';
    else if (perguntaIndex === 14) categoria = 'avaliacao';
    else if (perguntaIndex === 15) categoria = 'objetivos';
    else if (perguntaIndex === 16) categoria = 'ameacas';
    else if (perguntaIndex === 17) categoria = 'preparacao';
    else if (perguntaIndex === 18) categoria = 'oportunidades';
    else if (perguntaIndex === 19) categoria = 'inovacao';
    else if (perguntaIndex === 20) categoria = 'retencao';
    else if (perguntaIndex === 21) categoria = 'decisoes';
    else if (perguntaIndex === 22) categoria = 'comunicacao';
    else if (perguntaIndex === 23) categoria = 'marketing';
    else if (perguntaIndex === 24) categoria = 'financeira';

    const opcoes = respostasPorCategoria[categoria];
    return opcoes[Math.floor(Math.random() * opcoes.length)];
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
  const renderValue = (key: string, value: unknown): React.JSX.Element => {
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
      perguntaAtual?.texto?.includes("Estou pronto para compilar") &&
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
        credentials: "include",
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
      
      console.log("📊 Dados de progresso recebidos:", data.progress); // Debug
      console.log("📦 Dados coletados recebidos:", data.dados_coletados); // Debug
      setDadosColetados(data.dados_coletados); // Salva os dados para o resumo

      if (data.progress) {
        setProgress({
          currentStep: data.progress.currentStep,
          totalSteps: data.progress.totalSteps,
          stepTitle: data.progress.stepTitle,
          currentQuestion: data.progress.currentQuestion,
          totalQuestions: data.progress.totalQuestions,
        });
        console.log(`✅ Barra de progresso atualizada: ${data.progress.currentStep + 1}/${data.progress.totalSteps} - ${data.progress.stepTitle || 'Sem título'}`);
      } else {
        console.warn("⚠️ API não retornou informações de progresso");
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
      } else if (data.proxima_pergunta) {
        setPerguntaAtual(data.proxima_pergunta);
        setFase("diagnostico");
      } else {
        // Se não há próxima pergunta mas o status é "em_andamento", há um erro
        console.error("❌ Erro: IA retornou status 'em_andamento' sem próxima pergunta", data);
        setError("A IA não retornou a próxima pergunta. Por favor, tente novamente ou recarregue a página.");
        toast.error("Erro no fluxo do diagnóstico. Tente novamente.");
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

    // Adiciona o nome do problema priorizado ao início da pergunta, se disponível
    let perguntaTexto = perguntaAtual.texto;
    if (perguntaAtual.problema) {
      perguntaTexto = `Focando em "${perguntaAtual.problema}": ${perguntaTexto}`;
    }

    const commonProps = {
      value: resposta,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setResposta(e.target.value),
      onInput: (e: React.ChangeEvent<HTMLInputElement>) => setResposta(e.target.value),
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
    
    // Se houver erro na fase de diagnóstico, mostrar mensagem com botão de retry
    if (error && fase === "diagnostico") {
      return (
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Erro no Diagnóstico</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                // Tentar reprocessar a última resposta
                if (resposta.trim()) {
                  processarResposta(resposta);
                }
              }}
              className="border-pink-500 text-pink-500 hover:bg-pink-500/10"
            >
              🔄 Tentar Novamente
            </Button>
            <Button
              variant="outline"
              onClick={handleRefazerDiagnostico}
              className="border-slate-500 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recomeçar Diagnóstico
            </Button>
          </div>
        </div>
      );
    }
    
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
        if (perguntaAtual?.texto?.includes("Estou pronto para compilar")) {
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
            {progress && progress.totalSteps > 0 && (
              <ProgressBar 
                currentStep={progress.currentStep} 
                totalSteps={progress.totalSteps}
                stepTitle={progress.stepTitle}
                currentQuestion={progress.currentQuestion}
                totalQuestions={progress.totalQuestions}
              />
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
            {/* MODO TESTE - REMOVER DEPOIS */}
            <button
              onClick={() => {
                iniciarDiagnosticoTeste();
              }}
              className="hidden md:flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400 text-xs hover:bg-yellow-500/20 transition-colors"
              title="Modo Teste - Dados Predefinidos"
            >
              🐛 Teste
            </button>

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
        <div className="w-full max-w-3xl relative z-10 flex items-center justify-center">
          {renderContent()}
        </div>
      </div>
      
      <div className="-z-10 fixed inset-0">
        <Ondas />
      </div>

      {/* Modal de Restauração de Progresso */}
      <Dialog open={showRestoreModal} onOpenChange={setShowRestoreModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-pink-400">
              🔄 Progresso Encontrado
            </DialogTitle>
            <DialogDescription className="text-center text-slate-300">
              Detectamos que você tem um diagnóstico em andamento. O que gostaria de fazer?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-400 mb-2">📈 Continuar de onde parou</h4>
              <p className="text-sm text-slate-300">
                Restaure seu progresso anterior e continue o diagnóstico do ponto onde parou.
              </p>
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-400 mb-2">🆕 Começar do zero</h4>
              <p className="text-sm text-slate-300">
                Descarte o progresso anterior e inicie um novo diagnóstico completamente.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleStartFresh}
              className="flex-1 border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300"
            >
              🆕 Começar do Zero
            </Button>
            <PrimaryButton
              onClick={handleRestoreProgress}
              className="flex-1"
            >
              📈 Restaurar Progresso
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
