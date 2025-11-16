"use client";
// no hooks needed here
import { Headernaofix, Ondas } from "../clientFuncs";
import { CheckIcon, StarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PlanosPage() {
  // removed hover-tracking state (unused) to avoid static-element-interaction lints
  const router = useRouter();

  const planos = [
    {
      nome: "Essencial",
      preco: "590",
      periodo: "mês",
      descricao: "Inclui uma trilha personalizada por mês, diagnóstico inicial, relatório com roteiro de aplicação e materiais de apoio prontos para uso interno.",
      recursos: [
        "1 trilha personalizada mensal",
        "Diagnóstico inicial completo",
        "Relatório detalhado com roteiro",
        "Materiais de apoio inclusos",
        "Suporte por email",
        "Acesso por 30 dias"
      ],
      popular: false,
      cor: "from-indigo-500 to-purple-600"
    },
    {
      nome: "Avançado",
      preco: "990",
      periodo: "mês",
      descricao: "Inclui todos os benefícios do plano Essencial, acrescido de acompanhamento estratégico com um especialista e reunião mensal com o RH para aprofundamento e alinhamento.",
      recursos: [
        "Tudo do plano Essencial",
        "Acompanhamento estratégico especializado",
        "Reunião mensal com RH",
        "Consultoria personalizada",
        "Suporte prioritário",
        "Relatórios avançados",
        "Acesso por 60 dias"
      ],
      popular: true,
      cor: "from-fuchsia-500 to-pink-600"
    },
    {
      nome: "Escalado",
      preco: "Sob Consulta",
      periodo: "",
      descricao: "Voltado para empresas com múltiplos times ou trilhas simultâneas. Inclui personalização profunda, múltiplos diagnósticos por equipe e roteiros adaptados a perfis diversos.",
      recursos: [
        "Múltiplas trilhas simultâneas",
        "Personalização profunda",
        "Diagnósticos por equipe",
        "Roteiros adaptados por perfil",
        "Gestão dedicada de conta",
        "Integração com sistemas internos",
        "Suporte 24/7",
        "Acesso ilimitado"
      ],
      popular: false,
      cor: "from-emerald-500 to-teal-600"
    }
  ];

  // Função de transação
  async function iniciarTransacao(plano: string) {
    const empresaId = localStorage.getItem("empresaId");
    const dadosQuestionario = localStorage.getItem("dadosQuestionario");

    if (!empresaId && !dadosQuestionario) {
      alert("Empresa não identificada. Refaça o diagnóstico.");
      return;
    }

    try {
      const planoNormalizado = plano
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // remove acentos

      const response = await fetch("/api/transacoes/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresaId, plano: planoNormalizado }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao iniciar transação");

      console.log("Transação iniciada:", data);

      // Redireciona para pagamento com os dados do plano
      router.push(
        `/pagamento?plano=${encodeURIComponent(plano)}&preco=${data.valor}&transacaoId=${data.transacaoId}`
      );
    } catch (error) {
      console.error("Erro ao iniciar transação:", error);
      alert("Erro ao iniciar transação. Tente novamente.");
    }
  }

  return (
    <main className="flex flex-col overflow-hidden min-h-screen">
      <Headernaofix Link="" />

      <section className="flex-1 main-bg flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-10 relative">
        {/* Título principal */}
        <div className="text-center mb-20">
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight max-w-4xl text-white mb-8 sm:mb-10 md:mb-12 animate-fade-in-up">
            Planos e Assinaturas
          </h1>

          {/* Diagnóstico */}
          <div className="bg-linear-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 max-w-3xl mx-auto border border-green-400/30 animate-fade-in-up-delay shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-green-400 font-bold text-lg">Diagnóstico Concluído</span>
              <svg aria-hidden="true" focusable="false" className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/90 leading-relaxed">
              Agora que você conhece os desafios e oportunidades da sua empresa, escolha o plano ideal
              para receber trilhas personalizadas e acelerar o desenvolvimento da sua equipe.
            </p>
          </div>
        </div>

        {/* Cards dos planos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full max-w-7xl animate-fade-in-up-delay-2">
          {planos.map((plano, index) => (
            <div
              key={index}
              className={`relative bg-slate-900/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-slate-700/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl group flex flex-col h-full cursor-pointer ${
                plano.nome === "Essencial"
                  ? "hover:border-indigo-400/80 hover:shadow-indigo-400/50"
                  : plano.nome === "Avançado"
                  ? "hover:border-fuchsia-400/80 hover:shadow-fuchsia-400/50"
                  : "hover:border-emerald-400/80 hover:shadow-emerald-400/50"
              }`}
              style={{
                animationDelay: `${index * 200}ms`,
                animation: "fadeInUp 0.8s ease-out both",
              }}
            >
              {/* Brilho hover */}
              <div className="absolute inset-0 bg-slate-800/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              {/* Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`bg-linear-to-r text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg ${plano.nome === 'Essencial' ? 'from-indigo-500 via-purple-500 to-indigo-600' :
                  plano.nome === 'Avançado' ? 'from-fuchsia-500 via-pink-500 to-purple-600' :
                    'from-emerald-500 via-teal-500 to-emerald-600'
                  }`}>
                  <StarIcon className="w-4 h-4" />
                  {plano.popular ? "Mais Popular" : plano.nome}
                  <StarIcon className="w-4 h-4" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-8 relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br ${plano.cor} mb-4 shadow-lg`}>
                  <svg aria-hidden="true" focusable="false" className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">{plano.nome}</h3>
                <div className="mb-6">
                  {plano.preco === "Sob Consulta" ? (
                    <div className="text-center">
                      <span className="text-2xl font-bold text-white block">Sob</span>
                      <span className="text-3xl font-bold bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Consulta</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-xl text-gray-300">R$</span>
                      <span className="text-5xl font-bold bg-linear-to-r from-white to-gray-200 bg-clip-text text-transparent">{plano.preco}</span>
                      <span className="text-lg text-gray-300">/{plano.periodo}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-300 text-base leading-relaxed px-2">{plano.descricao}</p>
              </div>

              {/* Recursos */}
              <div className="mb-8 relative z-10 flex-1">
                <h4 className="text-white font-semibold mb-4 text-center">✨ Recursos Inclusos</h4>
                <ul className="space-y-4">
                  {plano.recursos.map((recurso, recursoIndex) => (
                    <li key={recursoIndex} className="flex items-start gap-3 group/item">
                      <div className={`bg-linear-to-r ${plano.cor} p-1.5 rounded-xl shrink-0 mt-0.5 shadow-md group-hover/item:scale-110 transition-transform duration-300`}>
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-200 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-300">
                        {recurso}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botão */}
              <div className="text-center relative z-10 mt-auto">
                <button
                  type="button"
                  onClick={() => iniciarTransacao(plano.nome)}
                  className={`block w-full bg-linear-to-r ${plano.cor} text-white font-bold py-4 px-6 rounded-2xl border-0 relative overflow-hidden group/btn hover:shadow-2xl transform transition-all duration-500 ${plano.popular ? 'hover:scale-105' : 'hover:scale-102'}`}
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {plano.preco === "Sob Consulta" ? (
                      <>
                        <svg aria-hidden="true" focusable="false" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Solicitar Orçamento
                      </>
                    ) : (
                      <>
                        <svg aria-hidden="true" focusable="false" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Escolher {plano.nome}
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="-z-10">
          <Ondas />
        </div>
      </section>
    </main>
  );
}
