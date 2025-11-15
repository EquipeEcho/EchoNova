import mongoose, { Schema, model, models } from "mongoose";

const FuncionarioSchema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    cargo: { type: String, required: true },

    status: { type: String, enum: ["ativo", "inativo"], default: "ativo" },
    matricula: { type: String, required: true },

    senha: { type: String, required: true },

    trilhas: { type: [String], default: [] },

    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },

    data_cadastro: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// matricula única por empresa
FuncionarioSchema.index({ empresa: 1, matricula: 1 }, { unique: true });

// email único por empresa
FuncionarioSchema.index({ empresa: 1, email: 1 }, { unique: true });

export default models.Funcionario || model("Funcionario", FuncionarioSchema);
