// app/src/app/form/page.tsx

"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import DiagnosticoPage from "./utils";
import { perguntasPerfil, RespostasPerfil } from "./Perfil";
import { perguntasPC, RespostasPC } from "./PessoasCultura";
import { perguntasEO, RespostasEO } from "./EstruturaOperacoes";
import { perguntasMC, RespostasMC } from "./MercadoClientes";
import { perguntasDF, RespostasDF } from "./DirecaoFuturo";

// --- PASSO 1: IMPORTE O LOADER E O SONNER (PARA NOTIFICAÇÕES) ---
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";


type DimensaoRespostas = {
    "Pessoas e Cultura": RespostasPC;
    "Estrutura e Operações": RespostasEO;
    "Direção e Futuro": RespostasDF;
    "Mercado e Clientes": RespostasMC;
};

type Dimensao = keyof DimensaoRespostas;

export default function Diagnostico() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // --- PASSO 2: ADICIONE O ESTADO DE LOADING ---
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Fase do diagnóstico
    const [fase, setFase] = useState<"perfil" | "selecionarDimensoes" | "dimensao">("perfil");

    // Dimensões selecionadas pelo usuário
    const [dimensoesSelecionadas, setDimensoesSelecionadas] = useState<Dimensao[]>([]);

    // Dimensão atual que está sendo preenchida
    const [indiceDimensaoAtual, setIndiceDimensaoAtual] = useState(0);

  // Estado das respostas
  const [respostasPerfil, setRespostasPerfil] = useState<RespostasPerfil>({
    empresa: "",
    email: "",
    cnpj: "",
    setor: "",
    porte: "",
    setorOutro: "",
  });


  const [respostasDimensoes, setRespostasDimensoes] =
    useState<DimensaoRespostas>({
      "Pessoas e Cultura": {
        pergunta1: "",
        pergunta2: "",
        pergunta3: "",
        pergunta4: "",
        pergunta5: "",
        pergunta6: "",
      },
      "Estrutura e Operações": {
        pergunta1: "",
        pergunta2: "",
        pergunta3: "",
        pergunta4: "",
        pergunta5: "",
        pergunta6: "",
      },
      "Direção e Futuro": {
        pergunta1: "",
        pergunta2: "",
        pergunta3: "",
        pergunta4: "",
        pergunta5: "",
        pergunta6: "",
      },
      "Mercado e Clientes": {
        pergunta1: "",
        pergunta2: "",
        pergunta3: "",
        pergunta4: "",
        pergunta5: "",
        pergunta6: "",
      },
    });


  // Função para lidar com o envio do perfil
  const handlePerfilSubmit = async (respostas: RespostasPerfil) => {
    try {
      const response = await fetch("/api/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perfil: respostas }),
      });

      const data = await response.json();

      if (response.ok && data.empresa?._id) {
        localStorage.setItem("empresaId", data.empresa._id);
        console.log("empresaId salvo:", data.empresa._id);
        setRespostasPerfil(respostas);
        setFase("selecionarDimensoes");
      } else {
        toast.error(data.error || "Erro ao cadastrar empresa. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro de conexão ao cadastrar empresa:", error);
      toast.error("Não foi possível se conectar ao servidor.");
    }
  };


    const handleDimensaoSubmit = (respostas: DimensaoRespostas[Dimensao]) => {
        const dimAtual = dimensoesSelecionadas[indiceDimensaoAtual];
        const novasRespostasDimensoes = {
            ...respostasDimensoes,
            [dimAtual]: respostas
        } as DimensaoRespostas;
        setRespostasDimensoes(novasRespostasDimensoes);
        proximaDimensao(novasRespostasDimensoes);
    };

    const proximaDimensao = async (respostasAtualizadas?: DimensaoRespostas) => {
        if (indiceDimensaoAtual < dimensoesSelecionadas.length - 1) {
            setIndiceDimensaoAtual(indiceDimensaoAtual + 1);
        } else {
            const respostasFinais = respostasAtualizadas || respostasDimensoes;
            console.log("Finalizado. Enviando para salvar:", { respostasPerfil, respostasDimensoes: respostasFinais });
            await salvarDiagnostico(respostasFinais);
        }
    };

    // --- PASSO 3: MODIFIQUE A FUNÇÃO salvarDiagnostico ---
    const salvarDiagnostico = async (respostasFinais: DimensaoRespostas) => {
        setIsLoading(true); // ATIVA O LOADING AQUI

        try {
            const respostasFiltradas: any = {};
            dimensoesSelecionadas.forEach(dim => {
                respostasFiltradas[dim] = respostasFinais[dim];
            });

            const response = await fetch('/api/diagnosticos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    perfil: respostasPerfil,
                    dimensoesSelecionadas,
                    respostasDimensoes: respostasFiltradas
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Diagnóstico gerado com sucesso!");
                router.push(`/resultados?id=${data.diagnostico._id}`);
            } else {
                throw new Error(data.error || "Erro ao salvar diagnóstico.");
            }
        } catch (error: any) {
            console.error('Erro de conexão ou API:', error);
            toast.error(error.message);
            salvarLocalStorage(respostasFinais); // Mantém o fallback
            setIsLoading(false); // DESATIVA O LOADING EM CASO DE ERRO
        }
    };

    const salvarLocalStorage = (respostasFinais: DimensaoRespostas) => {
        const diagnosticoCompleto = {
            perfil: respostasPerfil,
            dimensoes: respostasFinais,
            dimensoesSelecionadas,
            dataFinalizacao: new Date().toISOString()
        };
        localStorage.setItem('diagnosticoCompleto', JSON.stringify(diagnosticoCompleto));
        router.push('/resultados'); // Redireciona mesmo com fallback
    };

    const toggleDimensao = (d: Dimensao) => {
        if (dimensoesSelecionadas.includes(d)) {
            setDimensoesSelecionadas(dimensoesSelecionadas.filter(x => x !== d));
        } else if (dimensoesSelecionadas.length < 3) {
            setDimensoesSelecionadas([...dimensoesSelecionadas, d]);
        }
    };

    // --- PASSO 4: ADICIONE A RENDERIZAÇÃO CONDICIONAL PARA O LOADING ---
    if (isLoading) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-8">
                <Loader text="Gerando relatório..." />
            </main>
        );
    }

    // O resto da sua lógica de renderização permanece a mesma
    if (fase === "perfil") {
        return (
            <DiagnosticoPage
                perguntas={perguntasPerfil}
                respostasIniciais={respostasPerfil}
                titulo="Perfil"
                onSubmit={handlePerfilSubmit}
            />
        );
    }

  if (fase === "selecionarDimensoes") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-8 relative">
        <Link
          href="/"
          className="absolute top-6 left-6 z-10 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="hidden sm:inline">Home</span>
        </Link>
        <h1 className="text-2xl font-bold mb-6">Escolha até 3 dimensões</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-2xl">
          {(
            [
              {
                id: "Pessoas e Cultura",
                nome: "Pessoas & Cultura",
                codigo: "PC",
              },
              {
                id: "Estrutura e Operações",
                nome: "Estrutura e Operações",
                codigo: "EO",
              },
              {
                id: "Direção e Futuro",
                nome: "Direção e Futuro",
                codigo: "DF",
              },
              {
                id: "Mercado e Clientes",
                nome: "Mercado e Clientes",
                codigo: "MC",
              },
            ] as { id: Dimensao; nome: string; codigo: string }[]
          ).map((dimensao) => (
            <button
              key={dimensao.id}
              onClick={() => toggleDimensao(dimensao.id)}
              className={`px-6 py-4 rounded-lg font-semibold border transition-all duration-300 text-center ${dimensoesSelecionadas.includes(dimensao.id)
                ? "bg-pink-600 border-pink-500 text-white transform scale-105 shadow-lg"
                : "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50"
                }`}
            >
              <div className="text-lg font-bold mb-1">{dimensao.codigo}</div>
              <div className="text-sm opacity-90">{dimensao.nome}</div>
            </button>
          ))}
        </div>
        <p className="text-white/80 mb-4 text-center">
          Dimensões selecionadas: {dimensoesSelecionadas.length}/3
        </p>
        <button
          onClick={() => setFase("dimensao")}
          disabled={dimensoesSelecionadas.length === 0}
          className="cursor-pointer px-8 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
        >
          Começar Diagnóstico
        </button>
      </div>
    );
  }

    if (fase === "dimensao") {
        const dimAtual = dimensoesSelecionadas[indiceDimensaoAtual];
        const isUltimaDimensao = indiceDimensaoAtual === dimensoesSelecionadas.length - 1;
        let perguntas: any[] = [];
        let respostasIniciais = respostasDimensoes[dimAtual];
        let titulo = "";

        switch (dimAtual) {
            case "Pessoas e Cultura":
                perguntas = perguntasPC;
                titulo = "Pessoas & Cultura";
                break;
            case "Estrutura e Operações":
                perguntas = perguntasEO;
                titulo = "Estrutura e Operações";
                break;
            case "Mercado e Clientes":
                perguntas = perguntasMC;
                titulo = "Mercado e Clientes";
                break;
            case "Direção e Futuro":
                perguntas = perguntasDF;
                titulo = "Direção e Futuro";
                break;
        }

        return (
            <DiagnosticoPage
                key={`dimensao-${indiceDimensaoAtual}-${dimAtual}`}
                perguntas={perguntas}
                respostasIniciais={respostasIniciais}
                titulo={titulo}
                onSubmit={handleDimensaoSubmit}
                isUltimaDimensao={isUltimaDimensao}
            />
        );
    }

    return null;
}