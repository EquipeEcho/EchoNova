// app/diagnostico-aprofundado/page.tsx
"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- INTERFACES DE DADOS PARA O FRONTEND ---

interface Pergunta {
  texto: string;
  tipo_resposta:
  | "texto"
  | "numero"
  | "multipla_escolha"
  | "selecao"
  | "sim_nao";
  opcoes: string[] | null;
}

interface DiagnosticoState {
  status: "carregando" | "perguntando" | "confirmando" | "finalizado";
  pergunta_atual: Pergunta | null;
  resumo_etapa: string | null;
  relatorio_final: string | null;
}

export default function DiagnosticoAprofundadoPage() {
  // --- ESTADOS (STATES) DA PÁGINA ---
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoState>({
    status: "carregando",
    pergunta_atual: null,
    resumo_etapa: null,
    relatorio_final: null,
  });
  const [resposta, setResposta] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // --- FUNÇÕES DE COMUNICAÇÃO E LÓGICA ---

  const processarResposta = async (respostaUsuario: string | null) => {
    setDiagnostico((prev) => ({ ...prev, status: "carregando" }));
    setError(null);

    try {
      const res = await fetch("/api/diagnostico-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          resposta_usuario: respostaUsuario,
          empresaId: "60d5ecb4b39e3a001f3e8a9c", // Placeholder
        }),
      });

      if (!res.ok) throw new Error("Falha na comunicação com o servidor.");

      const data = await res.json();

      if (!sessionId) setSessionId(data.sessionId);

      if (data.status === "finalizado") {
        setDiagnostico({
          status: "finalizado",
          relatorio_final: data.relatorio_final,
          pergunta_atual: null,
          resumo_etapa: null,
        });
      } else if (data.status === "confirmacao") {
        setDiagnostico({
          status: "confirmando",
          resumo_etapa: data.resumo_etapa,
          pergunta_atual: null,
          relatorio_final: null,
        });
      } else {
        setDiagnostico({
          status: "perguntando",
          pergunta_atual: data.proxima_pergunta,
          resumo_etapa: null,
          relatorio_final: null,
        });
      }
    } catch (err: any) {
      setError(err.message);
      setDiagnostico((prev) => ({ ...prev, status: "perguntando" }));
    } finally {
      setResposta("");
    }
  };

  useEffect(() => { processarResposta(null) }, []);

  // --- RENDERIZAÇÃO DOS COMPONENTES DE INPUT ---

  const renderInput = (pergunta: Pergunta) => {
    switch (pergunta.tipo_resposta) {
      case "texto":
        return (
          <Input
            type="text"
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            placeholder="Digite sua resposta..."
            className="bg-slate-700 border-slate-500 text-center text-lg"
            autoFocus
          />
        );
      case "numero":
        return (
          <Input
            type="number"
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            placeholder="Digite um número..."
            className="bg-slate-700 border-slate-500 text-center text-lg"
            autoFocus
          />
        );
      case "multipla_escolha":
        return (
          <div className="flex flex-col gap-3">
            {pergunta.opcoes?.map((opt) => (
              <Button
                key={opt}
                variant="outline"
                size="lg"
                onClick={() => processarResposta(opt)}
                className="justify-center h-auto py-3 whitespace-normal"
              >
                {opt}
              </Button>
            ))}
          </div>
        );
      case "selecao":
        return (
          <div className="flex flex-col items-center gap-4">
            <select
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              className="w-full max-w-xs px-4 py-3 rounded-lg bg-slate-700 border border-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center"
            >
              <option value="" disabled>
                Selecione uma opção
              </option>
              {pergunta.opcoes?.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  className="bg-slate-800 text-white"
                >
                  {opt}
                </option>
              ))}
            </select>
            <Button type="submit" size="lg" disabled={!resposta}>
              Próximo
            </Button>
          </div>
        );
      case "sim_nao":
        return (
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => processarResposta("Sim")}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              Sim
            </Button>
            <Button
              onClick={() => processarResposta("Não")}
              size="lg"
              variant="destructive"
            >
              Não
            </Button>
          </div>
        );
      default:
        return (
          <p className="text-red-400">
            Tipo de pergunta não suportado: {pergunta.tipo_resposta}
          </p>
        );
    }
  };

  // --- RENDERIZAÇÃO PRINCIPAL DA PÁGINA ---

  const renderContent = () => {
    if (diagnostico.status === "carregando") {
      return (
        <div className="text-center text-lg">
          Carregando ...
        </div>
      );
    }
    if (diagnostico.status === "finalizado" && diagnostico.relatorio_final) {
      return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-4 border-b border-slate-600 pb-2">
            Diagnóstico Concluído
          </h1>
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown>{diagnostico.relatorio_final}</ReactMarkdown> // Resposta em Markdown gerada por IA
          </div>
        </div>
      );
    }
    if (diagnostico.status === "confirmando" && diagnostico.resumo_etapa) {
      return (
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl text-center space-y-6">
          <h2 className="text-2xl font-semibold">
            Por favor, confirme os dados
          </h2>
          <div className="text-left p-4 bg-slate-700 rounded-md border border-slate-600">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{diagnostico.resumo_etapa}</ReactMarkdown>
            </div>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Button
              onClick={() => processarResposta("Sim")}
              size="lg"
              className="bg-green-600 hover:bg-green-700">
              Confirmar e Continuar
            </Button>
            <Button
              onClick={() => processarResposta("Não")}
              size="lg"
              variant="destructive">
              Corrigir Informações
            </Button>
          </div>
        </div>
      );
    }
    if (diagnostico.status === "perguntando" && diagnostico.pergunta_atual) {
      const pergunta = diagnostico.pergunta_atual;
      return (
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl text-center space-y-8">
          <h2 className="text-2xl font-semibold leading-relaxed">
            {pergunta.texto}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (resposta.trim()) processarResposta(resposta);
            }}
          >
            <div className="space-y-4">
              {renderInput(pergunta)}
              {(pergunta.tipo_resposta === "texto" ||
                pergunta.tipo_resposta === "numero") && (
                  <Button type="submit" size="lg" disabled={!resposta.trim()}>
                    Próximo
                  </Button>
                )}
            </div>
          </form>
        </div>
      );
    }
    return (
      <p>
        Ocorreu um erro ou o estado é inválido. Por favor, atualize a página.
      </p>
    );
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
            {error}
          </div>
        )}
        {renderContent()}
      </div>
    </main>
  );
}
