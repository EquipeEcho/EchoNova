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

// Tipagem para os dados das métricas
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
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

// Componente para o gráfico de barras de progresso por funcionário ou cargo
const ProgressoPorFuncionarioChart = ({ funcionarios }: { funcionarios: any[] }) => {
  const agruparPorCargo = funcionarios.length > 10;

  let data;
  let titulo;

  if (agruparPorCargo) {
    // Agrupar por cargo
    const cargosMap = new Map<string, { pendentes: number; emAndamento: number; concluidas: number; funcionarios: number }>();
    
    funcionarios.forEach(func => {
      const cargo = func.cargo || 'Sem Cargo';
      const existing = cargosMap.get(cargo) || { pendentes: 0, emAndamento: 0, concluidas: 0, funcionarios: 0 };
      
      existing.pendentes += func.trilhas.filter((t: any) => t.status === 'pendente').length;
      existing.emAndamento += func.trilhas.filter((t: any) => t.status === 'em_andamento').length;
      existing.concluidas += func.trilhasConcluidas?.length || 0;
      existing.funcionarios += 1;
      
      cargosMap.set(cargo, existing);
    });

    data = Array.from(cargosMap.entries()).map(([cargo, stats]) => ({
      nome: cargo,
      pendentes: stats.pendentes,
      emAndamento: stats.emAndamento,
      concluidas: stats.concluidas,
      funcionarios: stats.funcionarios,
    }));

    titulo = `Progresso por Cargo (${funcionarios.length} funcionários)`;
  } else {
    // Mostrar funcionários individuais
    data = funcionarios.map(func => ({
      nome: func.nome.split(' ')[0], // Primeiro nome para caber no gráfico
      pendentes: func.trilhas.filter((t: any) => t.status === 'pendente').length,
      emAndamento: func.trilhas.filter((t: any) => t.status === 'em_andamento').length,
      concluidas: func.trilhasConcluidas?.length || 0,
    }));

    titulo = 'Progresso por Funcionário';
  }

  return (
    <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">{titulo}</h3>
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-400 text-sm">Concluídas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-400 text-sm">Em Andamento</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span className="text-gray-400 text-sm">Pendentes</span>
          </div>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
            <XAxis
              dataKey="nome"
              stroke="#888"
              angle={-45}
              textAnchor="end"
              height={80}
              tickLine={false}
              interval={0}
            />
            <YAxis stroke="#888" tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const total = data.concluidas + data.emAndamento + data.pendentes;
                  return (
                    <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
                      <p className="text-white font-semibold mb-2">{data.nome}</p>
                      {agruparPorCargo && (
                        <p className="text-gray-300 text-sm mb-2">
                          {data.funcionarios} funcionário{data.funcionarios !== 1 ? 's' : ''}
                        </p>
                      )}
                      <p className="text-green-400">Concluídas: <span className="font-bold">{data.concluidas}</span></p>
                      <p className="text-blue-400">Em Andamento: <span className="font-bold">{data.emAndamento}</span></p>
                      <p className="text-gray-400">Pendentes: <span className="font-bold">{data.pendentes}</span></p>
                      <p className="text-white mt-1">Total: <span className="font-bold">{total}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="concluidas" name="Concluídas" stackId="a" fill="#10B981" />
            <Bar dataKey="emAndamento" name="Em Andamento" stackId="a" fill="#3B82F6" />
            <Bar dataKey="pendentes" name="Pendentes" stackId="a" fill="#6B7280" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Componente para o gráfico de pizza de categorias de trilhas
const CategoriasChart = ({ funcionarios, metrics }: { funcionarios: any[]; metrics: any }) => {
  // Contar categorias únicas das trilhas associadas
  const categoriasMap = new Map<string, number>();
  
  funcionarios.forEach(func => {
    func.trilhas.forEach((t: any) => {
      if (t.trilha?.categoria) {
        const categoria = t.trilha.categoria;
        categoriasMap.set(categoria, (categoriasMap.get(categoria) || 0) + 1);
      }
    });
    // Incluir concluídas também
    func.trilhasConcluidas?.forEach((tc: any) => {
      if (tc.trilha?.categoria) {
        const categoria = tc.trilha.categoria;
        categoriasMap.set(categoria, (categoriasMap.get(categoria) || 0) + 1);
      }
    });
  });

  const totalCategorias = categoriasMap.size;
  const mostrarPorStatus = totalCategorias <= 1;

  let data;
  let titulo;
  let subtitulo;

  if (mostrarPorStatus) {
    // Se só tem 1 categoria, mostrar por status
    let totalPendentes = 0;
    let totalEmAndamento = 0;
    let totalConcluidas = 0;

    funcionarios.forEach(func => {
      totalPendentes += func.trilhas.filter((t: any) => t.status === 'pendente').length;
      totalEmAndamento += func.trilhas.filter((t: any) => t.status === 'em_andamento').length;
      totalConcluidas += func.trilhasConcluidas?.length || 0;
    });

    data = [
      { nome: 'Pendentes', valor: totalPendentes, cor: '#6B7280' },
      { nome: 'Em Andamento', valor: totalEmAndamento, cor: '#3B82F6' },
      { nome: 'Concluídas', valor: totalConcluidas, cor: '#10B981' },
    ].filter(item => item.valor > 0);

    titulo = 'Status das Trilhas';
    subtitulo = totalCategorias === 1 ? `Categoria: ${Array.from(categoriasMap.keys())[0]}` : 'Status geral';
  } else {
    // 2+ categorias: mostrar distribuição por categoria
    const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#6366F1', '#14B8A6'];
    
    data = Array.from(categoriasMap.entries())
      .map(([categoria, count], index) => ({
        nome: categoria,
        valor: count,
        cor: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.valor - a.valor); // Ordenar por quantidade (mais importante primeiro)

    titulo = 'Distribuição por Categoria';
    subtitulo = `${totalCategorias} categorias identificadas`;
  }

  const total = data.reduce((sum, item) => sum + item.valor, 0);

  return (
    <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">{titulo}</h3>
          <p className="text-sm text-gray-400 mt-1">{subtitulo}</p>
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-fuchsia-500 rounded-full"></div>
          <span className="text-gray-400 text-sm">Total: {total} trilhas</span>
        </div>
      </div>
      <div className="h-80">
        {total === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Nenhuma trilha atribuída ainda</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(entry: any) => {
                  const percent = ((entry.valor / total) * 100).toFixed(1);
                  return `${entry.nome}: ${entry.valor} (${percent}%)`;
                }}
                outerRadius={80}
                dataKey="valor"
                nameKey="nome"
                stroke="#1f2937"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const p = payload[0];
                    const percent = ((p.value / total) * 100).toFixed(1);
                    return (
                      <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
                        <p className="text-white font-semibold">{p.payload.nome}</p>
                        <p className="text-gray-300">
                          Quantidade: <span className="text-white font-bold">{p.value}</span> trilhas
                        </p>
                        <p className="text-gray-300">
                          Proporção: <span className="text-white font-bold">{percent}%</span>
                        </p>
                        {!mostrarPorStatus && (
                          <p className="text-xs text-gray-400 mt-2">
                            Importância relativa para os problemas identificados
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default function DashboardClientePage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user: authUser, logout } = useAuthStore();
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsUpdatedAt, setMetricsUpdatedAt] = useState<string | null>(null);
  const [showDiagnosticoModal, setShowDiagnosticoModal] = useState(false);
  const [showFuncionariosModal, setShowFuncionariosModal] = useState(false);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);

  // Métricas para os cards (dinâmicas)
  const metricCards = [
    {
      title: "Trilhas Ativas",
      value: metrics ? metrics.totalTrilhasAtivas : "-",
      icon: <BookOpen className="h-8 w-8 text-blue-400" />,
      color: "bg-blue-500",
      description: "Soma das trilhas não concluídas",
      clickable: false,
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

        // Verificar se há diagnóstico
        const diagRes = await fetch("/api/diagnostico-aprofundado/ultimo", {
          credentials: 'include'
        });
        if (!diagRes.ok) {
          setShowDiagnosticoModal(true); // Mostrar modal se não há diagnóstico
        } else {
          setShowDiagnosticoModal(false); // Esconder modal se há diagnóstico
        }

        // Buscar funcionários para os gráficos
        const funcRes = await fetch(`/api/funcionarios?empresaId=${user.id}`, {
          credentials: 'include'
        });
        if (funcRes.ok) {
          const funcData = await funcRes.json();
          setFuncionarios(funcData || []);
          if (!funcData || funcData.length === 0) {
            setShowFuncionariosModal(true); // Mostrar modal se não há funcionários
          }
        }
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

          {/* Gráficos de Progresso Individual */}
          {funcionarios.length > 0 && metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ProgressoPorFuncionarioChart funcionarios={funcionarios} />
              <CategoriasChart funcionarios={funcionarios} metrics={metrics} />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                className="border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
                onClick={() => router.push("/gerenciar-funcionarios")}
              >
                <Users className="mr-2 h-5 w-5" />
                Gerenciar Colaboradores
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

      {/* Modal de Diagnóstico Obrigatório */}
      {showDiagnosticoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Diagnóstico Necessário
              </h2>
              <p className="text-neutral-300 mb-6 leading-relaxed">
                Para acessar o dashboard completo, você precisa realizar o diagnóstico aprofundado primeiro.
                Isso nos ajuda a personalizar as trilhas de aprendizagem para sua empresa.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/diagnostico-aprofundado")}
                  className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Fazer Diagnóstico Agora
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDiagnosticoModal(false)}
                  className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800 py-3 rounded-lg transition-all duration-300"
                >
                  Fechar (Dashboard limitado)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Funcionários Obrigatórios */}
      {showFuncionariosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-fuchsia-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-fuchsia-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Nenhum Funcionário Cadastrado
              </h2>
              <p className="text-neutral-300 mb-6 leading-relaxed">
                Para acompanhar o progresso das trilhas de aprendizagem, você precisa cadastrar seus funcionários.
                Eles terão acesso à plataforma mediante o cadastro e poderão acompanhar suas próprias trilhas.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/gerenciar-funcionarios")}
                  className="w-full bg-linear-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Cadastrar Funcionários
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowFuncionariosModal(false)}
                  className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800 py-3 rounded-lg transition-all duration-300"
                >
                  Fechar (Dashboard limitado)
                </Button>
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
