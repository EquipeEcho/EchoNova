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

interface FuncionarioData {
  nome: string;
  email: string;
  matricula: string;
  cargo: string;
  empresa: string;
  trilhas: Trilha[];
  conquistas: Conquista[];
  microcursosConcluidos: Microcurso[];
}

const TABS = ["Perfil", "Trilhas", "Conquistas", "Microcursos"] as const;
type TabKey = (typeof TABS)[number];

export default function FuncionarioPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [funcionario, setFuncionario] = useState<FuncionarioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("Perfil");

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
        };
        await new Promise((r) => setTimeout(r, 400));
        setFuncionario(data);
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
            {TABS.map((t) => (
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
              <h1 className="text-3xl font-bold bg-linear-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                {funcionario.nome}
              </h1>
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="Matrícula" value={funcionario.matricula} />
                <Info label="Cargo" value={funcionario.cargo} />
                <Info label="Email" value={funcionario.email} />
                <Info label="Empresa" value={funcionario.empresa} />
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
