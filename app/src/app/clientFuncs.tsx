"use client";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Link } from "lucide-react";
import { validateCNPJ, validateEmail, validateField } from "./form/validator";
import { useAuthStore } from "@/lib/stores/useAuthStore"; // Importa o store de autenticação
import { useRouter } from "next/navigation"; // Correção: usar next/navigation em vez de next/router


export function Ondas() {
  return (
    <svg
      className="fixed bottom-0 left-0 z-0 h-250"
      viewBox="0 0 1440 320"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill="#ff0055" fillOpacity={0.4}>
        <animate
          attributeName="d"
          dur="10s"
          repeatCount="indefinite"
          values="
        M0,160 Q360,260 720,160 T1440,160 V320 H0 Z;
        M0,200 Q360,60 720,200 T1440,200 V320 H0 Z;
        M0,160 Q360,260 720,160 T1440,160 V320 H0 Z
      "
        />
      </path>

      <path fill="#ff3366" fillOpacity={0.6}>
        <animate
          attributeName="d"
          dur="14s"
          repeatCount="indefinite"
          values="
        M0,180 Q360,300 720,180 T1440,180 V320 H0 Z;
        M0,220 Q360,100 720,220 T1440,220 V320 H0 Z;
        M0,180 Q360,300 720,180 T1440,180 V320 H0 Z
      "
        />
      </path>
      <path fill="#ff6699" fillOpacity={0.5}>
        <animate
          attributeName="d"
          dur="18s"
          repeatCount="indefinite"
          values="
        M0,200 Q360,350 720,200 T1440,200 V320 H0 Z;
        M0,240 Q360,120 720,240 T1440,240 V320 H0 Z;
        M0,200 Q360,350 720,200 T1440,200 V320 H0 Z
      "
        />
      </path>
    </svg>
  );
}

export function Header() {
  return (
    <div className="fixed top-4 right-4 z-50 flex gap-3">
      {/* Botão Instagram */}
      <a href="https://www.instagram.com/entre.nova/" className="social-btn">
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919 1.266.058 1.644.07 4.849.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z" />
        </svg>
      </a>

      {/* Botão LinkedIn */}
      <a
        href="https://www.linkedin.com/company/entrenovaconteudos/"
        className="social-btn"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>
      <DialogCloseButton />
      {/* Logo */}
      <div className="fixed top-4 left-4 ">
        <div className="logo-container hover:scale-100 ">
          <Image
            src="/img/logo.png"
            alt="EchoNova - Diagnóstico Inteligente de Treinamentos"
            width={120}
            height={40}
            className="h-8 w-auto object-contain sm:h-10 md:h-12 lg:h-14"
            priority
          />
        </div>
      </div>
    </div>
  );
}

// CORREÇÃO 5: Componente `Cadastro` removido por ser código legado e não utilizado.

export function DialogCloseButton() {
  // --- INÍCIO DA CORREÇÃO ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // --- FIM DA CORREÇÃO ---

  // ADICIONADO: States para controle de todos os formulários
  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginCNPJ, setLoginCNPJ] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const loginAction = useAuthStore((state) => state.login); // Obtém a ação de login do store
  const router = useRouter(); // Usa o router do Next.js

  // ADICIONADO: Funções de handle para login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); // Adicionado para prevenir o recarregamento da página
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          cnpj: loginCNPJ, 
          senha: loginSenha,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Atualiza o store com os dados do usuário
        loginAction(data.user);
        
        // --- CORREÇÃO: Fecha o diálogo via estado ---
        setIsDialogOpen(false);
        
        // Redireciona para a página de pós-login
        router.push("/pos-login");
        
      } else {
        alert("Erro no login: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao tentar fazer login. Verifique sua conexão e tente novamente.");
    }
  }

  return (
    // --- CORREÇÃO: Controla o diálogo com o estado ---
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="social-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-6 h-6 text-white" viewBox="0 0 16 16">
            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
            <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
          </svg>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-gray-950 text-gray-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-neutral-100">Acesso Restrito</DialogTitle>

          <DialogClose asChild>
            <Button
              className="cursor-pointer bg-gray-950 absolute right-3 top-3 text-neutral-400 hover:bg-fuchsia-800 transition-colors"
              aria-label="Fechar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
          </DialogClose>
        </DialogHeader>


        <p className="text-neutral-400 italic font-light text-center">Apenas usuários que já realizaram o diagnóstico e adquiriram um plano podem acessar.</p>


        <form className="grid gap-4 py-4" onSubmit={handleLogin}>
          <div className="grid gap-2">
            <Label htmlFor="login-email" className="text-neutral-400">
              Email
            </Label>
            <Input id="login-email" type="email" placeholder="email@exemplo.com" className="bg-gray-800 border-gray-700 text-white" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="login-cnpj" className="text-neutral-400">CNPJ</Label>
            <Input id="login-cnpj" type="text" placeholder="00.000.000/0000-00" className="bg-gray-800 border-gray-700 text-white" value={loginCNPJ} onChange={(e) => setLoginCNPJ(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="login-password" className="text-neutral-400">Senha</Label>
            <Input id="login-password" type="password" placeholder="••••••••••••••" className="bg-gray-800 border-gray-700 text-white" value={loginSenha} onChange={(e) => setLoginSenha(e.target.value)} />
          </div>
          <Button type="submit" className="bg-fuchsia-800 text-white hover:bg-fuchsia-700 cursor-pointer">
            Entrar
          </Button>
        </form>


        <DialogFooter className="sm:justify-center">
          <p className="text-neutral-400 italic font-light text-center">
            Ainda não tem acesso? <Link href="/form" className="text-fuchsia-400 hover:underline">Faça o diagnóstico gratuito</Link> e adquira um plano.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type HeadernaofixProps = {
  Link: string
}

export function Headernaofix({ Link }: HeadernaofixProps) {
  return (
    <div className="py-4 flex-row justify-items-center">
      <div className="logo-container hover:scale-100 ">

        <a href={Link}>
          <Image
            src="/img/logo.png"
            alt="EchoNova - Diagnóstico Inteligente de Treinamentos"
            width={120}
            height={40}
            className="w-auto object-contain h-12 sm:h-14 md:h-14 lg:h-16"
          />
        </a>
      </div>
    </div>
  )
}