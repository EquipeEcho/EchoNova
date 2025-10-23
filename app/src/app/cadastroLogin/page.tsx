"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginCnpj, setLoginCnpj] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!loginEmail && !loginCnpj) {
      alert("Preencha o e-mail ou CNPJ para fazer login.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim(),
          senha: loginSenha.trim(),
          cnpj: loginCnpj.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Login realizado com sucesso!");
        console.log("Usuário logado:", data.user);

        // Exemplo: salvar ID da empresa ou redirecionar
        localStorage.setItem("empresaId", data.user.id);
        window.location.href = "/dashboard"; // ajuste o destino conforme necessário
      } else {
        alert(data.error || "Erro ao efetuar login.");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg p-6">
      <h2 className="text-white text-xl font-semibold mb-4 text-center">Bem-vindo</h2>
      <p className="text-neutral-400 text-sm text-center mb-6">
        Digite seu e-mail ou CNPJ
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-neutral-400">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@exemplo.com"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="cnpj" className="text-neutral-400">CNPJ</Label>
          <Input
            id="cnpj"
            type="text"
            maxLength={18}
            placeholder="00.000.000/0001-00"
            value={loginCnpj}
            onChange={(e) => setLoginCnpj(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white"
          />
        </div>

        <div>
          <Label htmlFor="senha" className="text-neutral-400">Senha</Label>
          <Input
            id="senha"
            type="password"
            placeholder="••••••••"
            value={loginSenha}
            onChange={(e) => setLoginSenha(e.target.value)}
            className="bg-neutral-800 border-neutral-700 text-white"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2 rounded-lg"
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="text-neutral-500 text-xs mt-6 text-center">
        Caso não tenha se cadastrado, termine o primeiro questionário.
      </p>
    </div>
  );
}
