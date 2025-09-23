"use client";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export function CadastroLoginPag() {
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
          <form className="grid gap-4 py-6">
            <Cnpj />
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
          <form className="grid gap-4 py-6">
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
                className="bg-neutral-800 border-neutral-700 text-white col-span-3"
              />
            </div>
            <Cnpj />
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
                className="bg-neutral-800 border-neutral-700 text-white col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 text-left gap-2">
              <Label
                htmlFor="register-password"
                className="text-neutral-400 col-span-1"
              >
                Repita a Senha:
              </Label>
              <Input
                id="register-password"
                type="password"
                placeholder="••••••••"
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
  )
}

function Cnpj() {
  return (<div className="grid grid-cols-4 text-left gap-2">
    <Label
      htmlFor="register-name"
      className="text-neutral-400 col-span-1"
    >
      CNPJ:
    </Label>
    <Input
      id="register-cnpj"
      type="text"
      maxLength={18}
      placeholder="00.000.000/0001-00"
      className="bg-neutral-800 border-neutral-700 text-white col-span-3"
    />
  </div>)
}