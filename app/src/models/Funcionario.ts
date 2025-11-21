import mongoose, { Schema, model, models } from "mongoose";

const FuncionarioSchema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    cargo: { type: String, required: true },

    status: { type: String, enum: ["ativo", "inativo"], default: "ativo" },
    matricula: { type: String, required: true },

    senha: { type: String, required: true },

    trilhas: [{
      trilha: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trilha",
      },
      status: {
        type: String,
        enum: ["pendente", "em_andamento"],
        default: "pendente",
      },
      dataInicio: {
        type: Date,
      },
    }],

    trilhasConcluidas: [{
      trilha: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trilha",
      },
      dataConclusao: {
        type: Date,
        default: Date.now,
      },
    }],

    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },

    data_cadastro: { type: Date, default: Date.now },
  },
  { 
    timestamps: true,
    strictPopulate: false
  }
);

// matricula única por empresa
FuncionarioSchema.index({ empresa: 1, matricula: 1 }, { unique: true });

// email único por empresa
FuncionarioSchema.index({ empresa: 1, email: 1 }, { unique: true });

export default models.Funcionario || model("Funcionario", FuncionarioSchema);
