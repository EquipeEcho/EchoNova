"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Headernaofix, Ondas } from "@/app/clientFuncs";

interface Trilha {
  id: string;
  nome: string;
  descricao: string;
  progresso: number;
  status: "não_iniciado" | "em_andamento" | "concluido";
  dataInicio?: string;
  dataConclusao?: string;
  categoria?: string;
  nivel?: string;
  duracaoEstimada?: number;
  thumbnail?: string;
}

interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  icone?: string;
}

interface Microcurso {
  id: string;
  titulo: string;
  categoria: string;
  concluidoEm: string;
  certificadoUrl?: string;
}

interface MicrocursoDisponivel {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  duracao: string; // ex: "30 min"
  nivel: "iniciante" | "intermediario" | "avancado";
  thumbnail?: string;
}

interface FuncionarioData {
  nome: string;
  email: string;
  matricula: string;
  cargo: string;
  empresa: string;
  trilhas: Trilha[];
  conquistas: Conquista[];
  microcursosConcluidos: Microcurso[];
  microcursosDisponiveis: MicrocursoDisponivel[];
}

const TABS = [
  "Perfil",
  "Trilhas",
  "Microcursos",
  "Explorar Microcursos",
  "Alterar Senha",
] as const;
type TabKey = (typeof TABS)[number];

