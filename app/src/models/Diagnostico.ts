import mongoose, { Schema, model, models } from "mongoose";

const DiagnosticoSchema = new Schema({
  // Referência à empresa que fez o diagnóstico
  empresa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empresa",
    required: true
  },

  // Dados do perfil da empresa
  perfil: {
    empresa: { type: String, required: true },
    setor: { type: String, required: true },
    porte: { type: String, required: true },
    setorOutro: { type: String, default: "" },
    nome_empresa: { type: String, required: true },
    email: { type: String, required: true }
  },

  // Dimensões selecionadas para avaliação
  dimensoesSelecionadas: [{
    type: String,
    enum: ["Pessoas e Cultura", "Estrutura e Operações", "Direção e Futuro", "Mercado e Clientes"],
    required: true
  }],

  // Respostas por dimensão (apenas dimensões selecionadas)
  respostasDimensoes: {
    "Pessoas e Cultura": {
      pergunta1: { type: String, default: "" },
      pergunta2: { type: String, default: "" },
      pergunta3: { type: String, default: "" },
      pergunta4: { type: String, default: "" },
      pergunta5: { type: String, default: "" },
      pergunta6: { type: String, default: "" }
    },
    "Estrutura e Operações": {
      pergunta1: { type: String, default: "" },
      pergunta2: { type: String, default: "" },
      pergunta3: { type: String, default: "" },
      pergunta4: { type: String, default: "" },
      pergunta5: { type: String, default: "" },
      pergunta6: { type: String, default: "" }
    },
    "Direção e Futuro": {
      pergunta1: { type: String, default: "" },
      pergunta2: { type: String, default: "" },
      pergunta3: { type: String, default: "" },
      pergunta4: { type: String, default: "" },
      pergunta5: { type: String, default: "" },
      pergunta6: { type: String, default: "" }
    },
    "Mercado e Clientes": {
      pergunta1: { type: String, default: "" },
      pergunta2: { type: String, default: "" },
      pergunta3: { type: String, default: "" },
      pergunta4: { type: String, default: "" },
      pergunta5: { type: String, default: "" },
      pergunta6: { type: String, default: "" }
    }
  },

  // Status do diagnóstico
  status: {
    type: String,
    enum: ["em_andamento", "concluido", "rascunho"],
    default: "concluido"
  },

  // Pontuação total (calculada automaticamente)
  pontuacaoTotal: {
    type: Number,
    default: 0
  },

  // Data de criação e conclusão
  dataCriacao: {
    type: Date,
    default: Date.now
  },

  dataConclusao: {
    type: Date,
    default: Date.now
  },

  // Observações adicionais
  observacoes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// Índices para melhorar performance das consultas
DiagnosticoSchema.index({ empresa: 1, dataCriacao: -1 });
DiagnosticoSchema.index({ status: 1 });
DiagnosticoSchema.index({ dataCriacao: -1 });

export default models.Diagnostico || model("Diagnostico", DiagnosticoSchema);
