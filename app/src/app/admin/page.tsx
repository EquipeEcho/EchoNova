"use client";

import { useState, useEffect, FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipagem para os dados que vamos manipular
interface Empresa {
  _id: string;
  nome_empresa: string;
  email: string;
  cnpj: string;
  planoAtivo?: string;
  senha?: string;
}

interface Diagnostico {
  _id: string;
  empresa: {
    _id: string;
    nome_empresa: string;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        {/* --- CORREÇÃO DE ESTILO --- */}
        <Label htmlFor="nome_empresa" className="text-gray-300">Nome da Empresa</Label>
        <Input
          id="nome_empresa"
          name="nome_empresa"
          value={formData.nome_empresa || ""}
          onChange={handleChange}
          required
          // --- CORREÇÃO DE ESTILO ---
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>
      <div>
        {/* --- CORREÇÃO DE ESTILO --- */}
        <Label htmlFor="email" className="text-gray-300">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email || ""}
          onChange={handleChange}
          required
          // --- CORREÇÃO DE ESTILO ---
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>
      <div>
        {/* --- CORREÇÃO DE ESTILO --- */}
        <Label htmlFor="cnpj" className="text-gray-300">CNPJ</Label>
        <Input
          id="cnpj"
          name="cnpj"
          value={formData.cnpj || ""}
          onChange={handleChange}
          required
          // --- CORREÇÃO DE ESTILO ---
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>
      <div>
        {/* --- CORREÇÃO DE ESTILO --- */}
        <Label htmlFor="planoAtivo" className="text-gray-300">Plano Ativo</Label>
        <Input
          id="planoAtivo"
          name="planoAtivo"
          placeholder="essencial, avancado, escalado"
          value={formData.planoAtivo || ""}
          onChange={handleChange}
          // --- CORREÇÃO DE ESTILO ---
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>
       <div>
        {/* --- CORREÇÃO DE ESTILO --- */}
        <Label htmlFor="senha" className="text-gray-300">Nova Senha (opcional)</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          placeholder="Deixe em branco para não alterar"
          onChange={handleChange}
          // --- CORREÇÃO DE ESTILO ---
          className="bg-gray-800 border-gray-600 text-white"
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          {/* --- CORREÇÃO DE ESTILO --- */}
          <Button type="button" variant="outline" onClick={onCancel} className="text-white border-gray-600 hover:bg-gray-700 hover:text-white">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  );
};

/**
 * @description Página principal de administração para gerenciamento de dados.
 * Permite visualizar, criar, editar e excluir registros de Empresas e Diagnósticos.
 */
export default function AdminPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Partial<Empresa> | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empresasRes, diagnosticosRes] = await Promise.all([
        fetch("/api/admin/empresas"),
        fetch("/api/admin/diagnosticos"),
      ]);

      if (!empresasRes.ok || !diagnosticosRes.ok) {
        throw new Error("Falha ao buscar dados.");
      }

      const empresasData = await empresasRes.json();
      const diagnosticosData = await diagnosticosRes.json();

      setEmpresas(empresasData.data);
      setDiagnosticos(diagnosticosData.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteEmpresa = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta empresa e todos os seus diagnósticos associados?")) {
      try {
        const res = await fetch(`/api/admin/empresas/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Falha ao excluir empresa.");
        fetchData();
      } catch (err: any) {
        alert(`Erro: ${err.message}`);
      }
    }
  };
  
  const handleDeleteDiagnostico = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este diagnóstico?")) {
      try {
        const res = await fetch(`/api/admin/diagnosticos/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Falha ao excluir diagnóstico.");
        fetchData();
      } catch (err: any) {
        alert(`Erro: ${err.message}`);
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
        body: JSON.stringify(empresa),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Falha ao salvar empresa.");
      }

      setIsDialogOpen(false);
      setEditingEmpresa(null);
      fetchData();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (error) return <div className="p-8 text-red-500">Erro: {error}</div>;

  return (
    <div className="p-4 sm:p-8 bg-gray-900 text-white min-h-screen font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
        <p className="text-gray-400">Gerenciamento de dados da aplicação.</p>
      </header>

      <Tabs defaultValue="empresas" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md bg-gray-800">
            {/* --- CORREÇÃO DE ESTILO --- */}
          <TabsTrigger value="empresas" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">
              Empresas ({empresas.length})
            </TabsTrigger>
          <TabsTrigger value="diagnosticos" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">
              Diagnósticos ({diagnosticos.length})
            </TabsTrigger>
        </TabsList>
        
        <TabsContent value="empresas">
          <div className="mb-4">
            <Button onClick={handleAddNewEmpresa}>Adicionar Nova Empresa</Button>
          </div>
          <div className="overflow-x-auto bg-gray-800 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                <tr>
                  <th className="p-4">Nome da Empresa</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">CNPJ</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((empresa) => (
                  <tr key={empresa._id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-4">{empresa.nome_empresa}</td>
                    <td className="p-4">{empresa.email}</td>
                    <td className="p-4">{empresa.cnpj}</td>
                    <td className="p-4">{empresa.planoAtivo || "N/A"}</td>
                    <td className="p-4 flex gap-2">
                        {/* --- CORREÇÃO DE ESTILO --- */}
                      <Button variant="outline" size="sm" onClick={() => handleEditEmpresa(empresa)} className="text-white border-gray-600 hover:bg-gray-700 hover:text-white">Editar</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteEmpresa(empresa._id)}>Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="diagnosticos">
          <div className="overflow-x-auto bg-gray-800 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                <tr>
                  <th className="p-4">Empresa</th>
                  <th className="p-4">Dimensões</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {diagnosticos.map((diag) => (
                  <tr key={diag._id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-4">{diag.empresa?.nome_empresa || diag.perfil.empresa}</td>
                    <td className="p-4">{diag.dimensoesSelecionadas.join(", ")}</td>
                    <td className="p-4">{diag.status}</td>
                    <td className="p-4">{new Date(diag.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteDiagnostico(diag._id)}>Excluir</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {/* --- CORREÇÃO DE ESTILO --- */}
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                  <DialogTitle>{editingEmpresa?._id ? "Editar Empresa" : "Criar Nova Empresa"}</DialogTitle>
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