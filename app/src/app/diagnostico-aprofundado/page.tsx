"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Headernaofix, Ondas } from "../clientFuncs";

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
            type="text" // 1. Mudamos para "text" para ter controle total do estilo
            inputMode="numeric" // 2. Mostra o teclado numérico em celulares
            pattern="[0-9]*" // 3. Padrão para validação (opcional, mas bom ter)
            value={resposta}
            onChange={(e) => {
              // 4. Filtra e permite apenas a entrada de números
              const numericValue = e.target.value.replace(/[^0-9]/g, "");
              setResposta(numericValue);
            }}
            placeholder="Digite um número..."
            className="bg-slate-700 border-slate-500 text-center text-lg" // O estilo visual permanece o mesmo
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
            <Select value={resposta} onValueChange={(value) => setResposta(value)}>
              <SelectTrigger className="w-full max-w-xs h-auto py-3 text-lg bg-slate-700 border-slate-500 focus:ring-pink-500">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                {pergunta.opcoes?.map((opt) => (
                  <SelectItem
                    key={opt}
                    value={opt}
                    // AQUI ESTÁ A MÁGICA: Cor de foco/hover rosa
                    className="focus:bg-[#ff0055]/20 focus:text-white cursor-pointer"
                  >
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              className="bg-[#ff0055] hover:bg-[#b2003b] text-white"
            >
              Sim
            </Button>
            <Button
              onClick={() => processarResposta("Não")}
              size="lg"
              // variant="outline" // Variante de contorno para diferenciação
              className="bg-[#ff0055] hover:bg-[#b2003b] text-white"
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
      return <Loader text="Carregando..." />;
    }
    if (diagnostico.status === "finalizado" && diagnostico.relatorio_final) {
      return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-4 border-b border-slate-600 pb-2">
            Diagnóstico Concluído
          </h1>
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown>{diagnostico.relatorio_final}</ReactMarkdown>
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
                  <Button type="submit" size="lg" disabled={!resposta.trim()} className="bg-[#ff0055] hover:bg-[#b2003b] text-white">
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
    <main className="min-h-screen text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <Headernaofix Link="/teste" />
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
            {error}
          </div>
        )}
        {renderContent()}
      </div>
      <div className="-z-10">
        <Ondas />
      </div>
    </main>
  );
}