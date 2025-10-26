"use client";

import { useState, useEffect } from "react";
import { Ondas } from "../clientFuncs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";

export default function PosLoginPage() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLastDiagnostic, setLoadingLastDiagnostic] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user: authUser, logout } = useAuthStore();

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
        const response = await fetch(`/api/empresa/${user.id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Erro ao buscar dados do usuário");
        }

        const userData = {
          nome: data.empresa.nome_empresa,
          email: data.empresa.email,
          plano: data.empresa.planoAtivo || "Nenhum"
        };
        
        setUserInfo(userData);
      } catch (error) {
        console.error("Erro ao carregar informações do usuário:", error);
        if (!redirected) {
          redirected = true;
          router.push("/");
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

  /**
   * @description Função robusta para buscar e navegar para o último diagnóstico.
   * Verifica o status da resposta ANTES de tentar redirecionar.
   */
  const handleViewLastDiagnostic = async () => {
    setLoadingLastDiagnostic(true);
    try {
      const res = await fetch("/api/diagnostico-aprofundado/ultimo");

      // --- CORREÇÃO APLICADA ---
      // Primeiro, verificamos se a resposta da API foi bem-sucedida.
      if (!res.ok) {
        // Se não foi (ex: status 404), lemos a mensagem de erro da API.
        const errorData = await res.json();
        // E lançamos um erro, que será capturado pelo bloco `catch`.
        throw new Error(errorData.error || "Não foi possível carregar o diagnóstico.");
      }
      
      // Somente se a resposta foi bem-sucedida, prosseguimos para ler os dados.
      const data = await res.json();

      // Uma verificação extra para garantir que os dados têm o formato esperado.
      if (data && data._id) {
        // Agora, com a certeza de que temos um ID, redirecionamos.
        router.push(`/diagnostico-aprofundado/resultados/${data._id}`);
      } else {
        // Caso a API retorne 200 OK mas com dados inválidos.
        throw new Error("Resposta inválida do servidor.");
      }

    } catch (error: any) {
      // Este bloco agora captura corretamente tanto falhas de rede quanto erros da API.
      toast.info(error.message);
    } finally {
      setLoadingLastDiagnostic(false);
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
      case "essencial": return "from-indigo-500 to-purple-600";
      case "avancado": return "from-fuchsia-500 to-pink-600";
      case "escalado": return "from-emerald-500 to-teal-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getPlanoIcon = (plano: string) => {
    switch (plano?.toLowerCase()) {
      case "essencial": return "💎";
      case "avancado": return "🚀";
      case "escalado": return "👑";
      default: return "⭐";
    }
  };

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen h-screen overflow-hidden">
        <section className="flex-1 main-bg flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 relative">
          <Loader text="Carregando informações..." />
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
                <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getPlanoColor(userInfo.plano)} text-white text-xs font-bold flex items-center gap-1`}>
                  <span>{getPlanoIcon(userInfo.plano)}</span>
                  <span>{userInfo.plano}</span>
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
                    <p className="text-sm font-medium text-white truncate">{userInfo?.nome || "Usuário"}</p>
                    <p className="text-xs text-gray-400 truncate">{userInfo?.email || "email@exemplo.com"}</p>
                  </div>
                  <div className="px-4 py-2 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 text-sm">Plano:</span>
                      <div className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${getPlanoColor(userInfo?.plano)} text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity`}>
                        <span>{getPlanoIcon(userInfo?.plano)}</span>
                        <span>{userInfo?.plano || "Nenhum"}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
            Painel do Cliente
          </h1>

          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/40 shadow-xl max-w-2xl mx-auto mb-12">
            <h3 className="text-xl font-bold text-white mb-6">Ações Disponíveis</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleStartDiagnostico}
                size="lg"
                className="flex-1 bg-gradient-to-r from-fuchsia-700 to-fuchsia-800 hover:from-fuchsia-800 hover:to-fuchsia-900 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Iniciar Novo Diagnóstico
              </Button>
              <Button
                onClick={handleViewLastDiagnostic}
                disabled={loadingLastDiagnostic}
                size="lg"
                variant="outline"
                className="flex-1 border-pink-500 text-pink-500 hover:bg-pink-500/10 hover:text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {loadingLastDiagnostic ? "Buscando..." : "Último Diagnóstico Realizado"}
              </Button>
            </div>
          </div>
        </div>

        <div className="-z-10">
          <Ondas />
        </div>
      </section>
    </main>
  );
}