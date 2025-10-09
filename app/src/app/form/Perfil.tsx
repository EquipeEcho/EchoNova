import { useState } from "react";
import { useRouter } from "next/navigation";

export interface RespostasPerfil {
  empresa: string;
  email: string;
  setor: string;
  porte: string;
  setorOutro: string;
  [key: string]: string;
}

export interface Pergunta {
  id: keyof RespostasPerfil;
  titulo: string;
  tipo: "texto" | "select" | "textarea";
  placeholder?: string;
  rows?: number;
  required: boolean;
  opcoes?: { valor: string; texto: string }[];
  temOutros?: boolean;
  campoOutros?: keyof RespostasPerfil;
}

export const perguntasPerfil: Pergunta[] = [
  {
    id: "empresa",
    titulo: "Qual o nome da sua empresa?",
    tipo: "texto",
    placeholder: "Digite o nome da sua empresa",
    required: true,
  },
  {
    id: "email",
    titulo: "Email da empresa: ",
    tipo: "texto",
    placeholder: "Digite o email da empresa",
    required: true,
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
      { valor: "outros", texto: "Outros" },
    ],
    required: true,
    temOutros: true,
    campoOutros: "setorOutro",
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
    required: true,
  },
];

export function usePerfil() {
  const router = useRouter();
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [respostas, setRespostas] = useState<RespostasPerfil>({
    empresa: "",
    email: "",
    setor: "",
    setorOutro: "",
    porte: "",
  });

  const handleInputChange = (campo: keyof RespostasPerfil, valor: string) => {
    setRespostas((prev) => ({
      ...prev,
      [campo]: valor,
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
    console.log("Dados do formulário:", respostas);

    // Redirecionar para a página de resultados
    router.push("/resultados");
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
    setEtapaAtual,
  };
}
