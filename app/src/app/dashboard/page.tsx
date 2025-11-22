"use client";

import { useState, useEffect } from "react";
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
import { Users, FileText, CreditCard, TrendingUp, Activity, UserCheck, DollarSign } from "lucide-react";
import { Ondas } from "../clientFuncs"; // Import the Ondas component

// Tipagem para os dados do gráfico de empresas por plano
interface EmpresasPorPlano {
  plano: string;
  count: number;
  [key: string]: any; // Add index signature to fix TypeScript error
}


// Tipagem para os dados das métricas
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
  changeType?: "positive" | "negative";
}

interface MetricsResponse {
  ok: boolean;
  diagnosticos: {
    atual: number;
    anterior: number;
    crescimentoPercentual: number;
  };
  empresas: {
    atual: number;
    anterior: number;
    retencaoPercentual: number;
  };
  historicoMensal: { year: number; month: number; total: number }[];
  distribuicaoDimensoes: { dimensao: string; total: number }[];
}

// Componente para os cards de métricas
const MetricCard = ({ title, value, icon, color, change, changeType }: MetricCardProps) => (
  <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
        
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
        {change && (
          <p className={`text-sm mt-1 flex items-center ${changeType === "positive" ? "text-green-400" : "text-red-400"}`}>
            {changeType === "positive" ? "↑" : "↓"} {change}
          </p>
        )}
        
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        {icon}
      </div>
    </div>
  </div>
);

