import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface RespostasDiagnostico {
    empresa: string;
    setor: string;
    colaboradores: string;
    porte: string;
    localizacao: string;
    setorOutro: string;
}

export interface Pergunta {
    id: keyof RespostasDiagnostico;
    titulo: string;
    tipo: "texto" | "select" | "textarea" | "radio";
    placeholder?: string;
    rows?: number;
    required: boolean;
    opcoes?: { valor: string; texto: string }[];
    temOutros?: boolean;
    campoOutros?: keyof RespostasDiagnostico;
}

export const perguntasDiagnostico: Pergunta[] = [
    {
        id: "empresa",
        titulo: "Qual o nome da sua empresa?",
        tipo: "texto",
        placeholder: "Digite o nome da sua empresa",
        required: true
    },
    {
        id: "setor",
        titulo: "Qual o setor da sua empresa?",
        tipo: "select",
        opcoes: [
            { valor: "", texto: "Selecione o setor" },
            { valor: "tecnologia", texto: "Tecnologia" },
            { valor: "saude", texto: "Saúde" },
            { valor: "educacao", texto: "Educação" },
            { valor: "financeiro", texto: "Financeiro" },
            { valor: "varejo", texto: "Varejo" },
            { valor: "industrial", texto: "Industrial" },
            { valor: "outros", texto: "Outros"}
        ],
        required: true,
        temOutros: true,
        campoOutros: "setorOutro",
    },
    {
        id: "colaboradores",
        titulo: "Quantos colaboradores sua empresa possui?",
        tipo: "select",
        opcoes: [
            { valor: "", texto: "Selecione a quantidade" },
            { valor: "1-10", texto: "Até 10" },
            { valor: "11-3", texto: "Entre 11 e 30" },
            { valor: "30-100", texto: "Entre 30 e 100" },
            { valor: "100+", texto: "Acima de 100" },
            { valor: "500+", texto: "Acima de 500" }
        ],
        required: true
    },
    {
        id: "porte",
        titulo: "Qual o porte da empresa?",
        tipo: "select",
        opcoes: [
            { valor: "", texto: "Selecione o tamanho" },
            { valor: "startup", texto: "StartUp" },
            { valor: "pme", texto: "PME(Pequena/Média Empresa)" },
            { valor: "grande", texto: "Grande Empresa" },
        ],
        required: true
    },
    {
        id: "localizacao",
        titulo: "Quais os principais desafios da sua empresa?",
        tipo: "select",
        opcoes: [
            { valor: "", texto: "Selecione o tamanho" },
            { valor: "1-10", texto: "Até 10" },
            { valor: "11-3", texto: "Entre 11 e 30" },
            { valor: "30-100", texto: "Entre 30 e 100" },
            { valor: "100+", texto: "Acima de 100" },
            { valor: "500+", texto: "Acima de 500" }
        ],
        required: true
    },
];

export function useDiagnostico() {
    const router = useRouter();
    const [etapaAtual, setEtapaAtual] = useState(0);
    const [respostas, setRespostas] = useState<RespostasDiagnostico>({
        empresa: "",
        setor: "",
        setorOutro: "",
        colaboradores: "",
        porte: "",
        localizacao: "",
    });

    const handleInputChange = (campo: keyof RespostasDiagnostico, valor: string) => {
        setRespostas(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const proximaEtapa = (perguntas: Pergunta[]) => {
        if (etapaAtual < perguntas.length - 1) {
            setEtapaAtual(etapaAtual + 1);
        } else {
            finalizarFormulario();
        }
    };

    const etapaAnterior = () => {
        if (etapaAtual > 0) {
            setEtapaAtual(etapaAtual - 1);
        }
    };

    const finalizarFormulario = () => {
        // Processar os dados do formulário
        console.log('Dados do formulário:', respostas);

        // Redirecionar para a página de resultados
        router.push('/resultados');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        finalizarFormulario();
    };

    return {
        etapaAtual,
        respostas,
        handleInputChange,
        proximaEtapa,
        etapaAnterior,
        handleSubmit,
        setEtapaAtual
    };
}
