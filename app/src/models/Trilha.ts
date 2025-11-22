import mongoose, { Schema, model, models } from "mongoose";

/**
 * @description Schema para armazenar Trilhas de Aprendizagem.
 * Trilhas são conjuntos de treinamentos que abordam áreas específicas de melhoria.
 */
const TrilhaSchema = new Schema(
  {
    // Nome da trilha
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    // Descrição detalhada da trilha
    descricao: {
      type: String,
      required: true,
    },
    // Tags semânticas para matching com problemas diagnosticados
    tags: {
      type: [String],
      required: true,
    },
    // Áreas de melhoria que esta trilha aborda
    areasAbordadas: {
      type: [String],
      required: true,
    },
    // Objetivos de aprendizagem
    objetivos: {
      type: [String],
      required: true,
    },
    // Duração estimada em horas
    duracaoEstimada: {
      type: Number,
      required: true,
    },
    // Nível de dificuldade
    nivel: {
      type: String,
      enum: ["Iniciante", "Intermediário", "Avançado"],
      required: true,
    },
    // Categoria principal da trilha
    categoria: {
      type: String,
      enum: ["Comunicação", "Gestão de Tempo", "Inovação", "Liderança", "Diversidade"],
      required: true,
    },
    // Módulos/Conteúdos da trilha
    modulos: [
      {
        titulo: { type: String, required: true },
        descricao: { type: String, required: true },
        tipo: {
          type: String,
          enum: ["video", "podcast", "texto", "avaliacao", "atividade_pratica"],
          required: true,
        },
        duracao: { type: Number, required: true }, // em minutos
        url: { type: String }, // URL do conteúdo (quando aplicável)
        conteudo: { type: String }, // Conteúdo em texto/markdown
        ordem: { type: Number, required: true },
      },
    ],
    // Status da trilha
    status: {
      type: String,
      enum: ["ativa", "inativa", "rascunho"],
      default: "ativa",
    },
    // Imagem/thumbnail da trilha
    thumbnail: {
      type: String,
      default: "/img/trilha-default.png",
    },
    // Metadados para recomendação pela IA
    metadados: {
      // Palavras-chave relacionadas aos problemas que a trilha resolve
      problemasRelacionados: [String],
      // Competências desenvolvidas
      competenciasDesenvolvidas: [String],
      // Indicadores de resultado esperados
      resultadosEsperados: [String],
    },
    // Estatísticas de uso
    estatisticas: {
      totalAtribuicoes: { type: Number, default: 0 },
      totalConclusoes: { type: Number, default: 0 },
      avaliacaoMedia: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// Índices separados para busca (não pode indexar arrays paralelos juntos)
TrilhaSchema.index({ tags: 1 });
TrilhaSchema.index({ areasAbordadas: 1 });
TrilhaSchema.index({ "metadados.problemasRelacionados": 1 });
TrilhaSchema.index({ status: 1 });
TrilhaSchema.index({ nivel: 1 });

export default models.Trilha || model("Trilha", TrilhaSchema);
