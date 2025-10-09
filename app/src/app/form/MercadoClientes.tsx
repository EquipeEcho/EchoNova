import { useState } from "react";
import { useRouter } from "next/navigation";

export interface RespostasMC {
  pergunta1: "";
  pergunta2: "";
  pergunta3: "";
  pergunta4: "";
  pergunta5: "";
  pergunta6: "";
  [key: string]: string;
}

export interface Pergunta {
  id: keyof RespostasMC;
  titulo: string;
  tipo: "select";
  placeholder?: "";
  rows?: number;
  required: boolean;
  opcoes?: { valor: string; texto: string }[];
  temOutros?: boolean;
  campoOutros?: keyof RespostasMC;
}

export const perguntasMC: Pergunta[] = [
  {
    id: "pergunta1",
    titulo: "Como a empresa ouve seus clientes?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p1-1", texto: "Temos pesquisa estruturada e contínua." },
      { valor: "p1-2", texto: "Fazemos de forma ocasional." },
      { valor: "p1-3", texto: "Reagimos só em reclamações." },
      { valor: "p1-4", texto: "Não há escuta formal." },
    ],
    required: true,
  },
  {
    id: "pergunta2",
    titulo: "Como vendas e atendimento trabalham juntos?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p2-1", texto: "Colaboram e compartilham informações." },
      { valor: "p2-2", texto: "Trocam parcialmente, com falhas." },
      { valor: "p2-3", texto: "Atuam isolados, sem integração." },
      { valor: "p2-4", texto: "Há conflitos ou competição entre áreas." },
    ],
    required: true,
  },
  {
    id: "pergunta3",
    titulo: "Quando o mercado muda, como a empresa reage?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p3-1", texto: "Antecipamos tendências e inovamos rápido." },
      { valor: "p3-2", texto: "Ajustamos, mas com atraso." },
      { valor: "p3-3", texto: "Só reagimos a crises." },
      { valor: "p3-4", texto: "Não temos adaptação estruturada." },
    ],
    required: true,
  },
  {
    id: "pergunta4",
    titulo: "Como é o acompanhamento de metas comerciais?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p4-1", texto: "Claro, transparente e frequente." },
      { valor: "p4-2", texto: "Existe, mas pouco revisado." },
      { valor: "p4-3", texto: "Informal, depende do gestor." },
      { valor: "p4-4", texto: "Não temos acompanhamento." },
    ],
    required: true,
  },
  {
    id: "pergunta5",
    titulo: "O diferencial competitivo está claro?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p5-1", texto: "Sim, é comunicado e reconhecido." },
      { valor: "p5-2", texto: "Existe, mas pouco divulgado." },
      { valor: "p5-3", texto: "É incerto, varia por área." },
      { valor: "p5-4", texto: "Não está claro." },
    ],
    required: true,
  },
  {
    id: "pergunta6",
    titulo: "Quais ferramentas apoiam mercado & clientes?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p6-1", texto: "CRM, BI e pesquisas estruturadas." },
      { valor: "p6-2", texto: "Algumas planilhas e relatórios." },
      { valor: "p6-3", texto: "Feedbacks informais, dados dispersos." },
    ],
    required: true,
  },
];
