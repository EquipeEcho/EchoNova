"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";

export function CadastroLoginPag() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginCNPJ, setloginCNPJ] = useState("");


  // Estado da aba para evitar reset dos campos
  const [tabValue, setTabValue] = useState("login");

  async function handleLogin(_e: React.FormEvent) {
  
  // Captura o estado atual dos campos
  const emailValue = loginEmail;
  const cnpjValue = loginCNPJ;
  const senhaValue = loginSenha;

  console.log("📤 Enviando login:", {
    email: emailValue,
    cnpj: cnpjValue,
    senha: senhaValue,
  });

  if (!emailValue && !cnpjValue) {
    toast.error("Informe o e-mail ou CNPJ para continuar.");
    return;
  }

  if (!senhaValue) {
    toast.error("Informe a senha.");
    return;
  }

  // Validação de senha forte
  if (senhaValue.length < 8) {
    toast.error("A senha deve ter no mínimo 8 caracteres.");
    return;
  }
  if (!/[A-Z]/.test(senhaValue)) {
    toast.error("A senha deve conter pelo menos uma letra maiúscula.");
    return;
  }
  if (!/[a-z]/.test(senhaValue)) {
    toast.error("A senha deve conter pelo menos uma letra minúscula.");
    return;
  }
  if (!/[0-9]/.test(senhaValue)) {
    toast.error("A senha deve conter pelo menos um número.");
    return;
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senhaValue)) {
    toast.error("A senha deve conter pelo menos um símbolo.");
    return;
  }

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailValue,
        cnpj: cnpjValue,
        senha: senhaValue,
      }),
    });

    const text = await res.text();
    console.log("📥 Resposta bruta:", text);

    let data: { error?: string; user?: { nome_empresa?: string } } | null = null;
    try {
      data = JSON.parse(text) as { error?: string; user?: { nome_empresa?: string } };
    } catch {
      toast.error("Resposta inválida do servidor");
      return;
    }

    if (!res.ok) {
      toast.error(`Erro no login: ${data.error}`);
      return;
    }

    toast.success(`✅ Login bem-sucedido! Bem-vindo(a), ${data.user?.nome_empresa}`);
  } catch (err) {
    console.error("❌ Erro ao logar:", err);
    toast.error("Erro inesperado no login.");
  }
}


  
  return (
    <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg p-6">
      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-800 rounded-lg">
          <TabsTrigger
            value="login"
            className="data-[state=active]:bg-neutral-600 text-neutral-100"
          >
            Login
          </TabsTrigger>
        </TabsList>

        {/* Aba de Login */}
        <TabsContent value="login">
          <form className="grid gap-4 py-6" onSubmit={handleLogin}>
            <Cnpj
              value={loginCNPJ}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setloginCNPJ(e.target.value)}
            />
            <div className="grid grid-cols-4 text-left gap-2">
              <Label className="text-neutral-400">Ou</Label>
            </div>
            <div className="grid grid-cols-4 text-left gap-2">
              <Label
                htmlFor="login-email"
                className="text-neutral-400 col-span-1"
              >
                Email:
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 text-left gap-2">
              <Label
                htmlFor="login-password"
                className="text-neutral-400 col-span-1"
              >
                Senha:
              </Label>
              <PasswordInput
                id="login-password"
                placeholder="••••••••"
                value={loginSenha}
                onChange={(e) => setLoginSenha(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white col-span-3"
              />
            </div>
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Entrar
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente do CNPJ, reutilizável
function Cnpj({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="grid grid-cols-4 text-left gap-2">
      <Label htmlFor="login-cnpj" className="text-neutral-400 col-span-1">
        CNPJ:
      </Label>
      <Input
        id="login-cnpj"
        type="text"
        maxLength={18}
        placeholder="00.000.000/0001-00"
        value={value}
        onChange={onChange}
        className="bg-neutral-800 border-neutral-700 text-white col-span-3"
      />
    </div>
  );
}
