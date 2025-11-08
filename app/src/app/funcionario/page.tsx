"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Headernaofix, Ondas } from "@/app/clientFuncs";

interface Trilha {
  id: string;
  nome: string;
  descricao: string;
  progresso: number;
  status: "não_iniciado" | "em_andamento" | "concluido";
  dataInicio?: string;
  dataConclusao?: string;
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
  "Conquistas",
  "Microcursos",
  "Explorar Microcursos",
  "Editar Perfil",
] as const;
type TabKey = (typeof TABS)[number];

export default function FuncionarioPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [funcionario, setFuncionario] = useState<FuncionarioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("Perfil");
  const [editForm, setEditForm] = useState({
    nome: "",
    email: "",
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  useEffect(() => {
    const fetchFuncionario = async () => {
      try {
        const data: FuncionarioData = {
          nome: "João Silva",
          email: "joao.silva@empresa.com",
          matricula: "12345",
          cargo: "Analista de Vendas",
          empresa: "Empresa XYZ Ltda",
          trilhas: [
            {
              id: "1",
              nome: "Técnicas de Vendas Avançadas",
              descricao: "Domine estratégias modernas de vendas consultivas",
              progresso: 65,
              status: "em_andamento",
              dataInicio: "2025-10-01",
            },
            {
              id: "2",
              nome: "Atendimento ao Cliente",
              descricao: "Aprenda a encantar seus clientes",
              progresso: 100,
              status: "concluido",
              dataInicio: "2025-09-01",
              dataConclusao: "2025-09-30",
            },
            {
              id: "3",
              nome: "Negociação Eficaz",
              descricao: "Técnicas de negociação win-win",
              progresso: 0,
              status: "não_iniciado",
            },
          ],
          conquistas: [
            {
              id: "c1",
              titulo: "Primeira Trilha Concluída",
              descricao: "Concluiu a primeira trilha de aprendizado.",
              data: "2025-09-30",
              icone: "🏅",
            },
            {
              id: "c2",
              titulo: "Meta Semanal",
              descricao: "Completou 3 microcursos em uma semana.",
              data: "2025-10-10",
              icone: "🔥",
            },
          ],
          microcursosConcluidos: [
            {
              id: "m1",
              titulo: "Argumentação de Valor",
              categoria: "Vendas",
              concluidoEm: "2025-09-12",
              certificadoUrl: "#",
            },
            {
              id: "m2",
              titulo: "Gestão do Tempo",
              categoria: "Produtividade",
              concluidoEm: "2025-09-20",
              certificadoUrl: "#",
            },
            {
              id: "m3",
              titulo: "Técnicas de Escuta Ativa",
              categoria: "Atendimento",
              concluidoEm: "2025-10-05",
            },
          ],
          microcursosDisponiveis: [
            {
              id: "md1",
              titulo: "Prospecção Digital",
              descricao:
                "Aprenda técnicas modernas de prospecção usando ferramentas digitais e redes sociais.",
              categoria: "Vendas",
              duracao: "45 min",
              nivel: "intermediario",
            },
            {
              id: "md2",
              titulo: "Comunicação Assertiva",
              descricao:
                "Desenvolva habilidades de comunicação clara e efetiva no ambiente corporativo.",
              categoria: "Soft Skills",
              duracao: "30 min",
              nivel: "iniciante",
            },
            {
              id: "md3",
              titulo: "Análise de Métricas de Vendas",
              descricao:
                "Entenda e utilize indicadores para melhorar seus resultados em vendas.",
              categoria: "Análise",
              duracao: "60 min",
              nivel: "avancado",
            },
            {
              id: "md4",
              titulo: "Inteligência Emocional",
              descricao:
                "Aprenda a gerenciar suas emoções e desenvolver empatia nas relações profissionais.",
              categoria: "Desenvolvimento Pessoal",
              duracao: "40 min",
              nivel: "iniciante",
            },
            {
              id: "md5",
              titulo: "Fechamento de Vendas",
              descricao:
                "Técnicas comprovadas para aumentar sua taxa de conversão e fechar mais negócios.",
              categoria: "Vendas",
              duracao: "50 min",
              nivel: "intermediario",
            },
            {
              id: "md6",
              titulo: "Gestão de Conflitos",
              descricao:
                "Estratégias para lidar com situações difíceis e resolver conflitos de forma construtiva.",
              categoria: "Liderança",
              duracao: "35 min",
              nivel: "intermediario",
            },
          ],
        };
        await new Promise((r) => setTimeout(r, 400));
        setFuncionario(data);
        setEditForm({
          nome: data.nome,
          email: data.email,
          senhaAtual: "",
          novaSenha: "",
          confirmarSenha: "",
        });
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFuncionario();
  }, [user]);

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
          nome: editForm.nome,
          email: editForm.email,
        });
      }
    } catch (e: any) {
      toast.error(e.message);
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
            {TABS.filter((t) => t !== "Editar Perfil").map((t) => (
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
                  onClick={() => setTab("Editar Perfil")}
                  className="text-xs text-neutral-400 hover:text-fuchsia-400 transition-colors flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Editar perfil
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

          {tab === "Editar Perfil" && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Editar Perfil
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={editForm.nome}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nome: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-fuchsia-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-fuchsia-600 transition"
                  />
                </div>

                <hr className="border-neutral-700 my-6" />

                <h3 className="text-lg font-semibold text-neutral-300">
                  Alterar Senha
                </h3>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Senha Atual
                  </label>
                  <input
                    type="password"
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
                  <input
                    type="password"
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
                  <input
                    type="password"
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
                    onClick={handleSaveProfile}
                    className="flex-1 bg-fuchsia-700 hover:bg-fuchsia-600 text-white"
                  >
                    Salvar Alterações
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
                      <p className="text-sm text-neutral-400 mb-5 line-clamp-3">
                        {t.descricao}
                      </p>
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
                      <Button
                        className="w-full mt-5 bg-fuchsia-700 hover:bg-fuchsia-600 text-white text-sm"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Conquistas" && (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                Conquistas
              </h2>
              {funcionario.conquistas.length === 0 ? (
                <Empty text="Nenhuma conquista ainda. Continue avançando!" />
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {funcionario.conquistas.map((c) => (
                    <div
                      key={c.id}
                      className="relative bg-neutral-900/70 border border-neutral-700 rounded-xl p-5 hover:border-fuchsia-700 transition"
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="h-12 w-12 rounded-xl bg-linear-to-br from-fuchsia-600/20 to-pink-500/20 border border-fuchsia-700/40 flex items-center justify-center text-2xl">
                          {c.icone || "🏆"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-white font-semibold truncate">
                            {c.titulo}
                          </h3>
                          <p className="text-xs text-neutral-500">
                            {new Date(c.data).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-400">{c.descricao}</p>
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
                      <div className="h-32 bg-gradient-to-br from-fuchsia-900/40 to-pink-900/40 flex items-center justify-center">
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
