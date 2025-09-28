import mongoose, { Schema, model, models } from "mongoose";

const DiagnosticoSchema = new Schema({
  empresa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empresa",
    required: true
  },
  // O objeto 'perfil' agora corresponde exatamente ao que o formulário envia.
  perfil: {
    empresa: { type: String, required: true }, // Este é o nome da empresa
    email: { type: String, required: true },
    setor: { type: String, required: true },
    porte: { type: String, required: true },
    setorOutro: { type: String, default: "" },
    // O campo 'nome_empresa' foi REMOVIDO daqui por ser redundante.
  },
  dimensoesSelecionadas: [{
    type: String,
    enum: ["Pessoas e Cultura", "Estrutura e Operações", "Direção e Futuro", "Mercado e Clientes"],
    required: true
  }],
  respostasDimensoes: {
    type: Object,
    required: true,
  },
  resultados: {
    type: Object,
    required: false
  },
  status: {
    type: String,
    enum: ["em_andamento", "concluido", "rascunho"],
    default: "concluido"
  },
  dataProcessamento: {
      type: Date
  },
  observacoes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

DiagnosticoSchema.index({ empresa: 1, createdAt: -1 });

export default models.Diagnostico || model("Diagnostico", DiagnosticoSchema);