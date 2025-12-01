"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro no login");
      }

      // Verificar se o usuário é admin
      if (data.user.tipo_usuario !== "ADMIN") {
        throw new Error("Acesso negado: apenas administradores podem acessar este painel");
      }

      toast.success("Login realizado com sucesso!");

      // Redirecionar para /admin
      router.push("/admin");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao fazer login";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/60 border border-slate-700/60 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-pink-400 to-purple-400 mb-2">
            Admin EchoNova
          </h1>
          <p className="text-slate-400 text-sm">
            Acesso restrito ao painel administrativo
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-pink-300 block mb-2">
              Email do Administrador
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@echonova.com"
              required
              className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
            />
          </div>

          <div>
            <Label htmlFor="senha" className="text-pink-300 block mb-2">
              Senha
            </Label>
            <PasswordInput
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
              className="bg-slate-900/40 border-slate-700 text-slate-200 focus:border-pink-500 focus:ring-pink-500/30"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/30 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar no Painel Admin"}
          </Button>
        </form>

        <div className="mt-8 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
          <h3 className="text-red-300 font-semibold mb-2">🔒 Política de Segurança</h3>
          <p className="text-red-400 text-sm">
            Por questões de segurança, a sessão do administrador expira automaticamente ao sair da página.
            Sempre será necessário fazer login novamente para acessar o painel administrativo.
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-slate-400 hover:text-pink-400 text-sm transition-colors"
          >
            ← Voltar ao site
          </button>
        </div>
      </div>
    </div>
  );
}