"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NovaTrilhaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tags, setTags] = useState("");
  const [areasAbordadas, setAreasAbordadas] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [duracaoEstimada, setDuracaoEstimada] = useState("");
  const [nivel, setNivel] = useState<"Iniciante" | "Intermediário" | "Avançado">("Iniciante");
  const [status, setStatus] = useState<"ativa" | "inativa" | "rascunho">("rascunho");
  const [modulos, setModulos] = useState<Modulo[]>([]);

  // Metadados
  const [problemasRelacionados, setProblemasRelacionados] = useState("");
  const [competenciasDesenvolvidas, setCompetenciasDesenvolvidas] = useState("");
  const [resultadosEsperados, setResultadosEsperados] = useState("");

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
        status,
        modulos,
        metadados: {
          problemasRelacionados: problemasRelacionados.split(",").map((p) => p.trim()),
          competenciasDesenvolvidas: competenciasDesenvolvidas.split(",").map((c) => c.trim()),
          resultadosEsperados: resultadosEsperados.split("\n").filter((r) => r.trim()),
        },
      };

      const res = await fetch("/api/trilhas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trilhaData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Trilha criada com sucesso!");
        router.push("/admin/trilhas");
      } else {
        toast.error(data.error || "Erro ao criar trilha");
      }
    } catch (error) {
      console.error("Erro ao criar trilha:", error);
      toast.error("Erro ao criar trilha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/trilhas">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Nova Trilha</h1>
            <p className="text-gray-300">Crie uma nova trilha de aprendizagem</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Informações Básicas</CardTitle>
              <CardDescription className="text-gray-300">
                Dados gerais sobre a trilha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome" className="text-white">
                  Nome da Trilha *
                </Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Liderança Transformadora"
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao" className="text-white">
                  Descrição *
                </Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva os principais objetivos e benefícios da trilha..."
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nivel" className="text-white">
                    Nível
                  </Label>
                  <Select value={nivel} onValueChange={(v: any) => setNivel(v)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
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
                  <Label htmlFor="status" className="text-white">
                    Status
                  </Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
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
                <Label htmlFor="duracaoEstimada" className="text-white">
                  Duração Estimada (horas)
                </Label>
                <NumberInput
                  id="duracaoEstimada"
                  value={duracaoEstimada}
                  onChange={(e) => setDuracaoEstimada(e.target.value)}
                  placeholder="Ex: 20"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="tags" className="text-white">
                  Tags (separadas por vírgula) *
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="liderança, gestão, comunicação"
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Tags são usadas pela IA para matching semântico
                </p>
              </div>

              <div>
                <Label htmlFor="areasAbordadas" className="text-white">
                  Áreas Abordadas (separadas por vírgula) *
                </Label>
                <Input
                  id="areasAbordadas"
                  value={areasAbordadas}
                  onChange={(e) => setAreasAbordadas(e.target.value)}
                  placeholder="Liderança, Gestão de Pessoas, Comunicação"
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="objetivos" className="text-white">
                  Objetivos de Aprendizagem (um por linha)
                </Label>
                <Textarea
                  id="objetivos"
                  value={objetivos}
                  onChange={(e) => setObjetivos(e.target.value)}
                  placeholder="Desenvolver habilidades de comunicação&#10;Aprender técnicas de gestão de conflitos"
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white"
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
                <Label htmlFor="problemasRelacionados" className="text-white">
                  Problemas Relacionados (separados por vírgula)
                </Label>
                <Input
                  id="problemasRelacionados"
                  value={problemasRelacionados}
                  onChange={(e) => setProblemasRelacionados(e.target.value)}
                  placeholder="baixa-produtividade, falta-de-liderança, comunicação-ineficaz"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Keywords de problemas que esta trilha ajuda a resolver
                </p>
              </div>

              <div>
                <Label htmlFor="competenciasDesenvolvidas" className="text-white">
                  Competências Desenvolvidas (separadas por vírgula)
                </Label>
                <Input
                  id="competenciasDesenvolvidas"
                  value={competenciasDesenvolvidas}
                  onChange={(e) => setCompetenciasDesenvolvidas(e.target.value)}
                  placeholder="Liderança, Comunicação, Gestão de Conflitos"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="resultadosEsperados" className="text-white">
                  Resultados Esperados (um por linha)
                </Label>
                <Textarea
                  id="resultadosEsperados"
                  value={resultadosEsperados}
                  onChange={(e) => setResultadosEsperados(e.target.value)}
                  placeholder="Melhoria na comunicação interna&#10;Redução de conflitos"
                  rows={3}
                  className="bg-slate-700 border-slate-600 text-white"
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
                  className="border-fuchsia-500 text-fuchsia-500 hover:bg-fuchsia-500/10"
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
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white text-sm">Título</Label>
                        <Input
                          value={modulo.titulo}
                          onChange={(e) => updateModulo(index, "titulo", e.target.value)}
                          placeholder="Nome do módulo"
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Tipo</Label>
                        <Select
                          value={modulo.tipo}
                          onValueChange={(v) => updateModulo(index, "tipo", v)}
                        >
                          <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
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
                      <Label className="text-white text-sm">Descrição</Label>
                      <Textarea
                        value={modulo.descricao}
                        onChange={(e) => updateModulo(index, "descricao", e.target.value)}
                        placeholder="Descreva o conteúdo do módulo"
                        rows={2}
                        className="bg-slate-600 border-slate-500 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white text-sm">Duração (minutos)</Label>
                        <NumberInput
                          value={modulo.duracao}
                          onChange={(e) =>
                            updateModulo(index, "duracao", Number(e.target.value))
                          }
                          placeholder="45"
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">URL (opcional)</Label>
                        <Input
                          value={modulo.url}
                          onChange={(e) => updateModulo(index, "url", e.target.value)}
                          placeholder="https://..."
                          className="bg-slate-600 border-slate-500 text-white"
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
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Salvando..." : "Salvar Trilha"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
