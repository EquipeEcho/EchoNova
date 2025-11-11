import mongoose, { Schema, model, models } from "mongoose";

const FuncionarioSchema = new Schema(
  {
    nome: { type: String, required: true },
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

// Garante que a matrícula é única dentro de cada empresa
FuncionarioSchema.index({ empresa: 1, matricula: 1 }, { unique: true });

export default models.Funcionario || model("Funcionario", FuncionarioSchema);
