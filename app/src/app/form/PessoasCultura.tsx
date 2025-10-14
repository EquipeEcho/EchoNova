export interface RespostasPC {
  pergunta1: "";
  pergunta2: "";
  pergunta3: "";
  pergunta4: "";
  pergunta5: "";
  pergunta6: "";
  [key: string]: string;
}

export interface Pergunta {
    id: keyof RespostasPC;
    titulo: string;
    tipo: "select";
    placeholder?: "";
    rows?: number;
    required: boolean;
    opcoes?: { valor: string; texto: string }[];
    temOutros?: boolean;
    campoOutros?: keyof RespostasPC;
}

export const perguntasPC: Pergunta[] = [
  {
    id: "pergunta1",
    titulo: "Como a comunicação acontece no dia a dia?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      {
        valor: "p1-1",
        texto: "Todos têm clareza e acesso fácil às informações.",
      },
      {
        valor: "p1-2",
        texto: "Funciona na maior parte do tempo, mas com algumas falhas.",
      },
      {
        valor: "p1-3",
        texto: "Normalmente só em reuniões formais ou quando há problemas.",
      },
      { valor: "p1-4", texto: "É confusa, cada líder comunica de um jeito." },
    ],
    required: true,
  },
  {
    id: "pergunta2",
    titulo: "Como você descreveria o estilo de liderança predominante?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p2-1", texto: "Engajam e dão autonomia." },
      { valor: "p2-2", texto: "São bons, mas variam conforme o líder." },
      { valor: "p2-3", texto: "Centralizam muito as decisões." },
      { valor: "p2-4", texto: "Raramente exercem liderança ativa." },
    ],
    required: true,
  },
  {
    id: "pergunta3",
    titulo: "Quando surgem problemas, como os times costumam agir?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p3-1", texto: "Trazem ideias e resolvem juntos." },
      { valor: "p3-2", texto: "Resolvem, mas de forma reativa." },
      { valor: "p3-3", texto: "Dependem sempre do gestor para decidir." },
      { valor: "p3-4", texto: "Evitam mudanças e preferem manter como está." },
    ],
    required: true,
  },
  {
    id: "pergunta4",
    titulo: "Como está organizada a rotina de trabalho?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p4-1", texto: "Papéis e prioridades são claros." },
      {
        valor: "p4-2",
        texto: "Há certa clareza, mas faltam recursos ou prazos realistas.",
      },
      {
        valor: "p4-3",
        texto: "Muitas vezes é confusa, com foco em “apagar incêndios”.",
      },
      {
        valor: "p4-4",
        texto: "Não há organização definida, cada um faz do seu jeito.",
      },
    ],
    required: true,
  },
  {
    id: "pergunta5",
    titulo: "Até que ponto os valores da empresa estão presentes no dia a dia?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      { valor: "p5-1", texto: "Claros e vividos na prática." },
      { valor: "p5-2", texto: "Conhecidos, mas pouco aplicados." },
      { valor: "p5-3", texto: "Quase não são lembrados, só em discursos." },
      { valor: "p5-4", texto: "Não há clareza sobre os valores." },
    ],
    required: true,
  },
  {
    id: "pergunta6",
    titulo: "Quais ferramentas apoiam pessoas & cultura?",
    tipo: "select",
    opcoes: [
      { valor: "", texto: "Selecione a opção" },
      {
        valor: "p6-1",
        texto: "Temos plataforma estruturada de desenvolvimento.",
      },
      {
        valor: "p6-2",
        texto: "Algumas iniciativas digitais, mas sem consistência.",
      },
      {
        valor: "p6-3",
        texto: "Recursos informais (planilhas, grupos de mensagens).",
      },
      { valor: "p6-4", texto: "Não temos ferramentas definidas." },
    ],
    required: true,
  },
];
