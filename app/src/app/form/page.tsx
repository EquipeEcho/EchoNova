"use client";
import Image from "next/image";
import { useDiagnostico, perguntasDiagnostico, Pergunta, RespostasDiagnostico } from "./PerfilDesafioObjetivo";

// Componente da barra de progresso
function ProgressBar({ etapaAtual, totalEtapas }: { etapaAtual: number; totalEtapas: number }) {
  const porcentagem = Math.round(((etapaAtual + 1) / totalEtapas) * 100);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-white text-sm font-medium">
          Pergunta {etapaAtual + 1} de {totalEtapas}
        </span>
        <span className="text-white text-sm">
          {porcentagem}%
        </span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${porcentagem}%` }}
        ></div>
      </div>
    </div>
  );
}

// Componente dos campos de input
function InputField({ pergunta, valor, onChange, respostas }: {
  pergunta: Pergunta;
  valor: string;
  onChange: (campo: keyof RespostasDiagnostico, valor: string) => void
  respostas: RespostasDiagnostico;
}) {
  const mostraTextAreaOutros = pergunta.temOutros && valor === "outros";

  switch (pergunta.tipo) {
    case "texto":
      return (
        <input
          type="text"
          value={valor}
          onChange={(e) => onChange(pergunta.id, e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center"
          placeholder={pergunta.placeholder}
          autoFocus
        />
      );
    case "select":
      return (
        <div className="space-y-4">
          <select
            value={valor}
            onChange={(e) => onChange(pergunta.id, e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center"
            autoFocus={!mostraTextAreaOutros}
          >
            {pergunta.opcoes?.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor} className="text-gray-800 bg-white">
                {opcao.texto}
              </option>
            ))}
          </select>

          {/* Textarea adicional para "outros" */}
          {mostraTextAreaOutros && pergunta.campoOutros && (
            <div className="animate-fade-in-up">
              <label className="block text-white text-sm font-medium mb-2">
                Por favor, especifique:
              </label>
              <textarea
                value={respostas[pergunta.campoOutros]}
                onChange={(e) => onChange(pergunta.campoOutros!, e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="Descreva qual é o setor da sua empresa..."
                rows={3}
                autoFocus
              />
            </div>
          )}
        </div>
      ); 
    case "textarea":
      return (
        <textarea
          value={valor}
          onChange={(e) => onChange(pergunta.id, e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          placeholder={pergunta.placeholder}
          rows={pergunta.rows || 4}
          autoFocus
        />
      );
    case "radio":
      return (
        <div className="space-y-3">
          {pergunta.opcoes?.map((opcao) => (
            <label key={opcao.valor} className="flex items-center text-white cursor-pointer p-3 rounded-lg hover:bg-white/10 transition-colors">
              <input
                type="radio"
                name={pergunta.id}
                value={opcao.valor}
                checked={valor === opcao.valor}
                onChange={(e) => onChange(pergunta.id, e.target.value)}
                className="mr-3 w-4 h-4 text-pink-500 focus:ring-pink-500 focus:ring-2"
              />
              <span className="text-lg">{opcao.texto}</span>
            </label>
          ))}
        </div>
      );
    default:
      return null;
  }
}

// Componente dos botões de navegação
function NavigationButtons({
  etapaAtual,
  totalEtapas,
  podeAvancar,
  onProximo,
  onAnterior,
  onSubmit
}: {
  etapaAtual: number;
  totalEtapas: number;
  podeAvancar: boolean;
  onProximo: () => void;
  onAnterior: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const ehUltimaEtapa = etapaAtual === totalEtapas - 1;

  return (
    <div className="flex justify-between items-center pt-6">
      <button
        type="button"
        onClick={onAnterior}
        disabled={etapaAtual === 0}
        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${etapaAtual === 0
            ? "bg-gray-500/50 text-gray-400 cursor-not-allowed"
            : "bg-white/20 text-white hover:bg-white/30 transform hover:scale-105"
          }`}
      >
        Anterior
      </button>

      {ehUltimaEtapa ? (
        <button
          onClick={onSubmit}
          disabled={!podeAvancar}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${podeAvancar
              ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl"
              : "bg-gray-500/50 text-gray-400 cursor-not-allowed"
            }`}
        >
          Finalizar Diagnóstico
        </button>
      ) : (
        <button
          type="button"
          onClick={onProximo}
          disabled={!podeAvancar}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${podeAvancar
              ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl"
              : "bg-gray-500/50 text-gray-400 cursor-not-allowed"
            }`}
        >
          Próxima
        </button>
      )}
    </div>
  );
}

// Componente principal da página
export default function DiagnosticoPage() {
  // Hook customizado para gerenciar o estado do diagnóstico
  const {
    etapaAtual,
    respostas,
    handleInputChange,
    proximaEtapa,
    etapaAnterior,
    handleSubmit
  } = useDiagnostico();

  // Pergunta atual e validações
  const perguntaAtual = perguntasDiagnostico[etapaAtual];
  const valorAtual = respostas[perguntaAtual.id];
  // Validação: se for "outros" e tiver campo adicional, valida ambos
  let podeAvancar = true;
  if (perguntaAtual.required) {
    podeAvancar = valorAtual.trim() !== "";

    // Se selecionou "outros" e tem campo adicional, valida o campo adicional também
    if (perguntaAtual.temOutros && valorAtual === "outros" && perguntaAtual.campoOutros) {
      const valorOutros = respostas[perguntaAtual.campoOutros];
      podeAvancar = podeAvancar && valorOutros.trim() !== "";
    }
  }  

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl relative overflow-hidden">

        {/* Barra de progresso */}
        <ProgressBar
          etapaAtual={etapaAtual}
          totalEtapas={perguntasDiagnostico.length}
        />

        {/* Header com logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/img/logo.png"
              alt="EchoNova - Diagnóstico Inteligente"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Diagnóstico Empresarial
          </h1>
        </div>

        {/* Pergunta atual */}
        <div className="mb-8 min-h-[200px] flex flex-col justify-center">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-6 text-center leading-relaxed">
            {perguntaAtual.titulo}
          </h2>

          {/* Campo de input baseado no tipo */}
          <div className="space-y-4">
            <InputField
              pergunta={perguntaAtual}
              valor={valorAtual}
              onChange={handleInputChange}
              respostas={respostas}
            />
          </div>
        </div>

        {/* Botões de navegação */}
        <NavigationButtons
          etapaAtual={etapaAtual}
          totalEtapas={perguntasDiagnostico.length}
          podeAvancar={podeAvancar}
          onProximo={() => proximaEtapa(perguntasDiagnostico)}
          onAnterior={etapaAnterior}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}