"use client";

import { useState, useEffect } from "react";
import { Ondas } from "../clientFuncs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import {
  History,
  PlayCircle,
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Target,
  Award,
} from "lucide-react";
import { toast } from "sonner";

type UserInfo = { nome?: string; email?: string; plano?: string } | null;

export default function PosLoginPage() {
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { user: authUser, logout } = useAuthStore();

  const [ultimoDiagnosticoId, setUltimoDiagnosticoId] = useState<string | null>(
    null
  );
  
  function verifica() {
    if(ultimoDiagnosticoId == null){
      return "grid grid-cols-1 md:grid-cols-1 w-full place-items-center gap-6 mb-8"
    }
    return "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
  }

  useEffect(() => {
    let redirected = false;

    const checkAuthState = async () => {
      if (redirected || isLoggingOut) return;

      await new Promise((resolve) => setTimeout(resolve, 200));
      const currentState = useAuthStore.getState();

      if (!authUser && !currentState.user) {
        const localStorageData = localStorage.getItem("auth-storage");
        if (localStorageData) {
          try {
            const parsedData = JSON.parse(localStorageData);
            if (parsedData.state?.user) {
              await new Promise((resolve) => setTimeout(resolve, 100));
              const updatedState = useAuthStore.getState();
              if (!updatedState.user) {
                redirected = true;
                router.push("/");
                return;
              }
            } else {
              redirected = true;
              router.push("/");
              return;
            }
          } catch (e) {
            console.error("Erro ao parsear dados do localStorage:", e);
            redirected = true;
            router.push("/");
            return;
          }
        } else {
          redirected = true;
          router.push("/");
          return;
        }
      }

      const user = authUser || useAuthStore.getState().user;

      if (!user) {
        redirected = true;
        router.push("/");
        return;
      }

      if (user.tipo === "funcionario") {
        redirected = true;
        router.push("/pagina-funcionarios");
        return;
      }

      try {
        const empresaId = user.empresaId || user.id;
        const [empresaRes, ultimoDiagRes] = await Promise.all([
          fetch(`/api/empresa/${empresaId}`, {
            credentials: "include",
          }),
          fetch(`/api/diagnostico-aprofundado/ultimo`, {
            credentials: "include",
          }),
        ]);

        if (!empresaRes.ok) {
          const errorData = await empresaRes.json();
          throw new Error(errorData.error || "Erro ao buscar dados do usuário");
        }
        const empresaData = await empresaRes.json();
        const userData = {
          nome: empresaData.empresa.nome_empresa,
          email: empresaData.empresa.email,
          plano: empresaData.empresa.planoAtivo || "Nenhum",
        };
        setUserInfo(userData);

        if (ultimoDiagRes.ok) {
          const diagData = await ultimoDiagRes.json();
          setUltimoDiagnosticoId(diagData._id);
        } else if (ultimoDiagRes.status === 404) {
          setUltimoDiagnosticoId(null);
        }
      } catch (error) {
        console.error("Erro ao carregar informações da página:", error);
        if (!redirected) {
          if ((error as Error).message.includes("dados do usuário")) {
            redirected = true;
            router.push("/");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (!isLoggingOut) {
      if (authUser) {
        checkAuthState();
      } else {
        const timer = setTimeout(checkAuthState, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [authUser, router, isLoggingOut]);

  const handleStartDiagnostico = () => {
    router.push("/diagnostico-aprofundado");
  };

  const handleViewLastReport = () => {
    if (ultimoDiagnosticoId) {
      router.push(`/diagnostico-aprofundado/resultados/${ultimoDiagnosticoId}`);
    }
  };

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

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen h-screen overflow-hidden bg-linear-to-br from-gray-950 to-gray-850">
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/40 flex items-center gap-2">
            <div className="h-6 w-24 bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
        <section className="flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="text-white text-xl">Carregando informações...</div>
          <div className="-z-10">
            <Ondas />
          </div>
        </section>
      </main>
    );
  }

  if ((!authUser && !useAuthStore.getState().user) || loading) {
    return (
      <main className="flex flex-col min-h-screen h-screen overflow-hidden bg-linear-to-br from-gray-950 to-gray-850">
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/40 flex items-center gap-2">
            <div className="h-6 w-24 bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
        <section className="flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="text-white text-xl">Carregando informações...</div>
          <div className="-z-10">
            <Ondas />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-linear-to-br from-gray-950 to-gray-850 overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="logo-container hover:scale-100">
            <Link href="/pos-login">
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

      <section className="flex-1 flex flex-col justify-start items-center px-4 sm:px-6 lg:px-8 relative pt-24 pb-12">
        <div className="max-w-7xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white mb-4">
              Bem-vindo ao
              <span className="bg-linear-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                Centro de Gestão
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Gerencie diagnósticos, acompanhe o progresso da equipe e
              potencialize o desenvolvimento organizacional
            </p>
          </div>

          {/* Cards Grid */}
          <div className={verifica()}>
            {/* Card Diagnóstico */}
            <div className="group bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8 hover:border-fuchsia-700/50 transition-all duration-300 hover:shadow-2xl hover:shadow-fuchsia-900/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 bg-fuchsia-700/20 rounded-xl group-hover:bg-fuchsia-700/30 transition-colors">
                  <PlayCircle className="h-8 w-8 text-fuchsia-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Diagnóstico Aprofundado
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Inicie uma análise completa da sua organização
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Target className="h-5 w-5 text-fuchsia-400 mt-0.5 shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Análise detalhada em múltiplas dimensões do negócio
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-fuchsia-400 mt-0.5 shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Identificação de pontos fortes e áreas de melhoria
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-fuchsia-400 mt-0.5 shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Recomendações personalizadas de trilhas de aprendizagem
                  </p>
                </div>
              </div>

              <Button
                onClick={handleStartDiagnostico}
                className="w-full bg-linear-to-r from-fuchsia-700 to-fuchsia-800 hover:from-fuchsia-800 hover:to-fuchsia-900 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Iniciar Diagnóstico
              </Button>
            </div>
          

          {/* Cards Condicionais */}
          {ultimoDiagnosticoId && (
            <>
              {/* Card Dashboard */}
            <div className="group bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8 hover:border-cyan-700/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-900/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 bg-cyan-700/20 rounded-xl group-hover:bg-cyan-700/30 transition-colors">
                  <BarChart3 className="h-8 w-8 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Dashboard RH
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Visualize métricas e indicadores de performance
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Gráficos interativos de progresso e desempenho
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Acompanhamento de trilhas de aprendizagem ativas
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Target className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                  <p className="text-gray-300 text-sm">
                    Visão consolidada de objetivos e conquistas
                  </p>
                </div>
              </div>

              <Link href="/dashboard-cliente" className="w-full block">
                <Button className="w-full bg-linear-to-r from-cyan-700 to-cyan-800 hover:from-cyan-800 hover:to-cyan-900 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Acessar Dashboard
                </Button>
              </Link>
            </div>
              {/* Card Gerenciar Funcionários */}
              <div className="group bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8 hover:border-emerald-700/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-4 bg-emerald-700/20 rounded-xl group-hover:bg-emerald-700/30 transition-colors">
                    <Users className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Gerenciar Funcionários
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Administre sua equipe de forma eficiente
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-gray-300 text-sm">
                      Cadastre, edite e remova funcionários
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-gray-300 text-sm">
                      Atribua trilhas de aprendizagem personalizadas
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-gray-300 text-sm">
                      Acompanhe o progresso individual da equipe
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => router.push("/gerenciar-funcionarios")}
                  className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Gerenciar Equipe
                </Button>
              </div>

              {/* Card Último Relatório */}
              <div className="group bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-2xl p-8 hover:border-purple-700/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-4 bg-purple-700/20 rounded-xl group-hover:bg-purple-700/30 transition-colors">
                    <FileText className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Último Relatório
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Revise os resultados do diagnóstico anterior
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                    <p className="text-gray-300 text-sm">
                      Relatório completo com análises detalhadas
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                    <p className="text-gray-300 text-sm">
                      Plano de ação personalizado para sua empresa
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
                    <p className="text-gray-300 text-sm">
                      Trilhas recomendadas baseadas no diagnóstico
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleViewLastReport}
                  className="w-full bg-linear-to-r from-purple-700 to-purple-800 hover:from-purple-800 hover:to-purple-900 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <History className="mr-2 h-5 w-5" />
                  Ver Relatório
                </Button>
              </div>
            </>
          )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full -z-10 opacity-20">
          <Ondas />
        </div>
      </section>
    </main>
  );
}
