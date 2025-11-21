"use client";

import { useState, useEffect, useCallback, type FC } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipagem para os dados que vamos manipular
interface Empresa {
  _id: string;
  nome_empresa: string;
  email: string;
  cnpj: string;
  planoAtivo?: string;
  tipo_usuario?: string;
  senha?: string;
  createdAt?: string; // timestamp automático do Mongoose (timestamps: true)
  data_cadastro?: string; // campo explícito no schema
}

interface Diagnostico {
  _id: string;
  empresa: {
    _id: string;
    nome_empresa: string;
    email: string;
    cnpj: string;
  };
  perfil: {
    empresa: string;
  };
  dimensoesSelecionadas: string[];
  status: string;
  createdAt: string;
}

/**
 * @description Componente de formulário para criar ou editar uma empresa.
 * É renderizado dentro de um modal (Dialog) com um tema escuro forçado para legibilidade.
 * @param empresa A empresa que está sendo editada, ou null se for uma nova empresa.
 * @param onSave Callback para salvar os dados.
 * @param onCancel Callback para fechar o modal.
 */
const EmpresaForm: FC<{
  empresa: Partial<Empresa> | null;
  onSave: (empresa: Partial<Empresa>) => void;
  onCancel: () => void;
}> = ({ empresa, onSave, onCancel }) => {
  const [formData, setFormData] = useState(empresa || {});
  const isAdmin = empresa?.tipo_usuario === 'ADMIN';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isAdmin && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
          <p className="text-yellow-300 text-sm font-medium">⚠️ Conta de Administrador</p>
          <p className="text-yellow-400 text-xs mt-1">
            Esta é a conta de administrador do sistema. Você pode alterar email e senha, mas o CNPJ e tipo de usuário são protegidos.
          </p>
        </div>
      )}
      <div>
        <Label htmlFor="nome_empresa" className="text-pink-300">Nome da Empresa</Label>
        <Input
          id="nome_empresa"
          name="nome_empresa"
          value={formData.nome_empresa || ""}
          onChange={handleChange}
          required
          className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
        />
      </div>
      <div>
        <Label htmlFor="email" className="text-pink-300">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          required
          className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
        />
      </div>
      <div>
        <Label htmlFor="cnpj" className="text-pink-300">CNPJ</Label>
        <Input
          id="cnpj"
          name="cnpj"
          value={formData.cnpj || ""}
          onChange={handleChange}
          required
          disabled={isAdmin}
          className={`bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30 ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        {isAdmin && <p className="text-xs text-yellow-400 mt-1">CNPJ do administrador não pode ser alterado</p>}
      </div>
      <div>
        <Label htmlFor="planoAtivo" className="text-pink-300">Plano Ativo</Label>
        <Select
          value={formData.planoAtivo || ""}
          onValueChange={(val) => setFormData((prev) => ({ ...prev, planoAtivo: val }))}
        >
          <SelectTrigger id="planoAtivo" className="mt-1 bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500">
            <SelectValue placeholder="Selecione o plano" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border border-pink-500/30">
            <SelectItem value="essencial">Essencial</SelectItem>
            <SelectItem value="avancado">Avançado</SelectItem>
            <SelectItem value="escalado">Escalado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="senha" className="text-pink-300">Nova Senha (opcional)</Label>
        <PasswordInput
          id="senha"
          name="senha"
          placeholder="Deixe em branco para não alterar"
          onChange={handleChange}
          className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-pink-500 text-pink-400 hover:bg-pink-500/10 hover:text-white"
          >
            Cancelar
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/30"
        >
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
};

/**
 * @description Página principal de administração para gerenciamento de dados.
 * Permite visualizar, criar, editar e excluir registros de Empresas e Diagnósticos.
 */
export default function AdminPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Partial<Empresa> | null>(null);
  const [selectedDiagnosticos, setSelectedDiagnosticos] = useState<Set<string>>(new Set());
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [creatingEmpresa, setCreatingEmpresa] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [empresasRes, diagnosticosRes] = await Promise.all([
        fetch("/api/admin/empresas", { credentials: 'include' }),
        fetch("/api/admin/diagnosticos", { credentials: 'include' }),
      ]);

      if (!empresasRes.ok || !diagnosticosRes.ok) {
        throw new Error("Falha ao buscar dados.");
      }

      const empresasData = await empresasRes.json();
      const diagnosticosData = await diagnosticosRes.json();

      setEmpresas(empresasData.data);
      setDiagnosticos(diagnosticosData.data);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Tentar fazer uma requisição para verificar se está autenticado
        const response = await fetch("/api/admin/empresas", {
          method: "GET",
          credentials: "include",
        });

        if (response.status === 401 || response.status === 403) {
          // Não autenticado, redirecionar para login
          router.push("/admin/login");
          return;
        }

        // Se chegou aqui, está autenticado, pode continuar carregando os dados
        fetchData();
      } catch (error) {
        // Em caso de erro, redirecionar para login
        router.push("/admin/login");
      }
    };

    checkAuth();

    // Para admin, adicionar listener para logout automático ao sair da página
    const handleBeforeUnload = async () => {
      try {
        // Fazer logout silencioso quando admin sair da página
        await fetch("/api/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        // Ignorar erros no logout automático
        console.log("Logout automático falhou:", error);
      }
    };

    // Adicionar listener para quando a página for fechada/recarregada
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router, fetchData]);

  // Utilitário para formatar data com fallback
  const formatEmpresaData = (empresa: Empresa) => {
    const source = empresa.createdAt || empresa.data_cadastro || empresa._id;
    let date: Date;
    if (!source) return "-";
    // Se for um ObjectId (24 chars hex), extrair timestamp
    if (/^[0-9a-fA-F]{24}$/.test(source)) {
      const ts = parseInt(source.substring(0, 8), 16) * 1000;
      date = new Date(ts);
    } else {
      date = new Date(source);
    }
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      " " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  const handleDeleteEmpresa = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta empresa e todos os seus diagnósticos associados?")) {
      try {
        const res = await fetch(`/api/admin/empresas/${id}`, { 
          method: "DELETE",
          credentials: 'include'
        });
        if (!res.ok) throw new Error("Falha ao excluir empresa.");
        toast.success('Empresa excluída');
        fetchData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || 'Erro ao excluir empresa');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      toast.success("Logout realizado com sucesso");
      router.push("/admin/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  // Função para excluir diagnóstico individual
  const handleDeleteDiagnostico = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este diagnóstico? Esta ação é irreversível.")) {
      try {
        const res = await fetch(`/api/admin/diagnosticos/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Falha ao excluir diagnóstico.");
        }
        toast.success("Diagnóstico excluído");
        fetchData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message || "Erro ao excluir diagnóstico");
      }
    }
  };
  const handleAddNewEmpresa = () => {
    setEditingEmpresa({});
    setIsDialogOpen(true);
  };

  const handleEditEmpresa = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setIsDialogOpen(true);
  };

  const handleSaveEmpresa = async (empresa: Partial<Empresa>) => {
    const isCreating = !empresa._id;
    const url = isCreating ? "/api/admin/empresas" : `/api/admin/empresas/${empresa._id}`;
    const method = isCreating ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(empresa),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Falha ao salvar empresa.");
      }

      setIsDialogOpen(false);
      setEditingEmpresa(null);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'Erro ao salvar empresa');
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (error) return <div className="p-8 text-red-500">Erro: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 sm:p-8">
      <header className="mb-10 pb-6 border-b border-pink-500/30 sticky top-0 bg-slate-900/90 backdrop-blur z-10 -mx-4 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400 tracking-tight">
              Painel de Administração
            </h1>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl leading-relaxed">Gerencie empresas, diagnósticos e dados essenciais do sistema em um ambiente unificado com a identidade visual padrão.</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            🚪 Sair (Logout)
          </Button>
        </div>
      </header>

      <Tabs defaultValue="empresas" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-800/60 border border-slate-700/60 rounded-lg">
          <TabsTrigger value="empresas" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-slate-300 rounded-md transition-colors">
            Empresas ({empresas.length})
          </TabsTrigger>
          <TabsTrigger value="diagnosticos" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-slate-300 rounded-md transition-colors">
            Diagnósticos ({diagnosticos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresas">
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <Button onClick={handleAddNewEmpresa} className="bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/30">Adicionar Nova Empresa</Button>
            <Button onClick={async () => {
              // Quick-create: open modal prefilled
              setEditingEmpresa({ nome_empresa: "", email: "", cnpj: "" });
              setIsDialogOpen(true);
            }} variant="outline" className="border-pink-500 text-pink-400 hover:bg-pink-500/10 hover:text-white">Criar Empresa (form)</Button>
            <Button
              onClick={async () => {
                // Quick-create automatic company with minimal info
                if (creatingEmpresa) return;
                setCreatingEmpresa(true);
                try {
                  const ts = Date.now();
                  const nome = `Empresa Teste ${ts}`;
                  const email = `teste+${ts}@example.com`;
                  // simple pseudo-cnpj (14 digits)
                  const cnpj = ts.toString().padStart(14, "0").slice(-14);
                  const res = await fetch('/api/admin/empresas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ nome_empresa: nome, email, cnpj, senha: 'Teste123!' }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Falha ao criar empresa de teste');
                  toast.success('Empresa de teste criada');
                  fetchData();
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : String(err);
                  toast.error(message || 'Erro ao criar empresa de teste');
                } finally {
                  setCreatingEmpresa(false);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30"
            >
              {creatingEmpresa ? 'Criando...' : 'Criar Empresa de Teste'}
            </Button>
          </div>
          <div className="overflow-x-auto bg-slate-800/60 border border-slate-700/60 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-300 uppercase bg-slate-900/60 border-b border-pink-500/30">
                <tr>
                  <th className="p-4 font-semibold">Nome da Empresa</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">CNPJ</th>
                  <th className="p-4 font-semibold">Tipo</th>
                  <th className="p-4 font-semibold">Plano</th>
                  <th className="p-4 font-semibold">Cadastro</th>
                  <th className="p-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => {
                  const isAdmin = empresa.tipo_usuario === 'ADMIN';
                  return (
                    <tr key={empresa._id} className={`border-b border-slate-700/60 hover:bg-slate-900/70 transition-colors ${isAdmin ? 'bg-yellow-900/20' : ''}`}>
                      <td className="p-4 text-slate-200 font-medium">
                        {empresa.nome_empresa}
                        {isAdmin && <span className="ml-2 text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">ADMIN</span>}
                      </td>
                      <td className="p-4 text-slate-400">{empresa.email}</td>
                      <td className="p-4 text-slate-400">{empresa.cnpj}</td>
                      <td className="p-4 text-slate-300">
                        <span className={`text-xs px-2 py-1 rounded ${isAdmin ? 'bg-yellow-600 text-yellow-100' : 'bg-blue-600 text-blue-100'}`}>
                          {isAdmin ? 'Administrador' : 'Empresa'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{empresa.planoAtivo || "N/A"}</td>
                      <td className="p-4 text-slate-400">{formatEmpresaData(empresa)}</td>
                      <td className="p-4 flex gap-2">
                        <Button size="sm" onClick={() => handleEditEmpresa(empresa)} className="border-pink-500 text-pink-400 hover:bg-pink-500/10 hover:text-white" variant="outline">Editar</Button>
                        {!isAdmin && (
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteEmpresa(empresa._id)} className="bg-red-600 hover:bg-red-700 text-white">Excluir</Button>
                        )}
                        {isAdmin && (
                          <span className="text-xs text-yellow-400 italic">Protegido</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="diagnosticos">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button
                variant="destructive"
                size="sm"
                disabled={selectedDiagnosticos.size === 0 || bulkDeleting}
                onClick={() => {
                  if (selectedDiagnosticos.size === 0) return toast.error('Nenhum diagnóstico selecionado.');
                  setShowBulkConfirm(true);
                }}
              >
                {bulkDeleting ? 'Excluindo...' : 'Excluir selecionados'}
              </Button>
            </div>
            <div className="text-sm text-slate-400">Selecionados: {selectedDiagnosticos.size}</div>
          </div>

          {/* Bulk delete confirmation dialog */}
          <Dialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
            <DialogContent className="bg-slate-900/95 border border-pink-500/30 text-white backdrop-blur">
              <DialogHeader>
                <DialogTitle className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400">Confirmar exclusão em lote</DialogTitle>
              </DialogHeader>
              <div className="py-2">
                <p className="text-slate-300">Deseja excluir {selectedDiagnosticos.size} diagnósticos selecionados? Esta ação é irreversível.</p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setShowBulkConfirm(false)} className="border-pink-500/40 text-pink-300 hover:bg-pink-500/10 hover:text-white">Cancelar</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      setBulkDeleting(true);
                      const ids = Array.from(selectedDiagnosticos);
                      const res = await fetch('/api/admin/diagnosticos/bulk-delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ ids }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Falha ao excluir diagnósticos.');
                      toast.success(`${data.deletedCount || ids.length} diagnósticos excluídos`);
                      setSelectedDiagnosticos(new Set());
                      fetchData();
                      setShowBulkConfirm(false);
                    } catch (err: unknown) {
                      const message = err instanceof Error ? err.message : String(err);
                      toast.error(message || 'Erro ao excluir diagnósticos');
                    } finally {
                      setBulkDeleting(false);
                    }
                  }}
                >
                  {bulkDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="overflow-x-auto bg-slate-800/60 border border-slate-700/60 rounded-lg shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-300 uppercase bg-slate-900/60 border-b border-pink-500/30">
                <tr>
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedDiagnosticos.size === diagnosticos.length && diagnosticos.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDiagnosticos(new Set(diagnosticos.map(d => d._id)));
                        } else {
                          setSelectedDiagnosticos(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="p-4 font-semibold">Empresa</th>
                  <th className="p-4 font-semibold">Contato</th>
                  <th className="p-4 font-semibold">Dimensões</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Data</th>
                  <th className="p-4 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticos.map((diag) => (
                  <tr key={diag._id} className="border-b border-slate-700/60 hover:bg-slate-900/70 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedDiagnosticos.has(diag._id)}
                        onChange={(e) => {
                          const next = new Set(selectedDiagnosticos);
                          if (e.target.checked) next.add(diag._id);
                          else next.delete(diag._id);
                          setSelectedDiagnosticos(next);
                        }}
                      />
                    </td>
                    <td className="p-4 text-slate-200 font-medium">{diag.empresa?.nome_empresa || diag.perfil.empresa}</td>
                    <td className="p-4 text-slate-400">
                      <div className="text-xs">
                        <div>{diag.empresa?.email || "N/A"}</div>
                        <div className="text-slate-500">CNPJ: {diag.empresa?.cnpj || "N/A"}</div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">{diag.dimensoesSelecionadas.join(", ")}</td>
                    <td className="p-4 text-slate-300">{diag.status}</td>
                    <td className="p-4 text-slate-400">{new Date(diag.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteDiagnostico(diag._id)} className="bg-red-600 hover:bg-red-700 text-white">Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900/95 border border-pink-500/30 text-white backdrop-blur">
          <DialogHeader>
            <DialogTitle className="text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400">{editingEmpresa?._id ? "Editar Empresa" : "Criar Nova Empresa"}</DialogTitle>
          </DialogHeader>
          {editingEmpresa && (
            <EmpresaForm
              empresa={editingEmpresa}
              onSave={handleSaveEmpresa}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}