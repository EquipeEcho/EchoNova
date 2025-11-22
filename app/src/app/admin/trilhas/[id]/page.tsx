"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import Link from "next/link";

interface Modulo {
  titulo: string;
  descricao: string;
  tipo: "video" | "podcast" | "texto" | "avaliacao" | "atividade_pratica";
  duracao: number;
  url: string;
  conteudo: string;
  ordem: number;
}

interface Trilha {
  _id: string;
  nome: string;
  descricao: string;
  tags: string[];
  areasAbordadas: string[];
  objetivos: string[];
  duracaoEstimada: number;
  nivel: "Iniciante" | "Intermediário" | "Avançado";
  categoria: "Comunicação" | "Gestão de Tempo" | "Inovação" | "Liderança" | "Diversidade";
  modulos: Modulo[];
  status: "ativa" | "inativa" | "rascunho";
  metadados?: {
    problemasRelacionados?: string[];
    competenciasDesenvolvidas?: string[];
    resultadosEsperados?: string[];
  };
}

export default function EditarTrilhaPage() {
  const router = useRouter();
  const params = useParams();
  const trilhaId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tags, setTags] = useState("");
  const [areasAbordadas, setAreasAbordadas] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [duracaoEstimada, setDuracaoEstimada] = useState("");
  const [nivel, setNivel] = useState<"Iniciante" | "Intermediário" | "Avançado">("Iniciante");
  const [categoria, setCategoria] = useState<"Comunicação" | "Gestão de Tempo" | "Inovação" | "Liderança" | "Diversidade">("Comunicação");
  const [status, setStatus] = useState<"ativa" | "inativa" | "rascunho">("rascunho");
  const [modulos, setModulos] = useState<Modulo[]>([]);

  // Metadados
  const [problemasRelacionados, setProblemasRelacionados] = useState("");
  const [competenciasDesenvolvidas, setCompetenciasDesenvolvidas] = useState("");
  const [resultadosEsperados, setResultadosEsperados] = useState("");

  useEffect(() => {
    loadTrilha();
  }, [trilhaId]);

  const loadTrilha = async () => {
    try {
      setLoadingData(true);
      const res = await fetch(`/api/trilhas/${trilhaId}`, {
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        const trilha: Trilha = data;

        // Preencher os campos do formulário
        setNome(trilha.nome);
        setDescricao(trilha.descricao);
        setTags(trilha.tags.join(", "));
        setAreasAbordadas(trilha.areasAbordadas.join(", "));
        setObjetivos(trilha.objetivos.join("\n"));
        setDuracaoEstimada(trilha.duracaoEstimada.toString());
        setNivel(trilha.nivel);
        setCategoria(trilha.categoria);
        setStatus(trilha.status);
        setModulos(trilha.modulos);

        // Metadados
        if (trilha.metadados) {
          setProblemasRelacionados(trilha.metadados.problemasRelacionados?.join(", ") || "");
          setCompetenciasDesenvolvidas(trilha.metadados.competenciasDesenvolvidas?.join(", ") || "");
          setResultadosEsperados(trilha.metadados.resultadosEsperados?.join("\n") || "");
        }
      } else {
        toast.error(data.error || "Erro ao carregar trilha");
        router.push("/admin/trilhas");
      }
    } catch (error) {
      console.error("Erro ao carregar trilha:", error);
      toast.error("Erro ao carregar trilha");
      router.push("/admin/trilhas");
    } finally {
      setLoadingData(false);
    }
  };

  const addModulo = () => {
    const novoModulo: Modulo = {
      titulo: "",
      descricao: "",
      tipo: "video",
      duracao: 0,
      url: "",
      conteudo: "",
      ordem: modulos.length + 1,
    };
    setModulos([...modulos, novoModulo]);
  };

  const removeModulo = (index: number) => {
    const novosModulos = modulos.filter((_, i) => i !== index);
    // Reordenar
    const reordenados = novosModulos.map((m, i) => ({ ...m, ordem: i + 1 }));
    setModulos(reordenados);
  };

  const updateModulo = (index: number, field: keyof Modulo, value: any) => {
    const novosModulos = [...modulos];
    novosModulos[index] = { ...novosModulos[index], [field]: value };
    setModulos(novosModulos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!nome || !descricao || !tags || !areasAbordadas) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const trilhaData = {
        nome,
        descricao,
        tags: tags.split(",").map((t) => t.trim()),
        areasAbordadas: areasAbordadas.split(",").map((a) => a.trim()),
        objetivos: objetivos.split("\n").filter((o) => o.trim()),
        duracaoEstimada: Number(duracaoEstimada) || 0,
        nivel,
        categoria,
        status,
        modulos,
        metadados: {
          problemasRelacionados: problemasRelacionados.split(",").map((p) => p.trim()),
          competenciasDesenvolvidas: competenciasDesenvolvidas.split(",").map((c) => c.trim()),
          resultadosEsperados: resultadosEsperados.split("\n").filter((r) => r.trim()),
        },
      };

      const res = await fetch(`/api/trilhas/${trilhaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(trilhaData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Trilha atualizada com sucesso!");
        router.push("/admin/trilhas");
      } else {
        toast.error(data.error || "Erro ao atualizar trilha");
      }
    } catch (error) {
      console.error("Erro ao atualizar trilha:", error);
      toast.error("Erro ao atualizar trilha");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center text-white py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Carregando trilha...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 pt-16 pb-10 max-w-6xl">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-pink-500/30 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10 -mx-4 px-4">
          <div className="flex items-start gap-4">
            <Link href="/admin/trilhas">
              <Button variant="outline" size="icon" className="bg-pink-500 border-pink-500 text-white hover:bg-pink-600">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400 tracking-tight">
                Editar Trilha
              </h1>
              <p className="text-slate-400 mt-2 text-sm max-w-xl leading-relaxed">
                Edite as informações da trilha selecionada
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
          {/* Informações Básicas */}
          <Card className="bg-slate-800/60 border border-slate-700/60 backdrop-blur rounded-lg shadow-md">
            <CardHeader>
              <CardTitle className="text-white">Informações Básicas</CardTitle>
              <CardDescription className="text-slate-400">
                Dados gerais sobre a trilha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome" className="text-white mb-2">
                  Nome da Trilha *
                </Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Liderança Transformadora"
                  className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao" className="text-white mb-2">
                  Descrição *
                </Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva os principais objetivos e benefícios da trilha..."
                  rows={4}
                  className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nivel" className="text-white mb-2">
                    Nível
                  </Label>
                  <Select value={nivel} onValueChange={(v: any) => setNivel(v)}>
                    <SelectTrigger className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Iniciante">Iniciante</SelectItem>
                      <SelectItem value="Intermediário">Intermediário</SelectItem>
                      <SelectItem value="Avançado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="categoria" className="text-white mb-2">
                    Categoria *
                  </Label>
                  <Select value={categoria} onValueChange={(v: any) => setCategoria(v)}>
                    <SelectTrigger className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comunicação">Comunicação</SelectItem>
                      <SelectItem value="Gestão de Tempo">Gestão de Tempo</SelectItem>
                      <SelectItem value="Inovação">Inovação</SelectItem>
                      <SelectItem value="Liderança">Liderança</SelectItem>
                      <SelectItem value="Diversidade">Diversidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status" className="text-white mb-2">
                    Status
                  </Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativa">Ativa</SelectItem>
                      <SelectItem value="inativa">Inativa</SelectItem>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="duracaoEstimada" className="text-white mb-2">
                  Duração Estimada (horas)
                </Label>
                <NumberInput
                  id="duracaoEstimada"
                  value={duracaoEstimada}
                  onChange={(e) => setDuracaoEstimada(e.target.value)}
                  placeholder="Ex: 20"
                  className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                />
              </div>

              <div>
                <Label htmlFor="tags" className="text-white mb-2">
                  Tags (separadas por vírgula) *
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="liderança, gestão, comunicação"
                  className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Tags são usadas pela IA para matching semântico
                </p>
              </div>

              <div>
                <Label htmlFor="areasAbordadas" className="text-white mb-2">
                  Áreas Abordadas (separadas por vírgula) *
                </Label>
                <Input
                  id="areasAbordadas"
                  value={areasAbordadas}
                  onChange={(e) => setAreasAbordadas(e.target.value)}
                  placeholder="Liderança, Gestão de Pessoas, Comunicação"
                  className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                  required
                />
              </div>

              <div>
                <Label htmlFor="objetivos" className="text-white mb-2">
                  Objetivos de Aprendizagem (um por linha)
                </Label>
                <Textarea
                  id="objetivos"
                  value={objetivos}
                  onChange={(e) => setObjetivos(e.target.value)}
                  placeholder="Desenvolver habilidades de comunicação&#10;Aprender técnicas de gestão de conflitos"
                  rows={4}
                  className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Metadados para IA */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Metadados para IA</CardTitle>
              <CardDescription className="text-gray-300">
                Informações usadas pela IA para recomendar esta trilha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="problemasRelacionados" className="text-white mb-2">
                  Problemas Relacionados (separados por vírgula)
                </Label>
                <Input
                  id="problemasRelacionados"
                  value={problemasRelacionados}
                  onChange={(e) => setProblemasRelacionados(e.target.value)}
                  placeholder="baixa-produtividade, falta-de-liderança, comunicação-ineficaz"
                  className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Keywords de problemas que esta trilha ajuda a resolver
                </p>
              </div>

              <div>
                <Label htmlFor="competenciasDesenvolvidas" className="text-white mb-2">
                  Competências Desenvolvidas (separadas por vírgula)
                </Label>
                <Input
                  id="competenciasDesenvolvidas"
                  value={competenciasDesenvolvidas}
                  onChange={(e) => setCompetenciasDesenvolvidas(e.target.value)}
                  placeholder="Liderança, Comunicação, Gestão de Conflitos"
                  className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                />
              </div>

              <div>
                <Label htmlFor="resultadosEsperados" className="text-white mb-2">
                  Resultados Esperados (um por linha)
                </Label>
                <Textarea
                  id="resultadosEsperados"
                  value={resultadosEsperados}
                  onChange={(e) => setResultadosEsperados(e.target.value)}
                  placeholder="Melhoria na comunicação interna&#10;Redução de conflitos"
                  rows={3}
                  className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Módulos */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Módulos da Trilha</CardTitle>
                  <CardDescription className="text-gray-300">
                    Conteúdos que compõem a trilha
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={addModulo}
                  variant="outline"
                  className="border-purple-500/60 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Módulo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {modulos.length === 0 ? (
                <p className="text-gray-400 text-center py-4">
                  Nenhum módulo adicionado ainda
                </p>
              ) : (
                modulos.map((modulo, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/50 p-4 rounded-lg space-y-3 border border-slate-600"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-fuchsia-500 text-fuchsia-400">
                        Módulo {modulo.ordem}
                      </Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeModulo(index)}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white text-sm mb-2">Título</Label>
                        <Input
                          value={modulo.titulo}
                          onChange={(e) => updateModulo(index, "titulo", e.target.value)}
                          placeholder="Nome do módulo"
                          className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm mb-2">Tipo</Label>
                        <Select
                          value={modulo.tipo}
                          onValueChange={(v) => updateModulo(index, "tipo", v)}
                        >
                          <SelectTrigger className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="video">Vídeo</SelectItem>
                            <SelectItem value="podcast">Podcast</SelectItem>
                            <SelectItem value="texto">Texto</SelectItem>
                            <SelectItem value="avaliacao">Avaliação</SelectItem>
                            <SelectItem value="atividade_pratica">Atividade Prática</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white text-sm mb-2">Descrição</Label>
                      <Textarea
                        value={modulo.descricao}
                        onChange={(e) => updateModulo(index, "descricao", e.target.value)}
                        placeholder="Descreva o conteúdo do módulo"
                        rows={2}
                        className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white text-sm mb-2">Duração (minutos)</Label>
                        <NumberInput
                          value={modulo.duracao}
                          onChange={(e) =>
                            updateModulo(index, "duracao", Number(e.target.value))
                          }
                          placeholder="45"
                          className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm mb-2">URL (opcional)</Label>
                        <Input
                          value={modulo.url}
                          onChange={(e) => updateModulo(index, "url", e.target.value)}
                          placeholder="https://..."
                          className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/trilhas")}
              className="border-purple-500/60 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-colors"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/30 transition-colors"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}