// Componente para o gráfico de barras
const EmpresasPorPlanoBarChart = ({ data }: { data: EmpresasPorPlano[] }) => {
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-gray-300">
            Empresas: <span className="text-white font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    
    <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Distribuição de Empresas por Plano</h3>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <span className="text-gray-400 text-sm">Empresas</span>
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
              dataKey="plano" 
              stroke="#888"
              angle={-45}
              textAnchor="end"
              height={60}
              tickLine={false}
            />
            <YAxis stroke="#888" tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="count" name="Número de Empresas" radius={[4, 4, 0, 0]}>
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

// Componente para o gráfico de pizza
const EmpresasPorPlanoPieChart = ({ data }: { data: EmpresasPorPlano[] }) => {
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow-lg">
          <p className="text-white font-semibold">{payload[0].payload.plano}</p>
          <p className="text-gray-300">
            Empresas: <span className="text-white font-bold">{payload[0].value}</span>
          </p>
          <p className="text-gray-300">
            Porcentagem: <span className="text-white font-bold">
              {((payload[0].value / data.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Participação de Planos</h3>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <span className="text-gray-400 text-sm">Distribuição</span>
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
              label={(entry: any) => `${entry.plano}: ${(entry.percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="plano"
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


export default function DashboardPage() {
  const [empresasPorPlano, setEmpresasPorPlano] = useState<EmpresasPorPlano[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDiagnosticos, setTotalDiagnosticos] =  useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [Metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [ totalEmpresas, setTotalEmpresas] = useState<number>(0);

  // Fetch data for charts
  useEffect(() => {
    async function fetchMetrics() {
        try {
          const res = await fetch("/api/metrics");
          const json = await res.json();

          setMetrics(json);

        } catch (err) {
          console.error("Erro ao buscar métricas:", err);
        } finally {
          setLoading(false);
        }
    }

    fetchMetrics();


    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/empresas/por-plano", {
          credentials: 'include'
        });
        const data = await response.json();

        const res = await fetch("/api/total-diagnosticos");
        const dados = await res.json();
        const resEmpresas = await fetch("/api/total-empresas");
        const dadosEmpresas = await resEmpresas.json();

        if (data.success && dados.success && dadosEmpresas.success) {
          setEmpresasPorPlano(data.data);
          setTotalDiagnosticos(dados.data);
          setTotalEmpresas(dadosEmpresas.data);
        }else {
          setError(data.error || "Erro ao carregar dados");
        }
      } catch (err: any) {
        setError(err.message || "Erro de conexão");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Métricas reais para os cards (você pode substituir por dados reais)
   const metricCards = [
    {
      title: "Total de Empresas",
      value: totalEmpresas,
      icon: <Users className="h-8 w-8 text-blue-400" />,
      color: "bg-blue-500",
      change: Metrics?.empresas.retencaoPercentual + "%",
      changeType: "positive" as const
    },
    {
      title: "Diagnósticos Realizados",
      value: totalDiagnosticos,
      icon: <FileText className="h-8 w-8 text-green-400" />,
      color: "bg-green-500",
      change: Metrics?.diagnosticos.crescimentoPercentual + "%" ,
      changeType: "positive" as const
    },
    { 
      title: "Assinaturas Ativas",
      value: empresasPorPlano.length,
      icon: <CreditCard className="h-8 w-8 text-purple-400" />,
      color: "bg-purple-500",
      change: "",
      changeType: "positive" as const
    },
    {
      title: "Taxa de Conversão",
      value: Metrics?.empresas.retencaoPercentual + "%",
      icon: <TrendingUp className="h-8 w-8 text-yellow-400" />,
      color: "bg-yellow-500",
      change: "",
      changeType: "positive" as const
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-950 p-4 sm:p-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard Administrativo</h1>
            <p className="text-gray-400">Visão geral das métricas e desempenho</p>
          </div>

          {/* Skeleton loading for metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-700 rounded w-32 mb-4"></div>
                    <div className="h-8 bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-700 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton loading for charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 h-96 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
              <div className="h-full bg-gray-700 rounded"></div>
            </div>
            <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700 h-96 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/3 mb-6"></div>
              <div className="h-full bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 w-full -z-10 opacity-30">

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-950 p-8 flex items-center justify-center relative overflow-hidden">
        <div className="text-center bg-linear-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700 max-w-md relative z-10">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Erro ao carregar dashboard</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Tentar novamente
          </button>
        </div>
        <div className="fixed bottom-0 left-0 w-full -z-10 opacity-20">
          <Ondas />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-950 p-4 sm:p-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard Administrativo</h1>
              <p className="text-gray-400">Visão geral das métricas e desempenho</p>
            </div>
            <div className="flex items-center space-x-4">
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
              change={card.change}
              changeType={card.changeType}
            />
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EmpresasPorPlanoBarChart data={empresasPorPlano} />
          <EmpresasPorPlanoPieChart data={empresasPorPlano} />
        </div>

        {/* Seção adicional de métricas */}
        <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Resumo de Métricas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-700/30 p-5 rounded-xl border border-gray-600">
              <div className="flex items-center mb-3">
                <Activity className="h-6 w-6 text-blue-400 mr-2" />
                <h3 className="text-gray-300 font-medium">Crescimento Mensal</h3>
              </div>
              <p className="text-3xl font-bold text-white">{Metrics?.empresas.retencaoPercentual + "%"}</p>
              <p className="text-green-400 text-sm mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                { Metrics?.empresas.retencaoPercentual + "%" } em relação ao mês anterior
              </p>
            </div>
            <div className="bg-gray-700/30 p-5 rounded-xl border border-gray-600">
              <div className="flex items-center mb-3">
                <UserCheck className="h-6 w-6 text-green-400 mr-2" />
                <h3 className="text-gray-300 font-medium">Taxa de Retenção</h3>
              </div>
              <p className="text-3xl font-bold text-white">{Metrics?.empresas.retencaoPercentual + "%"}</p>
              <p className="text-green-400 text-sm mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
               {Metrics?.empresas.retencaoPercentual + "%"} em relação ao mês anterior
              </p>
            </div>
            <div className="bg-gray-700/30 p-5 rounded-xl border border-gray-600">
              <div className="flex items-center mb-3">
                <DollarSign className="h-6 w-6 text-yellow-400 mr-2" />
                <h3 className="text-gray-300 font-medium">Satisfação do Cliente</h3>
              </div>
              <p className="text-4xl font-bold text-white">4.8/5</p>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full -z-10 opacity-20">
      </div>
      <Ondas />
    </div>
    
  );
}