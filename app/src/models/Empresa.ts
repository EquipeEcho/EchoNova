import mongoose, { Schema, model, models } from "mongoose";

const EmpresaSchema = new Schema(
  {
    //Dados principais
    nome_empresa: { type: String, required: true },
    cnpj: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: false }, // hash com bcrypt

    // Dados organizacionais
    area_atuacao: { type: String, required: false },
    tamanho: { type: String, required: false },
    numero_funcionarios: { type: Number, required: false },

    //Dados de plano / assinatura
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
