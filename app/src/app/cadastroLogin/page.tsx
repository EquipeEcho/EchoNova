"use client";

import { LoginForm } from "@/components/ui/LoginForm"; // Importe o novo componente

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl shadow-lg p-6">
      <h2 className="text-white text-xl font-semibold mb-4 text-center">Bem-vindo</h2>
      <p className="text-neutral-400 text-sm text-center mb-6">
        Digite seu e-mail ou CNPJ para acessar.
      </p>

      {/* Use o componente reutilizável aqui */}
      <LoginForm />

      <p className="text-neutral-500 text-xs mt-6 text-center">
        Caso não tenha uma conta, realize o diagnóstico inicial para se cadastrar.
      </p>
    </div>
  );
}