export default function FuncionarioPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [funcionario, setFuncionario] = useState<FuncionarioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("Perfil");
  const [profileForm, setProfileForm] = useState({
    nome: "",
    email: "",
  });
  const [editForm, setEditForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    const fetchFuncionario = async () => {
      try {
        if (!user || user.tipo !== "funcionario") {
          toast.error("Acesso não autorizado");
          router.push("/");
          return;
        }

        // Busca dados reais do funcionário
        const res = await fetch(`/api/funcionarios/${user.id}/trilhas`, {
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Erro ao buscar dados");
        }

        const data = await res.json();
        
        const funcionarioData: FuncionarioData = {
          nome: data.nome,
          email: data.email,
          matricula: data.matricula,
          cargo: data.cargo,
          empresa: data.empresa?.nome_empresa || user.empresaNome || "Empresa",
          trilhas: (data.trilhas || []).map((t: any) => ({
            id: t._id,
            nome: t.nome,
            descricao: t.descricao,
            progresso: 0,
            status: "não_iniciado" as const,
            categoria: t.categoria,
            nivel: t.nivel,
            duracaoEstimada: t.duracaoEstimada,
            thumbnail: t.thumbnail,
          })),
          conquistas: [],
          microcursosConcluidos: [],
          microcursosDisponiveis: [],
        };

        setFuncionario(funcionarioData);
      } catch (e: any) {
        console.error("Erro ao buscar funcionário:", e);
        toast.error(e.message || "Erro ao carregar dados");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchFuncionario();
    }
  }, [user, router]);

  useEffect(() => {
    if (funcionario) {
      setProfileForm({
        nome: funcionario.nome,
        email: funcionario.email,
      });
    }
  }, [funcionario]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const statusColor = (s: Trilha["status"]) =>
    s === "concluido"
      ? "bg-green-500/20 text-green-400 border-green-600/40"
      : s === "em_andamento"
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-600/40"
      : "bg-gray-600/20 text-gray-400 border-gray-600/40";

  const statusLabel = (s: Trilha["status"]) =>
    s === "concluido"
      ? "Concluído"
      : s === "em_andamento"
      ? "Em Andamento"
      : "Não Iniciado";

  const nivelColor = (n: MicrocursoDisponivel["nivel"]) =>
    n === "iniciante"
      ? "bg-green-500/20 text-green-400 border-green-600/40"
      : n === "intermediario"
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-600/40"
      : "bg-red-500/20 text-red-400 border-red-600/40";

  const nivelLabel = (n: MicrocursoDisponivel["nivel"]) =>
    n === "iniciante"
      ? "Iniciante"
      : n === "intermediario"
      ? "Intermediário"
      : "Avançado";

  const handleSaveProfile = async () => {
    if (editForm.novaSenha && editForm.novaSenha !== editForm.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      // Aqui você faria a chamada à API para atualizar os dados
      toast.success("Perfil atualizado com sucesso!");
      setTab("Perfil");
      if (funcionario) {
        setFuncionario({
          ...funcionario,
                    nome: profileForm.nome,
          email: profileForm.email,
        });
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSavePassword = async () => {
    if (!editForm.senhaAtual) {
      toast.error("Informe a senha atual");
      return;
    }
    if (!editForm.novaSenha) {
      toast.error("Informe a nova senha");
      return;
    }
    if (editForm.novaSenha !== editForm.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      // Aqui você faria a chamada à API para atualizar a senha
      toast.success("Senha alterada com sucesso!");
      setEditForm({
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      });
      setTab("Perfil");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleConcluirTrilha = async (trilhaId: string) => {
    if (!user) return;

    try {
      const res = await fetch(
        `/api/funcionarios/${user.id}/trilhas/${trilhaId}/concluir`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao concluir trilha");
      }

      toast.success("Trilha concluída com sucesso! 🎉");

      // Remove a trilha da lista
      if (funcionario) {
        setFuncionario({
          ...funcionario,
          trilhas: funcionario.trilhas.filter((t) => t.id !== trilhaId),
        });
      }
    } catch (e: any) {
      console.error("Erro ao concluir trilha:", e);
      toast.error(e.message || "Erro ao concluir trilha");
    }
  };

  if (loading)
    return (
      <div className="relative min-h-screen bg-linear-to-br from-gray-950 via-fuchsia-950 to-gray-900 flex items-center justify-center">
        <Headernaofix Link="/" />
        <Ondas />
        <div className="text-white">Carregando...</div>
      </div>
    );

  if (!funcionario)
    return (
      <div className="relative min-h-screen bg-linear-to-br from-gray-950 via-fuchsia-950 to-gray-900 flex items-center justify-center">
        <Headernaofix Link="/" />
        <Ondas />
        <div className="text-white">Erro ao carregar</div>
      </div>
    );

  return (
    <div className="relative min-h-screen bg-linear-to-br from-gray-950 to-gray-850">
      <Headernaofix Link="/" />
      <Ondas />
      <div className="relative z-10 max-w-7xl mx-auto px-2 py-15">
        <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-2xl shadow-2xl p-6 md:p-10 lg:p-12">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {TABS.filter((t) => t !== "Alterar Senha").map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm rounded-full border transition-all ${
                  tab === t
                    ? "bg-fuchsia-700 border-fuchsia-600 text-white shadow-lg"
                    : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                {t}
              </button>
            ))}
            <div className="ml-auto">
              <Button
                onClick={handleLogout}
                className="bg-gray-800 hover:bg-fuchsia-800 text-white border border-neutral-700"
              >
                Sair
              </Button>
            </div>
          </div>

          {/* Conteúdo por aba */}
          {tab === "Perfil" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-linear-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  {funcionario.nome}
                </h1>
                <button
                  onClick={() => setTab("Alterar Senha")}
                  className="text-xs text-neutral-400 hover:text-fuchsia-400 transition-colors flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Alterar senha
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Matrícula" value={funcionario.matricula} />
                <Info label="Cargo" value={funcionario.cargo} />
                <Info label="Email" value={funcionario.email} />
                <Info label="Empresa" value={funcionario.empresa} />
              </div>
            </div>
          )}

          {tab === "Alterar Senha" && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Alterar Senha
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Senha Atual
                  </label>
                  <PasswordInput
                    value={editForm.senhaAtual}
                    onChange={(e) =>
                      setEditForm({ ...editForm, senhaAtual: e.target.value })
                    }
                    placeholder="Digite sua senha atual"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-fuchsia-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Nova Senha
                  </label>
                  <PasswordInput
                    value={editForm.novaSenha}
                    onChange={(e) =>
                      setEditForm({ ...editForm, novaSenha: e.target.value })
                    }
                    placeholder="Digite a nova senha"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-fuchsia-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <PasswordInput
                    value={editForm.confirmarSenha}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        confirmarSenha: e.target.value,
                      })
                    }
                    placeholder="Confirme a nova senha"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-fuchsia-600 transition"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSavePassword}
                    className="flex-1 bg-fuchsia-700 hover:bg-fuchsia-600 text-white"
                  >
                    Alterar Senha
                  </Button>
                  <Button
                    onClick={() => setTab("Perfil")}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tab === "Trilhas" && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                Minhas Trilhas
              </h2>
              {funcionario.trilhas.length === 0 ? (
                <Empty text="Você ainda não possui trilhas atribuídas." />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {funcionario.trilhas.map((t) => (
                    <div
                      key={t.id}
                      className="group bg-neutral-900/70 border border-neutral-700 rounded-xl p-5 hover:border-fuchsia-700 transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-white font-semibold text-lg pr-2">
                          {t.nome}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor(
                            t.status
                          )}`}
                        >
                          {statusLabel(t.status)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-400 mb-3 line-clamp-3">
                        {t.descricao}
                      </p>
                      
                      {/* Info adicional da trilha */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {t.categoria && (
                          <span className="text-xs px-2 py-1 rounded-full border border-fuchsia-700/40 text-fuchsia-300 bg-fuchsia-900/20">
                            {t.categoria}
                          </span>
                        )}
                        {t.nivel && (
                          <span className="text-xs px-2 py-1 rounded-full border border-cyan-700/40 text-cyan-300 bg-cyan-900/20">
                            {t.nivel}
                          </span>
                        )}
                        {t.duracaoEstimada && (
                          <span className="text-xs px-2 py-1 rounded-full border border-purple-700/40 text-purple-300 bg-purple-900/20">
                            {t.duracaoEstimada}h
                          </span>
                        )}
                      </div>

                      <div className="mb-5">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-500">Progresso</span>
                          <span className="text-fuchsia-400 font-bold">
                            {t.progresso}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-fuchsia-600 to-pink-500 transition-all"
                            style={{ width: `${t.progresso}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1 text-[11px] text-neutral-500">
                        {t.dataInicio && (
                          <div>
                            <span className="font-semibold">Início:</span>{" "}
                            {new Date(t.dataInicio).toLocaleDateString("pt-BR")}
                          </div>
                        )}
                        {t.dataConclusao && (
                          <div className="text-green-400">
                            <span className="font-semibold">Concluído:</span>{" "}
                            {new Date(t.dataConclusao).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-sm"
                          onClick={() =>
                            router.push(`/funcionario/trilha/${t.id}`)
                          }
                        >
                          {t.status === "não_iniciado"
                            ? "Iniciar"
                            : t.status === "concluido"
                            ? "Revisar"
                            : "Continuar"}
                        </Button>
                        <Button
                          className="flex-1 bg-green-700 hover:bg-green-600 text-white text-sm"
                          onClick={() => handleConcluirTrilha(t.id)}
                        >
                          Concluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

         

          {tab === "Microcursos" && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                Microcursos Concluídos
              </h2>
              {funcionario.microcursosConcluidos.length === 0 ? (
                <Empty text="Nenhum microcurso concluído ainda." />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {funcionario.microcursosConcluidos.map((m) => (
                    <div
                      key={m.id}
                      className="bg-neutral-900/70 border border-neutral-700 rounded-xl p-5 hover:border-fuchsia-700 transition"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-white font-semibold leading-tight">
                          {m.titulo}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full border border-fuchsia-700/40 text-fuchsia-300 bg-fuchsia-900/20">
                          {m.categoria}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mb-4">
                        Concluído em{" "}
                        {new Date(m.concluidoEm).toLocaleDateString("pt-BR")}
                      </p>
                      <Button
                        className="w-full bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-sm"
                        disabled={!m.certificadoUrl}
                        onClick={() =>
                          m.certificadoUrl &&
                          window.open(m.certificadoUrl, "_blank")
                        }
                      >
                        {m.certificadoUrl ? "Certificado" : "Sem certificado"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Explorar Microcursos" && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2 text-center">
                Explorar Microcursos
              </h2>
              <p className="text-sm text-neutral-400 mb-6 text-center">
                Descubra novos conteúdos para impulsionar seu desenvolvimento
              </p>
              {funcionario.microcursosDisponiveis.length === 0 ? (
                <Empty text="Nenhum microcurso disponível no momento." />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {funcionario.microcursosDisponiveis.map((m) => (
                    <div
                      key={m.id}
                      className="group bg-neutral-900/70 border border-neutral-700 rounded-xl overflow-hidden hover:border-fuchsia-700 transition"
                    >
                      {/* Thumbnail */}
                      <div className="h-32 bg-linear-to-br from-fuchsia-900/40 to-pink-900/40 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-fuchsia-300/60"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>

                      <div className="p-5">
                        {/* Cabeçalho */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="text-white font-semibold leading-tight line-clamp-2">
                            {m.titulo}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full border font-semibold whitespace-nowrap ${nivelColor(
                              m.nivel
                            )}`}
                          >
                            {nivelLabel(m.nivel)}
                          </span>
                        </div>

                        {/* Descrição */}
                        <p className="text-xs text-neutral-400 mb-4 line-clamp-3">
                          {m.descricao}
                        </p>

                        {/* Info */}
                        <div className="flex items-center gap-3 mb-4 text-xs text-neutral-500">
                          <div className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {m.duracao}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            {m.categoria}
                          </div>
                        </div>

                        {/* Botão */}
                        <Button
                          className="w-full bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-sm"
                          onClick={() => {
                            toast.success(`Iniciando "${m.titulo}"...`);
                            router.push(`/funcionario/microcurso/${m.id}`);
                          }}
                        >
                          Iniciar Curso
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-800/60 border border-neutral-700 rounded-lg p-4 flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-neutral-200">{value}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="bg-neutral-900/70 border border-neutral-700 rounded-xl p-10 text-center text-neutral-400">
      {text}
    </div>
  );
}
