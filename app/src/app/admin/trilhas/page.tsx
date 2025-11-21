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

    return matchesSearch && matchesStatus && matchesNivel;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa":
        return "bg-green-500";
      case "inativa":
        return "bg-red-500";
      case "rascunho":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "Iniciante":
        return "bg-blue-500";
      case "Intermediário":
        return "bg-purple-500";
      case "Avançado":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-pink-500/30 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10 -mx-4 px-4">
          <div className="flex items-start gap-4">
            <Link href="/admin" className="self-start">
              <Button variant="outline" size="icon" className="border-pink-500/40 text-pink-400 hover:bg-pink-500/10 hover:text-white">
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
              onClick={handleSeedTrilhas}
              variant="outline"
              className="border-pink-500 text-pink-400 hover:bg-pink-500/10 hover:text-white transition-colors"
            >
              Popular Trilhas Mock
            </Button>
            <Button
              onClick={() => router.push("/admin/trilhas/nova")}
              className="bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Trilha
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-8 bg-slate-800/60 border border-slate-700/60 backdrop-blur rounded-lg shadow-md">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-700"
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
                        <Badge className={`${getStatusColor(trilha.status)} text-white`}>
                          {trilha.status}
                        </Badge>
                        <Badge className={`${getNivelColor(trilha.nivel)} text-white`}>
                          {trilha.nivel}
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
                          <Badge key={idx} variant="outline" className="text-xs border-pink-500/30 text-pink-300/90 bg-pink-500/5">
                            {tag}
                          </Badge>
                        ))}
                        {trilha.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs border-slate-600 text-gray-300">
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
                        className="flex-1 border-pink-500 text-pink-400 hover:bg-pink-500/10 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/trilhas/${trilha._id}`);
                        }}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-500 hover:bg-red-600/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTrilha(trilha);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
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
                  <Badge className={`${getStatusColor(selectedTrilha.status)} text-white`}>
                    {selectedTrilha.status}
                  </Badge>
                  <Badge className={`${getNivelColor(selectedTrilha.nivel)} text-white`}>
                    {selectedTrilha.nivel}
                  </Badge>
                  <Badge variant="outline" className="border-slate-600 text-gray-300">
                    {selectedTrilha.duracaoEstimada}h
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-pink-300">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrilha.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="border-pink-500/40 text-pink-300 bg-pink-500/5">
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
                          <Badge variant="outline" className="border-pink-500/30 text-xs text-pink-300">
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
                className="border-pink-500/40 text-pink-300 hover:bg-pink-500/10 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30"
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
