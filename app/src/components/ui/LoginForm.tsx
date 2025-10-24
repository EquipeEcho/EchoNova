// app/src/components/ui/LoginForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  onSuccess?: () => void; // Callback opcional para quando o login for bem-sucedido
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const loginAction = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !cnpj.trim()) {
      toast.error("Preencha o e-mail ou CNPJ.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          cnpj: cnpj.trim(),
          senha: senha.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha no login.");

      toast.success(`Bem-vindo(a), ${data.user.nome_empresa}!`);
      loginAction(data.user);
      
      // Se uma função de sucesso foi passada (ex: para fechar um modal), execute-a.
      if (onSuccess) {
        onSuccess();
      }
      
      router.push("/pos-login");

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="grid gap-4 py-4">
       <div>
          <Label htmlFor="cnpj-login" className="text-neutral-400">CNPJ</Label>
          <Input id="cnpj-login" type="text" placeholder="00.000.000/0001-00" className="bg-gray-800 border-gray-700 text-white" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
        </div>
        <div className="text-center text-neutral-400 text-sm">ou</div>
      <div>
        <Label htmlFor="email-login" className="text-neutral-400">Email</Label>
        <Input id="email-login" type="email" placeholder="email@exemplo.com" className="bg-gray-800 border-gray-700 text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="senha-login" className="text-neutral-400">Senha</Label>
        <Input id="senha-login" type="password" placeholder="••••••••" className="bg-gray-800 border-gray-700 text-white" value={senha} onChange={(e) => setSenha(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading} className="bg-fuchsia-800 text-white hover:bg-fuchsia-700 cursor-pointer">
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}