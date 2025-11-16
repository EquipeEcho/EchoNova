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
  Cell
} from "recharts";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Target,
  Calendar,
  Award
} from "lucide-react";
import Link from "next/link";

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

// Componente para os cards de métricas
const MetricCard = ({ title, value, icon, color, description }: MetricCardProps) => (
  <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
        {description && (
          <p className="text-gray-500 text-xs mt-1">{description}</p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        {icon}
      </div>
    </div>
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
            Progresso: <span className="text-white font-bold">{payload[0].value}%</span>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
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
            <Bar 
              dataKey="progresso" 
              name="Progresso (%)" 
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            Progresso: <span className="text-white font-bold">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Distribuição de Trilhas</h3>
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          <p className="text-white font-semibold">{payload[0].payload.periodo}</p>
          <p className="text-gray-300">
            Progresso Médio: <span className="text-white font-bold">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Progresso Médio das Trilhas</h3>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
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

export default function DashboardClientePage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user: authUser, logout } = useAuthStore();

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

  // Métricas para os cards
  const metricCards = [
    {
      title: "Trilhas Ativas",
      value: "5",
      icon: <BookOpen className="h-8 w-8 text-blue-400" />,
      color: "bg-blue-500",
      description: "Trilhas em andamento"
    },
    {
      title: "Progresso Médio",
      value: "58%",
      icon: <TrendingUp className="h-8 w-8 text-green-400" />,
      color: "bg-green-500",
      description: "Média de conclusão"
    },
    {
      title: "Horas Estudadas",
      value: "42",
      icon: <Clock className="h-8 w-8 text-purple-400" />,
      color: "bg-purple-500",
      description: "Nas últimas 4 semanas"
    },
    {
      title: "Objetivos Concluídos",
      value: "12",
      icon: <CheckCircle className="h-8 w-8 text-yellow-400" />,
      color: "bg-yellow-500",
      description: "Neste mês"
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const user = authUser || useAuthStore.getState().user;
        
        if (!user) {
          router.push("/");
          return;
        }

        // Buscar dados reais do usuário
        const response = await fetch(`/api/empresa/${user.id}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar dados do usuário");
        }
        
        const data = await response.json();
        setUserInfo({
          nome: data.empresa.nome_empresa,
          email: data.empresa.email,
          plano: data.empresa.planoAtivo || "Nenhum"
        });
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dados do usuário");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
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
              {Array(4).fill(0).map((_, index) => (
                <div key={index} className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 animate-pulse">
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Erro ao carregar dashboard</h1>
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
              <div className="h-10 w-32 bg-linear-to-r from-fuchsia-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                EchoNova
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {userInfo && (
              <div className="hidden md:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                <span className="text-gray-300 text-sm">Olá, {userInfo.nome?.split(' ')[0] || "Usuário"}</span>
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-gray-300 text-sm">Plano:</span>
                <div className={`px-3 py-1 rounded-full bg-linear-to-r ${getPlanoColor(userInfo.plano)} text-white text-xs font-bold flex items-center gap-1`}>
                  <span>{getPlanoIcon(userInfo.plano)}</span>
                  <span>{userInfo.plano}</span>
                </div>
              </div>
            )}
            
            <div className="relative">
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full hover:bg-slate-800 p-0 cursor-pointer"
                onClick={handleLogout}
              >
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
              </Button>
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
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Dashboard RH</h1>
                <p className="text-gray-400">Acompanhe o progresso e desempenho das trilhas de aprendizagem</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-gray-800 px-4 py-2 rounded-lg">
                  <p className="text-gray-400 text-sm">Atualizado agora</p>
                </div>
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
              />
            ))}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ProgressoTrilhasChart data={progressoTrilhasData} />
            <DistribuicaoTrilhasChart data={progressoTrilhasData} />
          </div>

          {/* Novo gráfico de progresso médio */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <ProgressoMedioChart data={progressoMedioData} />
          </div>

          {/* Seção adicional de métricas */}
          <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Resumo de Desempenho</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700/30 p-5 rounded-xl border border-gray-600">
                <div className="flex items-center mb-3">
                  <Target className="h-6 w-6 text-blue-400 mr-2" />
                  <h3 className="text-gray-300 font-medium">Objetivos</h3>
                </div>
                <p className="text-3xl font-bold text-white">8/10</p>
                <p className="text-green-400 text-sm mt-1">80% de conclusão</p>
              </div>
              <div className="bg-gray-700/30 p-5 rounded-xl border border-gray-600">
                <div className="flex items-center mb-3">
                  <Calendar className="h-6 w-6 text-green-400 mr-2" />
                  <h3 className="text-gray-300 font-medium">Dias Ativos</h3>
                </div>
                <p className="text-3xl font-bold text-white">18</p>
                <p className="text-green-400 text-sm mt-1">Este mês</p>
              </div>
              <div className="bg-gray-700/30 p-5 rounded-xl border border-gray-600">
                <div className="flex items-center mb-3">
                  <Award className="h-6 w-6 text-yellow-400 mr-2" />
                  <h3 className="text-gray-300 font-medium">Certificados</h3>
                </div>
                <p className="text-3xl font-bold text-white">3</p>
                <p className="text-green-400 text-sm mt-1">Obtidos</p>
              </div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Ações Rápidas</h2>
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
                onClick={() => router.push("/resultados")}
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

      <div className="fixed bottom-0 left-0 w-full -z-10 opacity-20">
      </div>
        <Ondas />
    </main>
  );
}