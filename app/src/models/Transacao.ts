import mongoose, { model, models } from "mongoose";

const TransacaoSchema = new mongoose.Schema(
    {
        empresaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Empresa",
            required: true,
        },
        plano: {
            type: String,
            enum: ["essencial", "avancado", "escalado"],
            required: true,
        },
        valor: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pendente", "concluida", "falha"],
            default: "pendente",
        },
        metodoPagamento: {
            type: String,
            enum: ["cartao", "pix", "boleto", "simulado"],
            default: "simulado", // como a gente não vai fazer pagamentos reais ele usa um método simulado
        },
        dataTransacao: {
            type: Date,
            default: Date.now,
        },
        dataConclusao: {
            type: Date,
            required: false
        },
    },
    { timestamps: true }
);

export default models.Transacao || model("Transacao", TransacaoSchema);
