import { useState } from "react";
import { useRouter } from "next/navigation";

export interface RespostasEO {
  pergunta1: "";
  pergunta2: "";
  pergunta3: "";
  pergunta4: "";
  pergunta5: "";
  pergunta6: "";
  [key: string]: string;
}

export interface Pergunta {
  id: keyof RespostasEO;
  titulo: string;
  tipo: "select";
  placeholder?: "";
  rows?: number;
  required: boolean;
  opcoes?: { valor: string; texto: string }[];
  temOutros?: boolean;
  campoOutros?: keyof RespostasEO;
}

export const perguntasEO: Pergunta[] = [
  {
    id: "pergunta1",
    titulo: "Como é a troca de informações entre áreas?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p1-1", texto: "Integrada e frequente." },
      { valor: "p1-2", texto: "Funciona em parte, com alguns ruídos." },
      { valor: "p1-3", texto: "Depende de reuniões formais." },
      { valor: "p1-4", texto: "As áreas trabalham isoladas." },
    ],
    required: true,
  },
  {
    id: "pergunta2",
    titulo: "Como os gestores lidam com delegação?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p2-1", texto: "Delegam com clareza e confiança." },
      { valor: "p2-2", texto: "Delegam, mas acompanham em excesso." },
      { valor: "p2-3", texto: "Raramente delegam." },
      { valor: "p2-4", texto: "Não delegam, concentram tudo." },
    ],
    required: true,
  },
  {
    id: "pergunta3",
    titulo: "Quando processos falham, o que acontece?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p3-1", texto: "As equipes propõem melhorias rapidamente." },
      { valor: "p3-2", texto: "Há ajustes, mas com demora." },
      { valor: "p3-3", texto: "Só a gestão revisa processos." },
      { valor: "p3-4", texto: "Nada muda, seguimos com os problemas." },
    ],
    required: true,
  },
  {
    id: "pergunta4",
    titulo: "Quanta autonomia operacional os colaboradores têm?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p4-1", texto: "Alta, com responsabilidade." },
      { valor: "p4-2", texto: "Alguma, mas dependem de aprovações." },
      { valor: "p4-3", texto: "Pouca, com muito controle." },
      { valor: "p4-4", texto: "Nenhuma, tudo vem da gestão." },
    ],
    required: true,
  },
  {
    id: "pergunta5",
    titulo: "Qual é a relação da empresa com padrões de qualidade?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p5-1", texto: "Qualidade é prioridade e está no DNA." },
      { valor: "p5-2", texto: "Importante, mas não sempre seguida." },
      { valor: "p5-3", texto: "Depende da cobrança externa." },
      { valor: "p5-4", texto: "Não há padrão definido." },
    ],
    required: true,
  },
  {
    id: "pergunta6",
    titulo: "Quais ferramentas apoiam as operações do dia a dia?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p6-1", texto: "Sistemas integrados (ERP, CRM, dashboards)." },
      {
        valor: "p6-2",
        texto: "Algumas ferramentas digitais, mas sem integração.",
      },
      {
        valor: "p6-3",
        texto: "Recursos básicos (planilhas, controles manuais).",
      },
      { valor: "p6-4", texto: "Não há ferramentas." },
    ],
    required: true,
  },
];
