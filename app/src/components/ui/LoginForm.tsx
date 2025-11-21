// components/ui/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  onSuccess?: () => void;
}

type LoginType = "empresa" | "funcionario";

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [loginType, setLoginType] = useState<LoginType>("empresa");
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [senha, setSenha] = useState("");
  const [matricula, setMatricula] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const loginAction = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // validações básicas ANTES de ligar o loading
    if (!senha.trim()) {
      toast.error("Informe a senha.");
      return;
    }

    let endpoint = "/api/login";
    const body: Record<string, string> = {
      senha: senha.trim(),
    };

    if (loginType === "empresa") {
      if (!email.trim() && !cnpj.trim()) {
        toast.error("Preencha o e-mail ou CNPJ.");
        return;
      }
      if (email.trim()) body.email = email.trim();
      if (cnpj.trim()) body.cnpj = cnpj.trim();
    } else {
      // FUNCIONÁRIO: usa UM campo "login" (email OU matrícula)
      const loginValue = email.trim() || matricula.trim();
      if (!loginValue) {
        toast.error("Preencha o e-mail ou matrícula.");
        return;
      }
      endpoint = "/api/login-funcionario";
      body.login = loginValue;
    }

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no login.");

      // mensagens diferentes para cada tipo
      if (loginType === "empresa") {
        toast.success(`Bem-vindo(a), ${data.user.nome_empresa}!`);
      } else {
        toast.success(`Bem-vindo(a), ${data.user.nome || "Funcionário"}!`);
      }

      // joga tudo no Zustand (empresa ou funcionário)
      loginAction(data.user);

      onSuccess && onSuccess();

      // redireciona de acordo com o tipo
      if (loginType === "empresa") {
        router.push("/pos-login");
      } else {
        router.push("/pagina-funcionarios");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className={
            loginType === "empresa"
              ? "bg-fuchsia-800 hover:bg-fuchsia-700 text-white border-fuchsia-800 cursor-pointer"
              : "bg-transparent hover:bg-white text-gray-300 border-gray-700 cursor-pointer"
          }
          onClick={() => setLoginType("empresa")}
        >
          Empresa
        </Button>
        <Button
          type="button"
          variant="outline"
          className={
            loginType === "funcionario"
              ? "bg-fuchsia-800 hover:bg-fuchsia-700 text-white border-fuchsia-800 cursor-pointer"
              : "bg-transparent hover:bg-white text-gray-300 border-gray-700 cursor-pointer"
          }
          onClick={() => setLoginType("funcionario")}
        >
          Funcionário
        </Button>
      </div>

      <form onSubmit={handleLogin} className="grid gap-4 py-4">
        {loginType === "empresa" && (
          <>
            <div>
              <Label htmlFor="cnpj-login" className="text-neutral-400">
                CNPJ
              </Label>
              <Input
                id="cnpj-login"
                type="text"
                placeholder="00.000.000/0001-00"
                className="bg-gray-800 border-gray-700 text-white"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
              />
            </div>
            <div className="text-center text-neutral-400 text-sm">ou</div>
            <div>
              <Label htmlFor="email-login" className="text-neutral-400">
                Email
              </Label>
              <Input
                id="email-login"
                type="email"
                placeholder="email@exemplo.com"
                className="bg-gray-800 border-gray-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </>
        )}

        {loginType === "funcionario" && (
          <>
            <div>
              <Label htmlFor="email-func-login" className="text-neutral-400">
                Email (opcional)
              </Label>
              <Input
                id="email-func-login"
                type="email"
                placeholder="email@empresa.com"
                className="bg-gray-800 border-gray-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="matricula-login" className="text-neutral-400">
                Matrícula (opcional)
              </Label>
              <Input
                id="matricula-login"
                type="text"
                placeholder="EX: 12345"
                className="bg-gray-800 border-gray-700 text-white"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="senha-login" className="text-neutral-400">
            Senha
          </Label>
          <Input
            id="senha-login"
            type="password"
            placeholder="••••••••"
            className="bg-gray-800 border-gray-700 text-white"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-fuchsia-800 text-white hover:bg-fuchsia-700 cursor-pointer"
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
