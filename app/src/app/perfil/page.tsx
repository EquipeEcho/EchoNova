"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Ondas } from "../clientFuncs";
import { ArrowLeft, Save, User, Lock, Building2, Calendar } from "lucide-react";

interface EmpresaData {
  _id: string;
  nome_empresa: string;
  email: string;
  cnpj: string;
  planoAtivo?: string;
  createdAt?: string;
  data_cadastro?: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dados da empresa
  const [empresaData, setEmpresaData] = useState<EmpresaData | null>(null);
  
  // Formulário de dados gerais
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [email, setEmail] = useState("");

  // Formulário de alteração de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  useEffect(() => {
    const fetchEmpresa = async () => {
      if (!user?.id) {
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/empresa/${user.id}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Erro ao carregar dados da empresa");
        }

        const data = await res.json();
        const empresa = data.empresa;
        
        setEmpresaData(empresa);
        setNomeEmpresa(empresa.nome_empresa);
        setEmail(empresa.email);
      } catch (error) {
        console.error("Erro ao carregar empresa:", error);
        toast.error("Erro ao carregar dados da empresa");
        router.push("/pos-login");
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresa();
  }, [user, router]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!empresaData?._id) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/empresa/${empresaData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_empresa: nomeEmpresa,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar dados");
      }

      toast.success("Dados atualizados com sucesso!");
      setEmpresaData({ ...empresaData, nome_empresa: nomeEmpresa, email });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar dados");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!empresaData?._id) return;

    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.error("Preencha todos os campos de senha");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast.error("A nova senha e a confirmação não coincidem");
      return;
    }

    if (novaSenha.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres");
      return;
    }

    if (!/[A-Z]/.test(novaSenha)) {
      toast.error("A nova senha deve conter pelo menos uma letra maiúscula");
      return;
    }

    if (!/[a-z]/.test(novaSenha)) {
      toast.error("A nova senha deve conter pelo menos uma letra minúscula");
      return;
    }

    if (!/[0-9]/.test(novaSenha)) {
      toast.error("A nova senha deve conter pelo menos um número");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/empresa/${empresaData._id}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senhaAtual,
          novaSenha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar senha");
      }

      toast.success("Senha alterada com sucesso!");
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao alterar senha");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data não disponível";
    
    try {
      // Se for um ObjectId (24 chars hex), extrair timestamp
      if (/^[0-9a-fA-F]{24}$/.test(dateString)) {
        const ts = parseInt(dateString.substring(0, 8), 16) * 1000;
        const date = new Date(ts);
        return date.toLocaleDateString("pt-BR", { 
          day: "2-digit", 
          month: "long", 
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      
      return date.toLocaleDateString("pt-BR", { 
        day: "2-digit", 
        month: "long", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Data não disponível";
    }
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
      <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Loader text="Carregando perfil..." />
        <div className="-z-10">
          <Ondas />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white">
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
            {empresaData && (
              <div className="hidden md:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                <span className="text-gray-300 text-sm">{empresaData.nome_empresa}</span>
              </div>
            )}

            <div className="relative">
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:bg-slate-800 p-0 cursor-pointer"
                onClick={toggleMenu}
              >
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                  {empresaData?.nome_empresa?.charAt(0) || "U"}
                </div>
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-sm font-medium text-white truncate">
                      {empresaData?.nome_empresa || "Empresa"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {empresaData?.email || "email@exemplo.com"}
                    </p>
                  </div>
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

      {/* Content */}
      <div className="container mx-auto px-4 py-10 pt-28 md:pt-32">
        <div className="mb-8 pb-6 border-b border-pink-500/30 flex items-center gap-4">
          <Link href="/pos-login">
            <Button variant="outline" size="icon" className="border-pink-500/40 text-pink-400 hover:bg-pink-500/10 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400 tracking-tight">
              Meu Perfil
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Gerencie as informações da sua empresa e configurações de segurança
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Informações Gerais */}
          <Card className="bg-slate-800/60 border border-slate-700/60 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-pink-300 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center pb-4 border-b border-slate-700/60">
                <div className="h-20 w-20 rounded-full bg-pink-600/20 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-3 border-2 border-pink-500/40">
                  {empresaData?.nome_empresa?.charAt(0) || "E"}
                </div>
                <h3 className="text-lg font-semibold text-white">{empresaData?.nome_empresa}</h3>
                <p className="text-sm text-slate-400">{empresaData?.email}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-pink-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Membro desde</p>
                    <p className="text-sm text-slate-300">
                      {formatDate(empresaData?.createdAt || empresaData?.data_cadastro || empresaData?._id)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">Plano Atual</p>
                    <div className={`px-3 py-1.5 rounded-full bg-linear-to-r ${getPlanoColor(empresaData?.planoAtivo || "")} text-white text-sm font-bold flex items-center gap-2 w-fit`}>
                      <span>{getPlanoIcon(empresaData?.planoAtivo || "")}</span>
                      <span>{empresaData?.planoAtivo || "Nenhum"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60">
                  <p className="text-xs text-slate-500 mb-1">CNPJ</p>
                  <p className="text-sm text-slate-300 font-mono">{empresaData?.cnpj}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content - Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="dados" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/60 border border-slate-700/60 rounded-lg mb-6">
                <TabsTrigger 
                  value="dados" 
                  className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-slate-300 rounded-md transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dados da Empresa
                </TabsTrigger>
                <TabsTrigger 
                  value="seguranca" 
                  className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-slate-300 rounded-md transition-colors"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Segurança
                </TabsTrigger>
              </TabsList>

              {/* Tab: Dados da Empresa */}
              <TabsContent value="dados">
                <Card className="bg-slate-800/60 border border-slate-700/60">
                  <CardHeader>
                    <CardTitle className="text-pink-300">Editar Informações</CardTitle>
                    <CardDescription className="text-slate-400">
                      Atualize os dados cadastrais da sua empresa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveInfo} className="space-y-5">
                      <div>
                        <Label htmlFor="nome_empresa" className="text-pink-300">
                          Nome da Empresa
                        </Label>
                        <Input
                          id="nome_empresa"
                          value={nomeEmpresa}
                          onChange={(e) => setNomeEmpresa(e.target.value)}
                          required
                          className="mt-1 bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-pink-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="mt-1 bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                        />
                      </div>

                      <div>
                        <Label className="text-pink-300">
                          CNPJ
                        </Label>
                        <div className="mt-1 px-3 py-2 bg-slate-900/20 border border-slate-700/40 rounded-md text-slate-400 font-mono text-sm">
                          {empresaData?.cnpj || "Não informado"}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          O CNPJ não pode ser alterado. Entre em contato com o suporte se necessário.
                        </p>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={saving}
                          className="bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/30"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {saving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.push("/pos-login")}
                          className="border-pink-500/40 text-pink-300 hover:bg-pink-500/10 hover:text-white"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Segurança */}
              <TabsContent value="seguranca">
                <Card className="bg-slate-800/60 border border-slate-700/60">
                  <CardHeader>
                    <CardTitle className="text-pink-300">Alterar Senha</CardTitle>
                    <CardDescription className="text-slate-400">
                      Mantenha sua conta segura alterando sua senha regularmente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-5">
                      <div>
                        <Label htmlFor="senha_atual" className="text-pink-300">
                          Senha Atual
                        </Label>
                        <PasswordInput
                          id="senha_atual"
                          value={senhaAtual}
                          onChange={(e) => setSenhaAtual(e.target.value)}
                          required
                          className="mt-1 bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                        />
                      </div>

                      <div>
                        <Label htmlFor="nova_senha" className="text-pink-300">
                          Nova Senha
                        </Label>
                        <PasswordInput
                          id="nova_senha"
                          value={novaSenha}
                          onChange={(e) => setNovaSenha(e.target.value)}
                          required
                          className="mt-1 bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Mínimo 8 caracteres, com maiúsculas, minúsculas e números
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="confirmar_senha" className="text-pink-300">
                          Confirmar Nova Senha
                        </Label>
                        <PasswordInput
                          id="confirmar_senha"
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          required
                          className="mt-1 bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                        />
                      </div>

                      <div className="bg-slate-900/40 border border-slate-700/60 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-pink-300 mb-2">Requisitos de Segurança</h4>
                        <ul className="text-xs text-slate-400 space-y-1">
                          <li className={novaSenha.length >= 8 ? "text-green-400" : ""}>
                            • Mínimo de 8 caracteres
                          </li>
                          <li className={/[A-Z]/.test(novaSenha) ? "text-green-400" : ""}>
                            • Pelo menos uma letra maiúscula
                          </li>
                          <li className={/[a-z]/.test(novaSenha) ? "text-green-400" : ""}>
                            • Pelo menos uma letra minúscula
                          </li>
                          <li className={/[0-9]/.test(novaSenha) ? "text-green-400" : ""}>
                            • Pelo menos um número
                          </li>
                        </ul>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={saving}
                          className="bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/30"
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          {saving ? "Alterando..." : "Alterar Senha"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSenhaAtual("");
                            setNovaSenha("");
                            setConfirmarSenha("");
                          }}
                          className="border-pink-500/40 text-pink-300 hover:bg-pink-500/10 hover:text-white"
                        >
                          Limpar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="-z-10 fixed inset-0">
        <Ondas />
      </div>
    </main>
  );
}
