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

    // Fase do diagnóstico
    const [fase, setFase] = useState<"perfil" | "selecionarDimensoes" | "dimensao">("perfil");

    // Dimensões selecionadas pelo usuário
    const [dimensoesSelecionadas, setDimensoesSelecionadas] = useState<Dimensao[]>([]);

    // Dimensão atual que está sendo preenchida
    const [indiceDimensaoAtual, setIndiceDimensaoAtual] = useState(0);

    // Estado das respostas
    const [respostasPerfil, setRespostasPerfil] = useState<RespostasPerfil>({
        empresa: "",
        setor: "",
        porte: "",
        setorOutro: "",
    });

    const [respostasDimensoes, setRespostasDimensoes] = useState<DimensaoRespostas>({
        "Pessoas e Cultura": { pergunta1: "", pergunta2: "", pergunta3: "", pergunta4: "", pergunta5: "", pergunta6: "" },
        "Estrutura e Operações": { pergunta1: "", pergunta2: "", pergunta3: "", pergunta4: "", pergunta5: "", pergunta6: "" },
        "Direção e Futuro": { pergunta1: "", pergunta2: "", pergunta3: "", pergunta4: "", pergunta5: "", pergunta6: "" },
        "Mercado e Clientes": { pergunta1: "", pergunta2: "", pergunta3: "", pergunta4: "", pergunta5: "", pergunta6: "" },
    });

    // Função para lidar com o envio do perfil
    const handlePerfilSubmit = (respostas: RespostasPerfil) => {
        setRespostasPerfil(respostas);
        setFase("selecionarDimensoes");
    };

    // Função para lidar com o envio das dimensões
    const handleDimensaoSubmit = (respostas: DimensaoRespostas[Dimensao]) => {
        const dimAtual = dimensoesSelecionadas[indiceDimensaoAtual];
        const novasRespostasDimensoes = {
            ...respostasDimensoes,
            [dimAtual]: respostas
        } as DimensaoRespostas;
        
        setRespostasDimensoes(novasRespostasDimensoes);
        proximaDimensao(novasRespostasDimensoes);
    };

    // Função para avançar para a próxima dimensão
    const proximaDimensao = (respostasAtualizadas?: DimensaoRespostas) => {
        if (indiceDimensaoAtual < dimensoesSelecionadas.length - 1) {
            setIndiceDimensaoAtual(indiceDimensaoAtual + 1);
        } else {
            // Finalizou todas as dimensões - redirecionar para página de resultados
            const respostasFinais = respostasAtualizadas || respostasDimensoes;
            console.log("Respostas finais:", { respostasPerfil, respostasDimensoes: respostasFinais });
            
            // Salvar dados no localStorage para acessar na página de resultados
            localStorage.setItem('diagnosticoCompleto', JSON.stringify({
                perfil: respostasPerfil,
                dimensoes: respostasFinais,
                dimensoesSelecionadas,
                dataFinalizacao: new Date().toISOString()
            }));
            
            // Redirecionar para página de resultados
            router.push('/resultados');
        }
    };

    // Função para selecionar dimensões (máx 3)
    const toggleDimensao = (d: Dimensao) => {
        if (dimensoesSelecionadas.includes(d)) {
            setDimensoesSelecionadas(dimensoesSelecionadas.filter(x => x !== d));
        } else if (dimensoesSelecionadas.length < 3) {
            setDimensoesSelecionadas([...dimensoesSelecionadas, d]);
        }
    };

    // Renderização
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
                {/* Botão Home no canto superior esquerdo */}
                <Link 
                    href="/" 
                    className="absolute top-6 left-6 z-10 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="hidden sm:inline">Home</span>
                </Link>
                <h1 className="text-2xl font-bold mb-6">Escolha até 3 dimensões</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-2xl">
                    {([
                        { id: "Pessoas e Cultura", nome: "Pessoas & Cultura", codigo: "PC" },
                        { id: "Estrutura e Operações", nome: "Estrutura e Operações", codigo: "EO" },
                        { id: "Direção e Futuro", nome: "Direção e Futuro", codigo: "DF" },
                        { id: "Mercado e Clientes", nome: "Mercado e Clientes", codigo: "MC" }
                    ] as { id: Dimensao; nome: string; codigo: string }[]).map(dimensao => (
                        <button
                            key={dimensao.id}
                            onClick={() => toggleDimensao(dimensao.id)}
                            className={`px-6 py-4 rounded-lg font-semibold border transition-all duration-300 text-center ${
                                dimensoesSelecionadas.includes(dimensao.id) 
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
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                >
                    Começar Diagnóstico
                </button>
            </div>
        );
    }

    if (fase === "dimensao") {
        const dimAtual = dimensoesSelecionadas[indiceDimensaoAtual];
        const isUltimaDimensao = indiceDimensaoAtual === dimensoesSelecionadas.length - 1;
        let perguntas = perguntasPC;
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
