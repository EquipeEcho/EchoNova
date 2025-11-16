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
