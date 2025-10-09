// app/chat/page.tsx
"use client";

import { useState } from "react";

export default function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse("");
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Ocorreu um erro na requisição.");
      }

      const data = await res.json();
      setResponse(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-10 px-4 font-sans">
      <h1 className="text-3xl font-bold text-center text-white mb-6">
        Pergunte para a IA
      </h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Digite sua pergunta aqui..."
          disabled={isLoading}
          className="w-full p-3 text-base text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Pensando..." : "Enviar Pergunta"}
        </button>
      </form>

      {/* Seção para exibir a resposta */}
      {response && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Resposta:</h2>
          {/* A classe whitespace-pre-wrap preserva as quebras de linha da resposta da IA */}
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{response}</p>
        </div>
      )}

      {/* Seção para exibir erros */}
      {error && (
        <div
          className="mt-6 p-4 border border-red-400 rounded-lg bg-red-50 text-red-700"
          role="alert"
        >
          <h2 className="text-lg font-semibold">Erro:</h2>
          <p className="mt-2">{error}</p>
        </div>
      )}
    </div>
  );
}
