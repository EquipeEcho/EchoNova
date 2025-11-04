import mongoose, { Schema, model, models } from "mongoose";

const DiagnosticoSchema = new Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },
    perfil: {
      empresa: { type: String, required: true },
      email: { type: String, required: true },
      cnpj: { type: String, required: true },
      setor: { type: String, required: true },
      porte: { type: String, required: true },
      setorOutro: { type: String, default: "" },
    },
    dimensoesSelecionadas: [
      {
        type: String,
        enum: [
          "Pessoas e Cultura",
          "Estrutura e Operações",
          "Direção e Futuro",
          "Mercado e Clientes",
        ],
        required: true,
      },
    ],
    respostasDimensoes: {
      type: Object,
      required: true,
    },
    resultados: {
      type: Object,
      required: false,
    },
    status: {
      type: String,
      enum: ["em_andamento", "concluido", "rascunho"],
      default: "concluido",
    },
    dataProcessamento: {
      type: Date,
    },
    observacoes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

DiagnosticoSchema.index({ empresa: 1, createdAt: -1 });

export default models.Diagnostico || model("Diagnostico", DiagnosticoSchema);
