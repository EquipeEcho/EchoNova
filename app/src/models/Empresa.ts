import mongoose, { Schema, model, models } from "mongoose";

const EmpresaSchema = new Schema(
  {
    nome_empresa: { type: String, required: true },
    cnpj: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: false }, // hash com bcrypt

    area_atuacao: String,
    tamanho: String,
    numero_funcionarios: Number,

    // Categorias de trilhas associadas à empresa (recomendadas pela IA)
    categoriasAssociadas: [
      {
        categoria: {
          type: String,
          enum: ["Comunicação", "Gestão de Tempo", "Inovação", "Liderança", "Diversidade"],
          required: true
        },
        dataAssociacao: {
          type: Date,
          default: Date.now
        },
        motivoAssociacao: String, // Problema que levou à associação desta categoria
      }
    ],

    // Trilhas associadas à empresa (recomendadas pela IA ou atribuídas manualmente)
    trilhasAssociadas: [
      {
        trilha: { type: mongoose.Schema.Types.ObjectId, ref: "Trilha", required: true },
        origem: { type: String, enum: ["IA", "manual"], default: "IA" },
        motivoAssociacao: String,
        dataAssociacao: { type: Date, default: Date.now }
      }
    ],

    planoAtivo: {
      type: String,
      enum: ["essencial", "avancado", "escalado", null],
      default: null,
    },
    transacaoAtualId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transacao",
      default: null,
    },

    tipo_usuario: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },

    data_cadastro: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Empresa || model("Empresa", EmpresaSchema);
