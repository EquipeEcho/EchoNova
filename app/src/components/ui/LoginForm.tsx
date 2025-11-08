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
  const [matricula, setMatricula] = useState(""); // opcional para funcionário
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const loginAction = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = "/api/login";
      let body: Record<string, string> = { senha: senha.trim() };

      if (loginType === "empresa") {
        if (!email.trim() && !cnpj.trim()) {
          toast.error("Preencha o e-mail ou CNPJ.");
          return;
        }
        body.email = email.trim();
        body.cnpj = cnpj.trim();
      } else {
        // Funcionário
        if (!email.trim() && !matricula.trim()) {
          toast.error("Preencha o e-mail ou matrícula.");
          return;
        }
        endpoint = "/api/login-funcionario"; // ajuste se necessário
        if (email.trim()) body.email = email.trim();
        if (matricula.trim()) body.matricula = matricula.trim();
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no login.");

      if (loginType === "empresa") {
        toast.success(`Bem-vindo(a), ${data.user.nome_empresa}!`);
      } else {
        toast.success(`Bem-vindo(a), ${data.user.nome || "Funcionário"}!`);
      }

      loginAction(data.user);
      onSuccess && onSuccess();
      router.push("/pos-login");
    } catch (error: any) {
      toast.error(error.message);
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
