import mongoose, { model, models } from "mongoose";

const EmpresaSchema = new mongoose.Schema(
  {
    nome_empresa: { type: String, required: true },
    cnpj: { type: String, required: false, unique: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: false },
    area_atuacao: { type: String, required: false },
    tamanho: { type: String, required: false },
    numero_funcionarios: { type: Number, required: false },
  },
  { timestamps: true },
);

export default models.Empresa || model("Empresa", EmpresaSchema);
