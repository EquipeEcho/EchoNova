import { useState } from "react";
import { useRouter } from "next/navigation";

export interface RespostasDF {
  pergunta1: "";
  pergunta2: "";
  pergunta3: "";
  pergunta4: "";
  pergunta5: "";
  pergunta6: "";
  [key: string]: string;
}

export interface Pergunta {
  id: keyof RespostasDF;
  titulo: string;
  tipo: "select";
  placeholder?: "";
  rows?: number;
  required: boolean;
  opcoes?: { valor: string; texto: string }[];
  temOutros?: boolean;
  campoOutros?: keyof RespostasDF;
}

export const perguntasDF: Pergunta[] = [
  {
    id: "pergunta1",
    titulo: "Como a visão de futuro é comunicada?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p1-1", texto: "Todos conhecem e entendem." },
      { valor: "p1-2", texto: "É conhecida, mas só pela gestão." },
      { valor: "p1-3", texto: "Quase não é falada." },
      { valor: "p1-4", texto: "Não é comunicada." },
    ],
    required: true,
  },
  {
    id: "pergunta2",
    titulo: "Como os líderes conectam pessoas à estratégia?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p2-1", texto: "Inspiram e alinham metas claramente." },
      { valor: "p2-2", texto: "Tentam alinhar, mas varia muito." },
      { valor: "p2-3", texto: "Há pouca conexão." },
      { valor: "p2-4", texto: "Não há esforço de alinhamento." },
    ],
    required: true,
  },
  {
    id: "pergunta3",
    titulo: "Qual é o papel da inovação no planejamento?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p3-1", texto: "Prioridade central, com projetos claros." },
      { valor: "p3-2", texto: "Importante, mas sem orçamento." },
      { valor: "p3-3", texto: "Acontece de forma isolada." },
      { valor: "p3-4", texto: "Não é prioridade." },
    ],
    required: true,
  },
  {
    id: "pergunta4",
    titulo: "Como as atividades diárias se conectam com a estratégia?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p4-1", texto: "Sempre, com clareza." },
      { valor: "p4-2", texto: "Às vezes, depende do gestor." },
      { valor: "p4-3", texto: "Raramente, não chega claro." },
      { valor: "p4-4", texto: "Nunca, cada área segue isolada." },
    ],
    required: true,
  },
  {
    id: "pergunta5",
    titulo: "Como a empresa lida com propósito e impacto social?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p5-1", texto: "Está no centro das decisões." },
      { valor: "p5-2", texto: "É importante, mas secundário." },
      { valor: "p5-3", texto: "Fala-se, mas não se aplica." },
      { valor: "p5-4", texto: "Não há preocupação." },
    ],
    required: true,
  },
  {
    id: "pergunta6",
    titulo: "Quais ferramentas apoiam a estratégia?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p6-1", texto: "Dashboards, OKRs, planejamentos formais." },
      { valor: "p6-2", texto: "Algumas planilhas ou relatórios." },
      { valor: "p6-3", texto: "Discussões informais, sem registro contínuo." },
      { valor: "p6-4", texto: "Não temos instrumentos claros." },
    ],
    required: true,
  },
];
