import mongoose, { Schema, model, models } from "mongoose";

// Tipagem do histórico de mensagens da conversa
export interface HistoryMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

const AiSessionSchema = new Schema(
  {
    // ID da empresa que iniciou a sessão. Essencial para vincular a sessão a um usuário.
    empresaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Empresa",
      required: true,
    },
    // O histórico completo da conversa é armazenado aqui.
    conversationHistory: {
      type: Array, // Array de objetos HistoryMessage
      required: true,
      default: [],
    },
  },
  {
    // createdAt: data de início da sessão
    // updatedAt: data da última interação
    timestamps: true,
  }
);

// Exporta o modelo, criando-o se não existir.
// Este modelo servirá como um armazenamento temporário para as conversas em andamento.
export default models.AiSession || model("AiSession", AiSessionSchema);