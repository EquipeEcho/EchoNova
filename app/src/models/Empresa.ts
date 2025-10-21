import mongoose, { model, models } from "mongoose";

const EmpresaSchema = new mongoose.Schema(
  {
    nome_empresa: { type: String, required: true },
    cnpj: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: false },
    area_atuacao: { type: String, required: false },
    tamanho: { type: String, required: false },
    numero_funcionarios: { type: Number, required: false },
    // aqui são os bagulhos dos planos
    planoAtivo: { type: String, enum: ["essencial", "avancado", "escalado", null], default: null },
    transacaoAtualId: { type: mongoose.Schema.Types.ObjectId, ref: "Transacao", default: null },
  }, { timestamps: true }
);

export default models.Empresa || model("Empresa", EmpresaSchema);
