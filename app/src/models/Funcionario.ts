import mongoose, { Schema, model, models } from "mongoose";

const FuncionarioSchema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true },
    cargo: { type: String, required: true },
    status: { type: String, enum: ["ativo", "inativo"], default: "ativo" },

    matricula: { type: String, required: true },
    senha: { type: String, required: true }, // será armazenada com bcrypt
    
    trilhas: { type: [String], default: [] },
    
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Empresa", // sempre uma empresa do tipo USER
      required: true,
    },
    
    data_cadastro: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// matricula única por empresa
FuncionarioSchema.index({ empresa: 1, matricula: 1 }, { unique: true });

export default models.Funcionario || model("Funcionario", FuncionarioSchema);
