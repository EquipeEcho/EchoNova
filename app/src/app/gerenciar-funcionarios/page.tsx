"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Headernaofix, Ondas } from "@/app/clientFuncs";
interface Funcionario {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  cargo: string;
  dataCadastro: string;
  status: "ativo" | "inativo";
}

type ModalMode = "criar" | "editar" | null;

export default function GerenciarFuncionariosPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState<ModalMode>(null);
  const [selectedFuncionario, setSelectedFuncionario] =
    useState<Funcionario | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    matricula: "",
    cargo: "",
    senha: "",
    status: "ativo" as "ativo" | "inativo",
  });

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      setLoading(true);
      // Simulação de dados - substituir por chamada real à API
      await new Promise((r) => setTimeout(r, 500));
      const mockData: Funcionario[] = [
        {
          id: "1",
          nome: "João Silva",
          email: "joao.silva@empresa.com",
          matricula: "12345",
          cargo: "Analista de Vendas",
          dataCadastro: "2025-01-15",
          status: "ativo",
        },
        {
          id: "2",
          nome: "Maria Santos",
          email: "maria.santos@empresa.com",
          matricula: "12346",
          cargo: "Gerente de Vendas",
          dataCadastro: "2025-02-10",
          status: "ativo",
        },
        {
          id: "3",
          nome: "Pedro Costa",
          email: "pedro.costa@empresa.com",
          matricula: "12347",
          cargo: "Analista de Atendimento",
          dataCadastro: "2025-03-05",
          status: "inativo",
        },
      ];
      setFuncionarios(mockData);
    } catch (e: any) {
      toast.error("Erro ao carregar funcionários: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: ModalMode, funcionario?: Funcionario) => {
    setModalOpen(mode);
    if (mode === "editar" && funcionario) {
      setSelectedFuncionario(funcionario);
      setFormData({
        nome: funcionario.nome,
        email: funcionario.email,
        matricula: funcionario.matricula,
        cargo: funcionario.cargo,
        senha: "",
        status: funcionario.status,
      });
    } else {
      setSelectedFuncionario(null);
      setFormData({
        nome: "",
        email: "",
        matricula: "",
        cargo: "",
        senha: "",
        status: "ativo",
      });
    }
  };

  const handleCloseModal = () => {
    setModalOpen(null);
    setSelectedFuncionario(null);
    setFormData({
      nome: "",
      email: "",
      matricula: "",
      cargo: "",
      senha: "",
      status: "ativo",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nome ||
      !formData.email ||
      !formData.matricula ||
      !formData.cargo
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (modalOpen === "criar" && !formData.senha) {
      toast.error("A senha é obrigatória para novos funcionários");
      return;
    }

    try {
      if (modalOpen === "criar") {
        // Criar novo funcionário
        const novoFuncionario: Funcionario = {
          id: String(Date.now()),
          nome: formData.nome,
          email: formData.email,
          matricula: formData.matricula,
          cargo: formData.cargo,
          dataCadastro: new Date().toISOString().split("T")[0],
          status: formData.status,
        };
        setFuncionarios([...funcionarios, novoFuncionario]);
        toast.success("Funcionário cadastrado com sucesso!");
      } else if (modalOpen === "editar" && selectedFuncionario) {
        // Editar funcionário existente
        const funcionariosAtualizados = funcionarios.map((f) =>
          f.id === selectedFuncionario.id
            ? {
                ...f,
                nome: formData.nome,
                email: formData.email,
                matricula: formData.matricula,
                cargo: formData.cargo,
                status: formData.status,
              }
            : f
        );
        setFuncionarios(funcionariosAtualizados);
        toast.success("Funcionário atualizado com sucesso!");
      }
      handleCloseModal();
    } catch (e: any) {
      toast.error("Erro ao salvar funcionário: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) return;

    try {
      // Aqui você faria a chamada à API para deletar
      setFuncionarios(funcionarios.filter((f) => f.id !== id));
      toast.success("Funcionário excluído com sucesso!");
    } catch (e: any) {
      toast.error("Erro ao excluir funcionário: " + e.message);
    }
  };

  const filteredFuncionarios = funcionarios.filter(
    (f) =>
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.matricula.includes(searchTerm) ||
      f.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-linear-to-br from-gray-950 via-fuchsia-950 to-gray-900 flex items-center justify-center">
        <Headernaofix Link="/" />
        <Ondas />
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-linear-to-br from-gray-950 to-gray-850">
      <Headernaofix Link="/" />
      <Ondas />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 rounded-2xl shadow-2xl p-6 md:p-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Gerenciar Funcionários
              </h1>
              <p className="text-neutral-400 text-sm mt-1">
                Cadastre, edite e gerencie sua equipe
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleOpenModal("criar")}
                className="bg-fuchsia-700 hover:bg-fuchsia-600 text-white"
              >
                + Novo Funcionário
              </Button>
              <Button
                onClick={handleLogout}
                className="bg-gray-800 hover:bg-gray-700 text-white border border-neutral-700"
              >
                Sair
              </Button>
            </div>
          </div>

          {/* Busca */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Buscar por nome, email, matrícula ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500"
            />
          </div>

          {/* Lista de Funcionários */}
          <div className="space-y-4">
            {filteredFuncionarios.length === 0 ? (
              <div className="bg-neutral-900/70 border border-neutral-700 rounded-xl p-10 text-center text-neutral-400">
                {searchTerm
                  ? "Nenhum funcionário encontrado"
                  : "Nenhum funcionário cadastrado"}
              </div>
            ) : (
              filteredFuncionarios.map((funcionario) => (
                <div
                  key={funcionario.id}
                  className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-5 hover:border-fuchsia-700/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {funcionario.nome}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            funcionario.status === "ativo"
                              ? "bg-green-500/20 text-green-400 border border-green-600/40"
                              : "bg-gray-500/20 text-gray-400 border border-gray-600/40"
                          }`}
                        >
                          {funcionario.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-neutral-400">
                        <div>
                          <span className="text-neutral-500">Email:</span>{" "}
                          {funcionario.email}
                        </div>
                        <div>
                          <span className="text-neutral-500">Matrícula:</span>{" "}
                          {funcionario.matricula}
                        </div>
                        <div>
                          <span className="text-neutral-500">Cargo:</span>{" "}
                          {funcionario.cargo}
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500 mt-2">
                        Cadastrado em:{" "}
                        {new Date(funcionario.dataCadastro).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenModal("editar", funcionario)}
                        className="bg-blue-700 hover:bg-blue-600 text-white text-sm px-4 py-2"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(funcionario.id)}
                        className="bg-red-700 hover:bg-red-600 text-white text-sm px-4 py-2"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Criar/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                {modalOpen === "criar"
                  ? "Cadastrar Novo Funcionário"
                  : "Editar Funcionário"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="nome" className="text-neutral-300">
                    Nome Completo *
                  </Label>
                  <Input
                    id="nome"
                    type="text"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    placeholder="Ex: João Silva"
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-neutral-300">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@empresa.com"
                    className="bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="matricula" className="text-neutral-300">
                      Matrícula *
                    </Label>
                    <Input
                      id="matricula"
                      type="text"
                      value={formData.matricula}
                      onChange={(e) =>
                        setFormData({ ...formData, matricula: e.target.value })
                      }
                      placeholder="Ex: 12345"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cargo" className="text-neutral-300">
                      Cargo *
                    </Label>
                    <Input
                      id="cargo"
                      type="text"
                      value={formData.cargo}
                      onChange={(e) =>
                        setFormData({ ...formData, cargo: e.target.value })
                      }
                      placeholder="Ex: Analista de Vendas"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                </div>

                {modalOpen === "criar" && (
                  <div>
                    <Label htmlFor="senha" className="text-neutral-300">
                      Senha *
                    </Label>
                    <Input
                      id="senha"
                      type="password"
                      value={formData.senha}
                      onChange={(e) =>
                        setFormData({ ...formData, senha: e.target.value })
                      }
                      placeholder="••••••••"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="status" className="text-neutral-300">
                    Status
                  </Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "ativo" | "inativo",
                      })
                    }
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-fuchsia-600 transition"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-fuchsia-700 hover:bg-fuchsia-600 text-white"
                  >
                    {modalOpen === "criar" ? "Cadastrar" : "Salvar Alterações"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
