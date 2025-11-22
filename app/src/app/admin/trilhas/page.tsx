"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Modulo {
  titulo: string;
  descricao: string;
  tipo: "video" | "podcast" | "texto" | "avaliacao" | "atividade_pratica";
  duracao: number;
  url?: string;
  conteudo?: string;
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
  thumbnail?: string;
  metadados: {
    problemasRelacionados: string[];
    competenciasDesenvolvidas: string[];
    resultadosEsperados: string[];
  };
  estatisticas: {
    totalAtribuicoes: number;
    totalConclusoes: number;
    avaliacaoMedia: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminTrilhasPage() {
  const router = useRouter();
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todas");
  const [filterNivel, setFilterNivel] = useState<string>("todos");
  const [filterCategoria, setFilterCategoria] = useState<string>("todas");
  const [selectedTrilha, setSelectedTrilha] = useState<Trilha | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    loadTrilhas();
  }, []);

  const loadTrilhas = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/trilhas", {
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok) {
        setTrilhas(data.trilhas);
      } else {
        toast.error(data.error || "Erro ao carregar trilhas");
      }
    } catch (error) {
      console.error("Erro ao carregar trilhas:", error);
      toast.error("Erro ao carregar trilhas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTrilha) return;

    try {
      const res = await fetch(`/api/trilhas/${selectedTrilha._id}`, {
        method: "DELETE",
        credentials: 'include'
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Trilha deletada com sucesso");
        loadTrilhas();
        setIsDeleteDialogOpen(false);
        setSelectedTrilha(null);
      } else {
        toast.error(data.error || "Erro ao deletar trilha");
      }
    } catch (error) {
      console.error("Erro ao deletar trilha:", error);
      toast.error("Erro ao deletar trilha");
    }
  };

  const handleSeedTrilhas = async () => {
    try {
      toast.loading("Populando trilhas...");
      const res = await fetch("/api/trilhas/seed", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ force: true })
      });
      const data = await res.json();

      toast.dismiss();
      if (res.ok) {
        toast.success(data.message);
        loadTrilhas();
      } else {
        toast.error(data.error || "Erro ao popular trilhas");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Erro ao popular trilhas:", error);
      toast.error("Erro ao popular trilhas");
    }
  };

  const filteredTrilhas = trilhas.filter((trilha) => {
    const matchesSearch =
      trilha.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trilha.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trilha.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === "todas" || trilha.status === filterStatus;
    const matchesNivel = filterNivel === "todos" || trilha.nivel === filterNivel;
    const matchesCategoria = filterCategoria === "todas" || trilha.categoria === filterCategoria;

    return matchesSearch && matchesStatus && matchesNivel && matchesCategoria;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa":
        return "border border-green-300 text-green-300 bg-green-500/10 hover:bg-green-500/20 transition-colors";
      case "inativa":
        return "bg-red-500";
      case "rascunho":
        return "bg-amber-400";
      default:
        return "bg-slate-500";
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    return status === 'ativa' ? 'outline' : 'default';
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "Iniciante":
        return "border border-sky-400 text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 transition-colors";
      case "Intermediário":
        return "border border-yellow-400 text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors";
      case "Avançado":
        return "border border-orange-400 text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 transition-colors";
      default:
        return "bg-slate-500";
    }
  };

  const getNivelVariant = (nivel: string): "default" | "secondary" | "destructive" | "outline" => {
    return 'outline';
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "Comunicação":
        return "border border-cyan-400 text-white bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors";
      case "Gestão de Tempo":
        return "border border-emerald-400 text-white bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors";
      case "Inovação":
        return "border border-rose-400 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 transition-colors";
      case "Liderança":
        return "border border-yellow-400 text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors";
      case "Diversidade":
        return "border border-violet-400 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 transition-colors";
      default:
        return "border border-slate-400 text-slate-300 bg-slate-500/10 hover:bg-slate-500/20 transition-colors";
    }
  };

  const getCategoriaVariant = (categoria: string): "default" | "secondary" | "destructive" | "outline" => {
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-pink-500/30 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10 -mx-4 px-4">
          <div className="flex items-start gap-4">
            <Link href="/admin" className="self-start">
            <Button variant="outline" size="icon" className="bg-pink-500 border-pink-500 text-white hover:bg-pink-600">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400 tracking-tight">
                Gerenciar Trilhas
              </h1>
              <p className="text-slate-400 mt-2 text-sm max-w-xl leading-relaxed">
                Cadastre, edite e organize trilhas de aprendizagem com foco nas cores padrão e identidade visual do painel.
              </p>
            </div>
          </div>
          <div className="flex gap-3 self-start">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSeedTrilhas}
              className="bg-slate-800 border-slate-800 text-pink-300 hover:bg-slate-700 hover:text-pink-400"
            >
              <Pencil className="h-3 w-3 mr-1 text-pink-400" />
              Popular Trilhas (dev)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push("/admin/trilhas/nova")}
              className="bg-slate-800 border-slate-800 text-pink-300 hover:bg-slate-700 hover:text-pink-400"
            >
              <Plus className="h-3 w-3 mr-1 text-pink-400" />
              Nova Trilha
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-8 bg-slate-800/60 border border-slate-700/60 backdrop-blur rounded-lg shadow-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar trilhas por nome, descrição ou tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
                  />
                </div>
              </div>
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todos os Status</SelectItem>
                    <SelectItem value="ativa">Ativa</SelectItem>
                    <SelectItem value="inativa">Inativa</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterNivel} onValueChange={setFilterNivel}>
                  <SelectTrigger className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500">
                    <SelectValue placeholder="Nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Níveis</SelectItem>
                    <SelectItem value="Iniciante">Iniciante</SelectItem>
                    <SelectItem value="Intermediário">Intermediário</SelectItem>
                    <SelectItem value="Avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                  <SelectTrigger className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Categorias</SelectItem>
                    <SelectItem value="Comunicação">Comunicação</SelectItem>
                    <SelectItem value="Gestão de Tempo">Gestão de Tempo</SelectItem>
                    <SelectItem value="Inovação">Inovação</SelectItem>
                    <SelectItem value="Liderança">Liderança</SelectItem>
                    <SelectItem value="Diversidade">Diversidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Trilhas */}
        {loading ? (
          <div className="text-center text-white py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4">Carregando trilhas...</p>
          </div>
        ) : filteredTrilhas.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">Nenhuma trilha encontrada.</p>
              <Button
                onClick={() => router.push("/admin/trilhas/nova")}
                className="mt-4 bg-pink-600 hover:bg-pink-700 text-white"
              >
                Criar Primeira Trilha
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrilhas.map((trilha) => (
              <Card
                key={trilha._id}
                className="bg-slate-800/60 border border-slate-700/60 hover:border-pink-500/70 transition-colors cursor-pointer group overflow-hidden"
                onClick={() => {
                  setSelectedTrilha(trilha);
                  setIsViewDialogOpen(true);
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2 group-hover:text-pink-400 transition-colors">{trilha.nome}</CardTitle>
                      <div className="flex gap-2 mb-2">
                        <Badge variant={getStatusVariant(trilha.status)} className={getStatusColor(trilha.status)}>
                          {trilha.status}
                        </Badge>
                        <Badge variant={getNivelVariant(trilha.nivel)} className={getNivelColor(trilha.nivel)}>
                          {trilha.nivel}
                        </Badge>
                        <Badge variant={getCategoriaVariant(trilha.categoria)} className={getCategoriaColor(trilha.categoria)}>
                          {trilha.categoria}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-slate-400 line-clamp-2">
                    {trilha.descricao}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-400">
                      <Tag className="h-4 w-4 mr-2" />
                      <div className="flex flex-wrap gap-1">
                        {trilha.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs border-pink-400 text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 transition-colors">
                            {tag}
                          </Badge>
                        ))}
                        {trilha.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs border-slate-500 text-slate-300 bg-slate-500/10">
                            +{trilha.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{trilha.modulos.length} módulos</span>
                      <span>{trilha.duracaoEstimada}h</span>
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-slate-800 border-slate-800 text-pink-300 hover:bg-slate-700 hover:text-pink-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/trilhas/${trilha._id}`);
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1 text-pink-400" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-slate-800 border-slate-800 text-red-400 hover:bg-slate-700 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrilha(trilha);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-400 hover:text-red-300" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de Visualização */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-slate-900/95 border border-pink-500/30 text-white max-w-3xl max-h-[80vh] overflow-y-auto backdrop-blur">
            <DialogHeader>
              <DialogTitle className="text-2xl text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400">{selectedTrilha?.nome}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedTrilha?.descricao}
              </DialogDescription>
            </DialogHeader>
            {selectedTrilha && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant={getStatusVariant(selectedTrilha.status)} className={getStatusColor(selectedTrilha.status)}>
                    {selectedTrilha.status}
                  </Badge>
                  <Badge variant={getNivelVariant(selectedTrilha.nivel)} className={getNivelColor(selectedTrilha.nivel)}>
                    {selectedTrilha.nivel}
                  </Badge>
                  <Badge variant={getCategoriaVariant(selectedTrilha.categoria)} className={getCategoriaColor(selectedTrilha.categoria)}>
                    {selectedTrilha.categoria}
                  </Badge>
                  <Badge variant="outline" className="border-slate-500 text-slate-300 bg-slate-500/10">
                    {selectedTrilha.duracaoEstimada}h
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-pink-300">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrilha.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="border-pink-400 text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Objetivos:</h4>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {selectedTrilha.objetivos.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Módulos ({selectedTrilha.modulos.length}):</h4>
                  <div className="space-y-2">
                    {selectedTrilha.modulos.map((modulo, idx) => (
                      <div key={idx} className="bg-slate-800/60 p-3 rounded border border-slate-700/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-pink-300">{modulo.titulo}</p>
                            <p className="text-sm text-slate-400">{modulo.descricao}</p>
                          </div>
                          <Badge variant="outline" className="border-pink-400 text-xs text-pink-300 bg-pink-500/10">
                            {modulo.tipo}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-pink-300">Estatísticas:</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-800/60 p-3 rounded border border-slate-700/50">
                      <p className="text-2xl font-bold text-pink-400">
                        {selectedTrilha.estatisticas.totalAtribuicoes}
                      </p>
                      <p className="text-xs text-slate-500">Atribuições</p>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded border border-slate-700/50">
                      <p className="text-2xl font-bold text-green-400">
                        {selectedTrilha.estatisticas.totalConclusoes}
                      </p>
                      <p className="text-xs text-slate-500">Conclusões</p>
                    </div>
                    <div className="bg-slate-800/60 p-3 rounded border border-slate-700/50">
                      <p className="text-2xl font-bold text-yellow-400">
                        {selectedTrilha.estatisticas.avaliacaoMedia.toFixed(1)}
                      </p>
                      <p className="text-xs text-slate-500">Avaliação</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-slate-900/95 border border-pink-500/30 text-white backdrop-blur">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription className="text-slate-400">
                Tem certeza que deseja excluir a trilha "{selectedTrilha?.nome}"? Esta ação não pode
                ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="bg-pink-500 border-pink-500 text-white hover:bg-pink-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
