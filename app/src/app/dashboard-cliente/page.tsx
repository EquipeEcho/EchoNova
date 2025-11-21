"use client";

import { useState, useEffect } from "react";
import { Ondas, Header } from "../clientFuncs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  Calendar,
  Award,
  X,
  Play,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Tipagem para os dados do gráfico de progresso
interface ProgressoTrilha {
  nome: string;
  progresso: number;
  cor: string;
  [key: string]: any; // Add index signature for Recharts compatibility
}

// Tipagem para os dados do gráfico de desempenho
interface DadosDesempenho {
  mes: string;
  pontos: number;
  media: number;
}

// Tipagem para os dados do gráfico de progresso médio
interface ProgressoMedio {
  periodo: string;
  progresso: number;
}

// Tipagem para os dados das métricas
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

interface Trilha {
  id: string;
  nome: string;
  descricao: string;
  progresso: number;
  status: "em_andamento" | "concluido" | "nao_iniciado";
  dataInicio?: string;
  dataConclusao?: string;
  duracao: string;
  modulos: number;
  nivel: "iniciante" | "intermediario" | "avancado";
  categoria: string;
}

// Componente para os cards de métricas
const MetricCard = ({
  title,
  value,
  icon,
  color,
  description,
  onClick,
  clickable,
  tooltip,
}: MetricCardProps & { onClick?: () => void; clickable?: boolean; tooltip?: string }) => (
  <div
    className={`bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 ${
      clickable ? "cursor-pointer" : ""
    }`}
    onClick={onClick}
    title={tooltip}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
        {description && (
          <p className="text-gray-500 text-xs mt-1">{description}</p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>{icon}</div>
    </div>
    {clickable && (
      <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
        <span>Clique para ver detalhes</span>
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    )}
  </div>
);

// Componente para o gráfico de barras de progresso
const ProgressoTrilhasChart = ({ data }: { data: ProgressoTrilha[] }) => {
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
          <p className="text-white font-semibold">{payload[0].payload.nome}</p>
          <p className="text-gray-300">
            Progresso:{" "}
            <span className="text-white font-bold">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Progresso das Trilhas</h3>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <span className="text-gray-400 text-sm">Progresso (%)</span>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#444"
              vertical={false}
            />
            <XAxis
              dataKey="nome"
              stroke="#888"
              angle={-45}
              textAnchor="end"
              height={60}
              tickLine={false}
            />
            <YAxis
              stroke="#888"
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="progresso" name="Progresso (%)" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente para o gráfico de pizza de distribuição
const DistribuicaoTrilhasChart = ({ data }: { data: ProgressoTrilha[] }) => {
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
          <p className="text-white font-semibold">{payload[0].payload.nome}</p>
          <p className="text-gray-300">
            Progresso:{" "}
            <span className="text-white font-bold">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          Distribuição de Trilhas
        </h3>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <span className="text-gray-400 text-sm">Participação</span>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={(entry: any) => `${entry.nome}: ${entry.progresso}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="progresso"
              nameKey="nome"
              stroke="#1f2937"
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente para o gráfico de progresso médio
const ProgressoMedioChart = ({ data }: { data: ProgressoMedio[] }) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
          <p className="text-white font-semibold">
            {payload[0].payload.periodo}
          </p>
          <p className="text-gray-300">
            Progresso Médio:{" "}
            <span className="text-white font-bold">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          Progresso Médio das Trilhas
        </h3>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-400 text-sm">Média (%)</span>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#444"
              vertical={false}
            />
            <XAxis
              dataKey="periodo"
              stroke="#888"
              angle={-45}
              textAnchor="end"
              height={60}
              tickLine={false}
            />
            <YAxis
              stroke="#888"
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value: number) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="progresso"
              name="Progresso Médio (%)"
              radius={[4, 4, 0, 0]}
              fill="#10B981"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Função para parsear trilhas do relatório markdown (fallback)
const parseTrilhasFromMarkdown = (markdown: string): Trilha[] => {
  const trilhas: Trilha[] = [];
  const lines = markdown.split('\n');
  let inTrilhasSection = false;
  let currentTrilha: Partial<Trilha> | null = null;

  for (const line of lines) {
    if (line.includes('### Trilhas de Aprendizagem Recomendadas')) {
      inTrilhasSection = true;
      continue;
    }

    if (inTrilhasSection && line.startsWith('#### Desafio:')) {
      // Save previous trilha if exists
      if (currentTrilha && currentTrilha.nome) {
        trilhas.push(currentTrilha as Trilha);
      }
      currentTrilha = {
        id: String(trilhas.length + 1),
        status: "nao_iniciado",
        progresso: 0,
        modulos: 0,
        nivel: "iniciante",
        categoria: "",
      };
      continue;
    }

    if (inTrilhasSection && currentTrilha && line.startsWith('**Trilha Recomendada:')) {
      const match = line.match(/\*\*Trilha Recomendada:\s*(.+?)\*\*/);
      if (match) {
        currentTrilha.nome = match[1].trim();
      }
      continue;
    }

    if (inTrilhasSection && currentTrilha && line.startsWith('* **Nível:**')) {
      const match = line.match(/\* \*\*Nível:\*\*\s*(.+)/);
      if (match) {
        const nivelRaw = match[1].trim().toLowerCase();
        // Mapear para os valores esperados
        let nivel: "iniciante" | "intermediario" | "avancado" = "iniciante";
        if (nivelRaw.includes("avançado") || nivelRaw.includes("avancado")) {
          nivel = "avancado";
        } else if (nivelRaw.includes("intermediário") || nivelRaw.includes("intermediario")) {
          nivel = "intermediario";
        }
        currentTrilha.nivel = nivel;
      }
      continue;
    }

    if (inTrilhasSection && currentTrilha && line.startsWith('* **Duração Estimada:**')) {
      const match = line.match(/\* \*\*Duração Estimada:\*\*\s*(.+)/);
      if (match) {
        currentTrilha.duracao = match[1].trim();
      }
      continue;
    }

    if (inTrilhasSection && currentTrilha && line.startsWith('* **Justificativa:**')) {
      const match = line.match(/\* \*\*Justificativa:\*\*\s*(.+)/);
      if (match) {
        currentTrilha.descricao = match[1].trim();
      }
      continue;
    }
  }

  // Save last trilha
  if (currentTrilha && currentTrilha.nome) {
    trilhas.push(currentTrilha as Trilha);
  }

  return trilhas;
};

export default function DashboardClientePage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showTrilhasModal, setShowTrilhasModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const router = useRouter();
  const { user: authUser, logout } = useAuthStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsUpdatedAt, setMetricsUpdatedAt] = useState<string | null>(null);

  // Dados fictícios para os gráficos (seriam substituídos por dados reais)
  const progressoTrilhasData: ProgressoTrilha[] = [
    { nome: "Liderança", progresso: 75, cor: "#8884d8" },
    { nome: "Comunicação", progresso: 60, cor: "#82ca9d" },
    { nome: "Gestão de Tempo", progresso: 45, cor: "#ffc658" },
    { nome: "Inovação", progresso: 30, cor: "#ff8042" },
    { nome: "Diversidade", progresso: 90, cor: "#0088FE" },
  ];

  const progressoMedioData: ProgressoMedio[] = [
    { periodo: "Semana 1", progresso: 25 },
    { periodo: "Semana 2", progresso: 32 },
    { periodo: "Semana 3", progresso: 45 },
    { periodo: "Semana 4", progresso: 58 },
    { periodo: "Semana 5", progresso: 65 },
    { periodo: "Semana 6", progresso: 72 },
  ];

  const desempenhoData: DadosDesempenho[] = [
    { mes: "Jan", pontos: 65, media: 70 },
    { mes: "Fev", pontos: 72, media: 70 },
    { mes: "Mar", pontos: 68, media: 70 },
    { mes: "Abr", pontos: 75, media: 70 },
    { mes: "Mai", pontos: 80, media: 70 },
    { mes: "Jun", pontos: 85, media: 70 },
  ];

  // Métricas para os cards (dinâmicas)
  const metricCards = [
    {
      title: "Trilhas Ativas",
      value: metrics ? metrics.totalTrilhasAtivas : "-",
      icon: <BookOpen className="h-8 w-8 text-blue-400" />,
      color: "bg-blue-500",
      description: "Soma das trilhas não concluídas",
      clickable: true,
      onClick: () => setShowTrilhasModal(true),
      tooltip: "Total de trilhas associadas aos funcionários que ainda não foram concluídas",
    },
    {
      title: "Progresso Médio",
      value: metrics ? `${metrics.progressoMedioPercent}%` : "-",
      icon: <TrendingUp className="h-8 w-8 text-green-400" />,
      color: "bg-green-500",
      description: "Conclusões / Total atribuídas",
      clickable: false,
      tooltip: `Cálculo: (Total de trilhas concluídas / Total de trilhas atribuídas) × 100`,
    },
    {
      title: "Horas Estudadas",
      value: metrics ? `${metrics.horasEstudadasTotal}h` : "-",
      icon: <Clock className="h-8 w-8 text-purple-400" />,
      color: "bg-purple-500",
      description: "Somatório de durações concluídas",
      clickable: false,
      tooltip: "Soma de todas as horas estimadas (duracaoEstimada) das trilhas já concluídas por todos os funcionários",
    },
    {
      title: "Objetivos Concluídos",
      value: metrics ? (metrics.objetivosConcluidosPercent > 0 ? `${metrics.objetivosConcluidosPercent}%` : `0/${metrics.totalTrilhasEmpresa}`) : "-",
      icon: <CheckCircle className="h-8 w-8 text-yellow-400" />,
      color: "bg-yellow-500",
      description: "Média de conclusão das trilhas da empresa",
      clickable: false,
      tooltip: "Para cada trilha: (funcionários que concluíram / total funcionários). Depois calcula a média de todas as trilhas.",
    },
  ];

  const fetchMetrics = async () => {
    if (!authUser) return;
    try {
      setMetricsLoading(true);
      const res = await fetch(`/api/empresa/${authUser.id}/dashboard`, { credentials: 'include' });
      if (!res.ok) throw new Error('Erro ao carregar métricas');
      const data = await res.json();
      setMetrics(data);
      setMetricsUpdatedAt(data.updatedAt);
    } catch (e) {
      console.error(e);
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggingOut) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = authUser || useAuthStore.getState().user;

        if (!user) {
          router.push("/");
          return;
        }

        // Buscar dados reais do usuário
        const response = await fetch(`/api/empresa/${user.id}`, {
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error("Erro ao buscar dados do usuário");
        }

        const data = await response.json();
        setUserInfo({
          nome: data.empresa.nome_empresa,
          email: data.empresa.email,
          plano: data.empresa.planoAtivo || "Nenhum",
        });

        // Buscar trilhas recomendadas do último diagnóstico
        const diagRes = await fetch("/api/diagnostico-aprofundado/ultimo", {
          credentials: 'include'
        });
        if (!diagRes.ok) {
          setTrilhas([]);
          return;
        }
        const diagData = await diagRes.json();
        // Extrair trilhas recomendadas do structuredData
        let trilhasRecomendadas: Trilha[] = [];
        if (diagData.structuredData && diagData.structuredData.trilhas_recomendadas) {
          trilhasRecomendadas = diagData.structuredData.trilhas_recomendadas.map((t: any, idx: number) => ({
            id: String(idx + 1),
            nome: t.trilha_nome,
            descricao: t.justificativa || "",
            progresso: 0,
            status: "nao_iniciado" as const,
            dataInicio: undefined,
            dataConclusao: undefined,
            duracao: t.duracao || "",
            modulos: 0,
            nivel: t.nivel || "iniciante",
            categoria: "",
          }));
        } else if (diagData.finalReport) {
          // Fallback: parse do markdown se não houver structuredData
          trilhasRecomendadas = parseTrilhasFromMarkdown(diagData.finalReport);
        }
        setTrilhas(trilhasRecomendadas);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados do usuário");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchMetrics();
  }, [authUser, router, isLoggingOut]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setIsMenuOpen(false);
    logout();
    router.push("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const getPlanoColor = (plano: string) => {
    switch (plano?.toLowerCase()) {
      case "essencial":
        return "from-indigo-500 to-purple-600";
      case "avancado":
        return "from-fuchsia-500 to-pink-600";
      case "escalado":
        return "from-emerald-500 to-teal-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getPlanoIcon = (plano: string) => {
    switch (plano?.toLowerCase()) {
      case "essencial":
        return "💎";
      case "avancado":
        return "🚀";
      case "escalado":
        return "👑";
      default:
        return "⭐";
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "iniciante":
        return "bg-green-500/20 text-green-400 border-green-600/40";
      case "intermediario":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-600/40";
      case "avancado":
        return "bg-red-500/20 text-red-400 border-red-600/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-600/40";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "bg-green-500/20 text-green-400 border-green-600/40";
      case "em_andamento":
        return "bg-blue-500/20 text-blue-400 border-blue-600/40";
      case "nao_iniciado":
        return "bg-gray-500/20 text-gray-400 border-gray-600/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-600/40";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "concluido":
        return "Concluído";
      case "em_andamento":
        return "Em Andamento";
      case "nao_iniciado":
        return "Não Iniciado";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen bg-linear-to-br from-gray-900 to-gray-950 relative overflow-hidden">
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="logo-container hover:scale-100">
              <Link href="/dashboard-cliente">
                <div className="h-10 w-32 bg-slate-700 rounded animate-pulse"></div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-48 bg-slate-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </header>

        <div className="pt-16 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto py-8">
            <div className="h-8 w-64 bg-slate-700 rounded mb-8 animate-pulse"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-4 bg-slate-700 rounded w-32 mb-4"></div>
                        <div className="h-8 bg-slate-700 rounded w-16"></div>
                      </div>
                      <div className="h-12 w-12 bg-slate-700 rounded-xl"></div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 h-96 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-6"></div>
                <div className="h-full bg-slate-700 rounded"></div>
              </div>
              <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 h-96 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-6"></div>
                <div className="h-full bg-slate-700 rounded"></div>
              </div>
            </div>

            {/* Loading state for average progress chart */}
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 h-96 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-6"></div>
                <div className="h-full bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full -z-10 opacity-20">
          <Ondas />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col min-h-screen bg-linear-to-br from-gray-900 to-gray-950 relative overflow-hidden">
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="logo-container hover:scale-100">
              <Link href="/dashboard-cliente">
                <div className="h-10 w-32 bg-slate-700 rounded"></div>
              </Link>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-screen pt-16 relative z-10 px-4">
          <div className="text-center bg-linear-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 max-w-md">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Erro ao carregar dashboard
            </h1>
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full -z-10 opacity-20">
          <Ondas />
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-linear-to-br from-gray-900 to-gray-950 relative overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="logo-container hover:scale-100">
            <Link href="/dashboard-cliente">
              <Image
                src="/img/logo.png"
                alt="EchoNova - Diagnóstico Inteligente de Treinamentos"
                width={120}
                height={40}
                className="h-8 w-auto object-contain sm:h-10 md:h-12 lg:h-14"
                priority
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {userInfo && (
              <div className="hidden md:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-colors">
                <span className="text-gray-300 text-sm">Plano:</span>
                <div
                  className={`px-3 py-1 rounded-full bg-linear-to-r ${getPlanoColor(
                    userInfo?.plano || ""
                  )} text-white text-xs font-bold flex items-center gap-1`}
                >
                  <span>{getPlanoIcon(userInfo?.plano || "")}</span>
                  <span>{userInfo?.plano || "Nenhum"}</span>
                </div>
              </div>
            )}

            <div className="relative">
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-slate-800 p-0 cursor-pointer"
                onClick={toggleMenu}
              >
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                  {userInfo?.nome?.charAt(0) || "U"}
                </div>
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-sm font-medium text-white truncate">
                      {userInfo?.nome || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {userInfo?.email || "email@exemplo.com"}
                    </p>
                  </div>
                  <div className="px-4 py-2 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 text-sm">Plano:</span>
                      <div
                        className={`px-2 py-0.5 rounded-full bg-linear-to-r ${getPlanoColor(
                          userInfo?.plano || ""
                        )} text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity`}
                      >
                        <span>{getPlanoIcon(userInfo?.plano || "")}</span>
                        <span>{userInfo?.plano || "Nenhum"}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/perfil")}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Meu Perfil
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="pt-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Dashboard RH
                </h1>
                <p className="text-gray-400">
                  Acompanhe o progresso e desempenho das trilhas de aprendizagem
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-2">
                <div className="bg-gray-800 px-4 py-2 rounded-lg">
                  <p className="text-gray-400 text-xs">{metricsUpdatedAt ? `Atualizado às ${new Date(metricsUpdatedAt).toLocaleTimeString('pt-BR')}` : 'Calculando...'}</p>
                </div>
                <Button
                  variant="outline"
                  className="text-xs border-fuchsia-600 text-fuchsia-400 hover:bg-fuchsia-600/10 cursor-pointer"
                  disabled={metricsLoading}
                  onClick={fetchMetrics}
                >
                  {metricsLoading ? 'Atualizando...' : 'Atualizar agora'}
                </Button>
              </div>
            </div>
          </div>

          {/* Métricas em Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricCards.map((card, index) => (
              <MetricCard
                key={index}
                title={card.title}
                value={card.value}
                icon={card.icon}
                color={card.color}
                description={card.description}
                clickable={card.clickable}
                onClick={card.onClick}
                tooltip={card.tooltip}
              />
            ))}
          </div>

          {/* Gráficos */}
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Gráfico de Barras: Progresso por Categoria */}
              <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700" title="Progresso de conclusão de trilhas por categoria">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Progresso por Categoria</h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm">Concluídas</span>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.trilhasPorCategoria}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                      <XAxis
                        dataKey="categoria"
                        stroke="#888"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tickLine={false}
                      />
                      <YAxis stroke="#888" tickLine={false} axisLine={false} />
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const percentConcluidas = data.total > 0 
                              ? ((data.concluidas / data.total) * 100).toFixed(1)
                              : 0;
                            return (
                              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
                                <p className="text-white font-semibold mb-2">{data.categoria}</p>
                                <p className="text-green-400">Concluídas: <span className="font-bold">{data.concluidas}</span></p>
                                <p className="text-blue-400">Em Andamento: <span className="font-bold">{data.emAndamento}</span></p>
                                <p className="text-gray-400">Pendentes: <span className="font-bold">{data.pendentes}</span></p>
                                <p className="text-white mt-1">Total: <span className="font-bold">{data.total}</span></p>
                                <p className="text-xs text-gray-400 mt-2">Taxa de conclusão: {percentConcluidas}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="concluidas" name="Concluídas" stackId="a" fill="#10B981" />
                      <Bar dataKey="emAndamento" name="Em Andamento" stackId="a" fill="#3B82F6" />
                      <Bar dataKey="pendentes" name="Pendentes" stackId="a" fill="#6B7280" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de Pizza: Distribuição condicional */}
              <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700" title="Distribuição por categoria ou status">
                <div className="flex items-center justify-between mb-6">
                  {(() => {
                    const isSingle = (metrics.categoriasAssociadas?.length || 0) === 1;
                    return (
                      <h3 className="text-xl font-bold text-white">
                        {isSingle ? "Status da Categoria" : "Distribuição por Categoria"}
                      </h3>
                    );
                  })()}
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-fuchsia-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm">{(metrics.categoriasAssociadas?.length || 0) === 1 ? "Pendentes x Andamento x Concluídas" : "Percentual por categoria"}</span>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      {(() => {
                        const isSingle = (metrics.categoriasAssociadas?.length || 0) === 1;
                        if (isSingle) {
                          const cat = metrics.categoriasAssociadas[0];
                          const item = metrics.trilhasPorCategoria.find((x: any) => x.categoria === cat) || { pendentes: 0, emAndamento: 0, concluidas: 0 };
                          const data = [
                            { nome: "Pendentes", valor: item.pendentes, cor: "#6B7280" },
                            { nome: "Em Andamento", valor: item.emAndamento, cor: "#3B82F6" },
                            { nome: "Concluídas", valor: item.concluidas, cor: "#10B981" },
                          ];
                          return (
                            <Pie
                              data={data}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={(entry: any) => `${entry.nome}: ${entry.valor}`}
                              outerRadius={80}
                              dataKey="valor"
                              nameKey="nome"
                              stroke="#1f2937"
                              strokeWidth={2}
                            >
                              {data.map((entry, index) => (
                                <Cell key={`cell-status-${index}`} fill={entry.cor} />
                              ))}
                            </Pie>
                          );
                        }
                        // Caso com múltiplas categorias
                        return (
                          <Pie
                            data={metrics.categoriaDistribuicao}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={(entry: any) => `${entry.categoria}: ${entry.percentual}%`}
                            outerRadius={80}
                            fill="#A855F7"
                            dataKey="percentual"
                            nameKey="categoria"
                            stroke="#1f2937"
                            strokeWidth={2}
                          >
                            {metrics.categoriaDistribuicao.map((entry, index) => {
                              const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE", "#A855F7"];
                              return <Cell key={`cell-cat-${index}`} fill={COLORS[index % COLORS.length]} />;
                            })}
                          </Pie>
                        );
                      })()}
                      <Tooltip
                        content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            const p = payload[0];
                            const isSingle = (metrics.categoriasAssociadas?.length || 0) === 1;
                            return (
                              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
                                <p className="text-white font-semibold">{isSingle ? p.payload.nome : p.payload.categoria}</p>
                                <p className="text-gray-300">
                                  {isSingle ? (
                                    <>Quantidade: <span className="text-white font-bold">{p.value}</span></>
                                  ) : (
                                    <>Percentual: <span className="text-white font-bold">{p.value}%</span></>
                                  )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{isSingle ? metrics.categoriasAssociadas[0] : "Do total de trilhas associadas"}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Trilhas Recomendadas por Categoria */}
          <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Trilhas Recomendadas por Categoria
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(metrics?.trilhasPorCategoria || []).map((item: any) => {
                const categoria = item.categoria;
                return (
                  <div key={categoria} className="bg-gray-700/30 p-5 rounded-xl border border-gray-600 hover:border-fuchsia-500/50 transition-all cursor-pointer" title="Dados calculados a partir das trilhas associadas aos funcionários">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{categoria}</h3>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-fuchsia-400">{item.total}</p>
                        <p className="text-xs text-gray-400">trilhas</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Em andamento:</span>
                        <span className="text-blue-400 font-medium">{item.emAndamento}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Concluídas:</span>
                        <span className="text-green-400 font-medium">{item.concluidas}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Pendentes:</span>
                        <span className="text-gray-300 font-medium">{item.pendentes}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!metrics || metrics.trilhasPorCategoria?.length === 0) && (
                <div className="text-gray-400 text-sm">Sem dados de trilhas associadas ainda.</div>
              )}
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
                onClick={() => router.push("/diagnostico-aprofundado")}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Novo Diagnóstico
              </Button>
              <Button
                variant="outline"
                className="border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/diagnostico-aprofundado/ultimo", {
                      credentials: 'include'
                    });
                    if (!res.ok) throw new Error("Nenhum diagnóstico encontrado");
                    const data = await res.json();
                    if (data._id) {
                      router.push(`/diagnostico-aprofundado/resultados/${data._id}`);
                    } else {
                      console.error("Diagnóstico não encontrado");
                    }
                  } catch (err) {
                    console.error("Diagnóstico não encontrado");
                  }
                }}
              >
                <Target className="mr-2 h-5 w-5" />
                Ver Resultados
              </Button>
              <Button
                variant="outline"
                className="border-green-500 text-green-500 hover:bg-green-500/10 hover:text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
                onClick={() => router.push("/planos")}
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Ver Planos
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Trilhas */}
      {showTrilhasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Todas as Trilhas
                </h2>
                <p className="text-neutral-400 text-sm mt-1">
                  Gerencie e acompanhe suas trilhas de aprendizagem
                </p>
              </div>
              <button
                onClick={() => setShowTrilhasModal(false)}
                className="text-neutral-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-neutral-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Estatísticas rápidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    <span className="text-neutral-400 text-sm">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {trilhas.length}
                  </p>
                </div>
                <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="h-5 w-5 text-blue-400" />
                    <span className="text-neutral-400 text-sm">
                      Em Andamento
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {trilhas.filter((t) => t.status === "em_andamento").length}
                  </p>
                </div>
                <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-neutral-400 text-sm">Concluídas</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {trilhas.filter((t) => t.status === "concluido").length}
                  </p>
                </div>
                <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-neutral-400 text-sm">
                      Não Iniciadas
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {trilhas.filter((t) => t.status === "nao_iniciado").length}
                  </p>
                </div>
              </div>

              {/* Lista de Trilhas por Categoria */}
              <div className="space-y-8">
                {["Comunicação", "Gestão de Tempo", "Inovação", "Liderança", "Diversidade"].map((categoria) => {
                  const trilhasCategoria = trilhas.filter(t => t.categoria === categoria);
                  if (trilhasCategoria.length === 0) return null;

                  return (
                    <div key={categoria} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{categoria}</h3>
                        <span className="px-3 py-1 bg-neutral-700 text-neutral-300 rounded-full text-sm">
                          {trilhasCategoria.length} trilha{trilhasCategoria.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="grid gap-4">
                        {trilhasCategoria.map((trilha) => (
                          <div
                            key={trilha.id}
                            className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-6 hover:border-fuchsia-700/50 transition-all"
                          >
                            <div className="flex flex-col gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <h4 className="text-lg font-semibold text-white">
                                    {trilha.nome}
                                  </h4>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                      trilha.status
                                    )}`}
                                  >
                                    {getStatusText(trilha.status)}
                                  </span>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getNivelColor(
                                      trilha.nivel
                                    )}`}
                                  >
                                    {trilha.nivel.charAt(0).toUpperCase() +
                                      trilha.nivel.slice(1)}
                                  </span>
                                </div>
                                <p className="text-neutral-400 mb-4">
                                  {trilha.descricao}
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                                    <BookOpen className="h-4 w-4" />
                                    <span>{trilha.modulos} módulos</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                                    <Clock className="h-4 w-4" />
                                    <span>{trilha.duracao}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                                    <Award className="h-4 w-4" />
                                    <span>{trilha.categoria}</span>
                                  </div>
                                  {trilha.dataInicio && (
                                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {new Date(trilha.dataInicio).toLocaleDateString(
                                          "pt-BR"
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  {trilha.dataConclusao && (
                                    <div className="flex items-center gap-2 text-sm text-green-400">
                                      <CheckCircle className="h-4 w-4" />
                                      <span>
                                        Concluído em{" "}
                                        {new Date(
                                          trilha.dataConclusao
                                        ).toLocaleDateString("pt-BR")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full -z-10 opacity-20">
        <Ondas />
      </div>
    </main>
  );
}
