"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CadastroLoginPag() {
  {
    /* States para o login*/
  }
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginCNPJ, setloginCNPJ] = useState("");


  // Estado da aba para evitar reset dos campos
  const [tabValue, setTabValue] = useState("login");

  {
    /*Função de login corrigida*/
  }
  async function handleLogin(e: React.FormEvent) {
  
  // Captura o estado atual dos campos
  const emailValue = loginEmail
  const cnpjValue = loginCNPJ
  const senhaValue = loginSenha

  console.log("📤 Enviando login:", {
    email: emailValue,
    cnpj: cnpjValue,
    senha: senhaValue,
  });

  if (!emailValue && !cnpjValue) {
    alert("Informe o e-mail ou CNPJ para continuar.");
    return;
  }

  if (!senhaValue) {
    alert("Informe a senha.");
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

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      alert("Resposta inválida do servidor");
      return;
    }

    if (!res.ok) {
      alert("Erro no login: " + data.error);
      return;
    }

    alert(`✅ Login bem-sucedido! Bem-vindo(a), ${data.user?.nome_empresa}`);
  } catch (err) {
    console.error("❌ Erro ao logar:", err);
    alert("Erro inesperado no login.");
  }
}


  {
    /*inicio do frontend*/
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
              onChange={(e: any) => setloginCNPJ(e.target.value)}
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
              <Input
                id="login-password"
                type="password"
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
  onChange: (e: any) => void;
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
