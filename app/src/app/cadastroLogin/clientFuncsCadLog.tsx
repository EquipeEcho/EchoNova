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
  const [loginCnpj, setLoginCnpj] = useState("");

  {
    /*States para o cadastro*/
  }
  const [nome_empresa, setnome_empresa] = useState("");
  const [registerCnpj, setRegisterCnpj] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPassword2, setRegisterPassword2] = useState("");

  {
    /*Função de login*/
  }
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          senha: loginSenha,
          cnpj: loginCnpj,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Login bem-sucedido: " + data.user.email);
      } else {
        alert("Erro: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao tentar logar");
    }
  }

  {
    /*Função de cadastro*/
  }
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (registerPassword !== registerPassword2) {
      alert("As senhas não coincidem");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_empresa: nome_empresa,
          cnpj: registerCnpj,
          email: registerEmail,
          senha: registerPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Cadastro realizado com sucesso");
      } else {
        alert("Erro: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao tentar cadastrar");
    }
  }
  {
    /*inicio do frontend*/
  }
  return (
    <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg p-6">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-800 rounded-lg">
          <TabsTrigger
            value="login"
            className="data-[state=active]:bg-neutral-600 text-neutral-100"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="data-[state=active]:bg-neutral-600 text-neutral-100"
          >
            Cadastro
          </TabsTrigger>
        </TabsList>

        {/* Aba de Login */}
        <TabsContent value="login">
          <form className="grid gap-4 py-6" onSubmit={handleLogin}>
            <Cnpj
              value={loginCnpj}
              onChange={(e: any) => setLoginCnpj(e.target.value)}
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

        {/* Aba de Cadastro */}
        <TabsContent value="register">
          <form className="grid gap-4 py-6" onSubmit={handleRegister}>
            <div className="grid grid-cols-4 text-left gap-2">
              <Label
                htmlFor="register-name"
                className="text-neutral-400 col-span-1"
              >
                Nome da Empresa:
              </Label>
              <Input
                id="register-name"
                type="text"
                placeholder="Seu nome"
                value={nome_empresa}
                onChange={(e) => setnome_empresa(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white col-span-3"
              />
            </div>
            <Cnpj
              value={registerCnpj}
              onChange={(e: any) => setRegisterCnpj(e.target.value)}
            />
            <div className="grid grid-cols-4 text-left gap-2">
              <Label
                htmlFor="register-email"
                className="text-neutral-400 col-span-1"
              >
                Email:
              </Label>
              <Input
                id="register-email"
                type="email"
                placeholder="seu@email.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 text-left gap-2">
              <Label
                htmlFor="register-password"
                className="text-neutral-400 col-span-1"
              >
                Senha:
              </Label>
              <Input
                id="register-password"
                type="password"
                placeholder="••••••••"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 text-left gap-2">
              <Label
                htmlFor="register-password2"
                className="text-neutral-400 col-span-1"
              >
                Repita a Senha:
              </Label>
              <Input
                id="register-password2"
                type="password"
                placeholder="••••••••"
                value={registerPassword2}
                onChange={(e) => setRegisterPassword2(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white col-span-3"
              />
            </div>
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Cadastrar
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
      <Label htmlFor="register-cnpj" className="text-neutral-400 col-span-1">
        CNPJ:
      </Label>
      <Input
        id="register-cnpj"
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
