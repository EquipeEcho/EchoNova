"use client";

import { useState, useEffect } from "react";
import { Ondas } from "../clientFuncs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { History } from "lucide-react"; // NOVO: Importando ícone

type UserInfo = { nome?: string; email?: string; plano?: string } | null;

export default function PosLoginPage() {
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user: authUser, logout } = useAuthStore();

  // --- NOVO ESTADO ---
  // Armazena o ID do último diagnóstico, se existir.
  const [ultimoDiagnosticoId, setUltimoDiagnosticoId] = useState<string | null>(null);

  useEffect(() => {
    let redirected = false;
    
    const checkAuthState = async () => {
      if (redirected) return;
      
      await new Promise(resolve => setTimeout(resolve, 200));
      const currentState = useAuthStore.getState();
      
      if (!authUser && !currentState.user) {
        const localStorageData = localStorage.getItem('auth-storage');
        if (localStorageData) {
          try {
            const parsedData = JSON.parse(localStorageData);
            if (parsedData.state?.user) {
              await new Promise(resolve => setTimeout(resolve, 100));
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

      try {
        // --- LÓGICA DE BUSCA DOS DOIS DADOS EM PARALELO ---
        const [empresaRes, ultimoDiagRes] = await Promise.all([
          fetch(`/api/empresa/${user.id}`),
          fetch(`/api/diagnostico-aprofundado/ultimo`) // Busca o último diagnóstico
        ]);

        // Processa dados da empresa
        if (!empresaRes.ok) {
          const errorData = await empresaRes.json();
          throw new Error(errorData.error || "Erro ao buscar dados do usuário");
        }
        const empresaData = await empresaRes.json();
        const userData = {
          nome: empresaData.empresa.nome_empresa,
          email: empresaData.empresa.email,
          plano: empresaData.empresa.planoAtivo || "Nenhum"
        };
        setUserInfo(userData);

        // Processa o resultado do último diagnóstico
        if (ultimoDiagRes.ok) {
          const diagData = await ultimoDiagRes.json();
          setUltimoDiagnosticoId(diagData._id); // Salva o ID do diagnóstico
        } else if (ultimoDiagRes.status === 404) {
          console.log("Nenhum diagnóstico aprofundado anterior encontrado.");
          setUltimoDiagnosticoId(null); // Garante que o estado é nulo
        }
        
      } catch (error) {
        console.error("Erro ao carregar informações da página:", error);
        if (!redirected) {
          // Apenas redireciona se o erro for crítico (como falha ao buscar dados da empresa)
          // Se for só o 404 do diagnóstico, a página deve carregar normalmente.
          if ((error as Error).message.includes("dados do usuário")) {
            redirected = true;
            router.push("/");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      checkAuthState();
    } else {
      const timer = setTimeout(checkAuthState, 400);
      return () => clearTimeout(timer);
    }
  }, [authUser, router]);

  const handleStartDiagnostico = () => {
    router.push("/diagnostico-aprofundado");
  };

  // --- NOVA FUNÇÃO ---
  // Navega para a página de resultados do último diagnóstico.
  const handleViewLastReport = () => {
    if (ultimoDiagnosticoId) {
      router.push(`/diagnostico-aprofundado/resultados/${ultimoDiagnosticoId}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
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
      <main className="flex flex-col min-h-screen h-screen overflow-hidden">
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/40 flex items-center gap-2">
            <div className="h-6 w-24 bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
        <section className="flex-1 main-bg flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 relative">
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
      <main className="flex flex-col min-h-screen h-screen overflow-hidden">
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/40 flex items-center gap-2">
            <div className="h-6 w-24 bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
        <section className="flex-1 main-bg flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="text-white text-xl">Carregando informações...</div>
          <div className="-z-10">
            <Ondas />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen h-screen overflow-hidden">
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
                <div className={`px-3 py-1 rounded-full bg-linear-to-r ${getPlanoColor(userInfo?.plano || "")} text-white text-xs font-bold flex items-center gap-1`}>
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
                      <div className={`px-2 py-0.5 rounded-full bg-linear-to-r ${getPlanoColor(userInfo?.plano || "")} text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity`}>
                        <span>{getPlanoIcon(userInfo?.plano || "")}</span>
                        <span>{userInfo?.plano || "Nenhum"}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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

      <section className="flex-1 main-bg flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 relative pt-16">
        <div className="max-w-4xl w-full">
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white mb-6 sm:mb-8 md:mb-10 animate-fade-in-up text-center">
            Diagnóstico Aprofundado
          </h1>

          <p className="relative z-20 text-sm xs:text-base sm:text-lg md:text-xl text-gray-200 max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-3xl mb-8 sm:mb-10 md:mb-12 leading-relaxed animate-fade-in-up-delay poetic-text text-center mx-auto">
            Com base no seu plano {userInfo?.plano}, você tem acesso ao diagnóstico aprofundado. 
            Este processo irá analisar detalhadamente os pontos críticos da sua empresa para 
            oferecer recomendações personalizadas.
          </p>

          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/40 shadow-xl max-w-2xl mx-auto mb-12">
            <h3 className="text-xl font-bold text-white mb-4">O que esperar do diagnóstico:</h3>
            <ul className="text-gray-300 text-left space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-fuchsia-500 mr-2">•</span>
                <span>Análise detalhada em múltiplas dimensões do seu negócio</span>
              </li>
              <li className="flex items-start">
                <span className="text-fuchsia-500 mr-2">•</span>
                <span>Identificação de pontos fortes e áreas de melhoria</span>
              </li>
              <li className="flex items-start">
                <span className="text-fuchsia-500 mr-2">•</span>
                <span>Recomendações personalizadas de trilhas de aprendizagem</span>
              </li>
              <li className="flex items-start">
                <span className="text-fuchsia-500 mr-2">•</span>
                <span>Relatório completo com plano de ação</span>
              </li>
            </ul>
            
            {/* --- CONTAINER PARA OS BOTÕES DE AÇÃO --- */}
            <div className="flex flex-col gap-4">
              <Button 
                onClick={handleStartDiagnostico}
                className="w-full bg-linear-to-r from-fuchsia-700 to-fuchsia-800 hover:from-fuchsia-800 hover:to-fuchsia-900 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Iniciar Novo Diagnóstico
              </Button>

              {/* --- NOVO BOTÃO CONDICIONAL --- */}
              {ultimoDiagnosticoId && (
                <Button 
                  onClick={handleViewLastReport}
                  variant="outline" // Estilo diferente para ser secundário
                  className="w-full border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
                >
                  <History className="mr-2 h-5 w-5" />
                  Ver Último Relatório Realizado
                </Button>
              )}
            </div>

          </div>

          <div className="text-gray-400 text-sm max-w-2xl mx-auto">
            <p>
              O diagnóstico aprofundado leva em média 15-20 minutos para ser concluído. 
              Recomendamos que você reserve um tempo tranquilo para responder com atenção.
            </p>
          </div>
        </div>

        <div className="-z-10">
          <Ondas />
        </div>
      </section>
    </main>
  );
}