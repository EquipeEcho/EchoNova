"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Headernaofix, Ondas } from "@/app/clientFuncs";

interface Modulo {
  _id: string;
  titulo: string;
  descricao: string;
  tipo: "video" | "podcast" | "texto" | "avaliacao" | "atividade_pratica";
  duracao: number; // em minutos
  url?: string;
  conteudo?: string;
  ordem: number;
}

interface TrilhaDetalhes {
  _id: string;
  nome: string;
  descricao: string;
  categoria: string;
  nivel: string;
  duracaoEstimada: number;
  objetivos: string[];
  areasAbordadas: string[];
  modulos: Modulo[];
  thumbnail?: string;
}

export default function TrilhaPage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore((s) => s.user);
  const [trilha, setTrilha] = useState<TrilhaDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [moduloExpandido, setModuloExpandido] = useState<string | null>(null);

  const trilhaId = params.id as string;

  useEffect(() => {
    const fetchTrilha = async () => {
      try {
        if (!user || user.tipo !== "funcionario") {
          toast.error("Acesso não autorizado");
          router.push("/");
          return;
        }

        const res = await fetch(`/api/trilhas/${trilhaId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Erro ao buscar trilha");
        }

        const data = await res.json();
        setTrilha(data);
      } catch (e: any) {
        console.error("Erro ao buscar trilha:", e);
        toast.error(e.message || "Erro ao carregar trilha");
        router.push("/pagina-funcionarios");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTrilha();
    }
  }, [user, trilhaId, router]);

  const handleConcluirTrilha = async () => {
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
      router.push("/pagina-funcionarios");
    } catch (e: any) {
      console.error("Erro ao concluir trilha:", e);
      toast.error(e.message || "Erro ao concluir trilha");
    }
  };

  const getTipoIcon = (tipo: Modulo["tipo"]) => {
    switch (tipo) {
      case "video":
        return "🎥";
      case "podcast":
        return "🎧";
      case "texto":
        return "📄";
      case "avaliacao":
        return "✅";
      case "atividade_pratica":
        return "🛠️";
      default:
        return "📌";
    }
  };

  const getTipoLabel = (tipo: Modulo["tipo"]) => {
    switch (tipo) {
      case "video":
        return "Vídeo";
      case "podcast":
        return "Podcast";
      case "texto":
        return "Leitura";
      case "avaliacao":
        return "Avaliação";
      case "atividade_pratica":
        return "Atividade Prática";
      default:
        return tipo;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-purple-950/20 to-neutral-950">
        <Headernaofix />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-white text-xl">Carregando trilha...</div>
        </div>
      </div>
    );
  }

  if (!trilha) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-purple-950/20 to-neutral-950 relative">
      <Headernaofix />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Header da Trilha */}
        <div className="mb-8">
          <Button
            variant="outline"
            className="mb-4 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={() => router.push("/pagina-funcionarios")}
          >
            ← Voltar
          </Button>

          <div className="bg-gradient-to-br from-neutral-900/90 to-purple-900/30 border border-purple-700/30 rounded-2xl p-8 backdrop-blur">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold border border-fuchsia-700/40 text-fuchsia-300 bg-fuchsia-900/20">
                {trilha.categoria}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold border border-cyan-700/40 text-cyan-300 bg-cyan-900/20">
                {trilha.nivel}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold border border-purple-700/40 text-purple-300 bg-purple-900/20">
                {trilha.duracaoEstimada}h
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">{trilha.nome}</h1>
            <p className="text-neutral-300 text-lg mb-6">{trilha.descricao}</p>

            {/* Objetivos */}
            {trilha.objetivos && trilha.objetivos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3 text-lg">
                  🎯 Objetivos de Aprendizagem
                </h3>
                <ul className="space-y-2">
                  {trilha.objetivos.map((obj, idx) => (
                    <li key={idx} className="text-neutral-300 flex items-start gap-2">
                      <span className="text-fuchsia-400 mt-1">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Áreas Abordadas */}
            {trilha.areasAbordadas && trilha.areasAbordadas.length > 0 && (
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3 text-lg">
                  📚 Áreas Abordadas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trilha.areasAbordadas.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm border border-purple-600/40 text-purple-200 bg-purple-900/20"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full md:w-auto bg-green-700 hover:bg-green-600 text-white font-semibold px-8 py-3"
              onClick={handleConcluirTrilha}
            >
              ✓ Concluir Trilha
            </Button>
          </div>
        </div>

        {/* Módulos */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-6">
            📖 Conteúdo da Trilha
          </h2>

          {trilha.modulos && trilha.modulos.length > 0 ? (
            trilha.modulos
              .sort((a, b) => a.ordem - b.ordem)
              .map((modulo, idx) => (
                <div
                  key={modulo._id}
                  className="bg-neutral-900/70 border border-gray-700/50 rounded-xl overflow-hidden hover:border-fuchsia-700/50 transition"
                >
                  {/* Header do Módulo */}
                  <button
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-neutral-800/50 transition"
                    onClick={() =>
                      setModuloExpandido(
                        moduloExpandido === modulo._id ? null : modulo._id
                      )
                    }
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-900/30 border border-fuchsia-700/40 text-fuchsia-300 font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{getTipoIcon(modulo.tipo)}</span>
                          <span className="text-xs px-2 py-1 rounded-full border border-gray-600 text-gray-300 bg-gray-800">
                            {getTipoLabel(modulo.tipo)}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {modulo.duracao} min
                          </span>
                        </div>
                        <h3 className="text-white font-semibold text-lg">
                          {modulo.titulo}
                        </h3>
                      </div>
                    </div>
                    <div className="text-neutral-400 text-2xl">
                      {moduloExpandido === modulo._id ? "−" : "+"}
                    </div>
                  </button>

                  {/* Conteúdo Expandido */}
                  {moduloExpandido === modulo._id && (
                    <div className="px-5 pb-5 border-t border-gray-700/50">
                      <div className="pt-4">
                        <p className="text-neutral-300 mb-4">{modulo.descricao}</p>

                        {/* URL do Conteúdo */}
                        {modulo.url && (
                          <div className="mb-4">
                            <a
                              href={modulo.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white rounded-lg transition"
                            >
                              {modulo.tipo === "video" && "▶️ Assistir Vídeo"}
                              {modulo.tipo === "podcast" && "🎧 Ouvir Podcast"}
                              {modulo.tipo === "texto" && "📄 Ler Conteúdo"}
                              {modulo.tipo === "avaliacao" && "✅ Fazer Avaliação"}
                              {modulo.tipo === "atividade_pratica" && "🛠️ Fazer Atividade"}
                            </a>
                          </div>
                        )}

                        {/* Conteúdo em Texto */}
                        {modulo.conteudo && (
                          <div className="bg-neutral-950/50 rounded-lg p-4 border border-gray-800">
                            <div className="text-neutral-300 whitespace-pre-wrap">
                              {modulo.conteudo}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
          ) : (
            <div className="text-center py-12 text-neutral-400">
              Nenhum módulo disponível nesta trilha.
            </div>
          )}
        </div>

        {/* Botão Concluir no Final */}
        <div className="mt-12 flex justify-center">
          <Button
            className="bg-green-700 hover:bg-green-600 text-white font-semibold px-12 py-4 text-lg"
            onClick={handleConcluirTrilha}
          >
            ✓ Concluir Trilha Completa
          </Button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 pointer-events-none opacity-20 z-0">
        <Ondas />
      </div>
    </div>
  );
}
