// models/DiagnosticoAprofundado.ts

import mongoose, { Schema, model, models } from "mongoose";

/**
 * @description Schema para armazenar os resultados do Diagnóstico Aprofundado conduzido pela IA.
 * Ele guarda não apenas o resultado final, mas todo o contexto da conversa.
 */
const DiagnosticoAprofundadoSchema = new Schema({
    // Referência à empresa que realizou o diagnóstico.
    empresa: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Empresa",
        required: true
    },
    // O ID da sessão de chat, para referência e debug.
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    // O histórico completo da conversa (perguntas da IA e respostas do usuário).
    conversationHistory: {
        type: Array,
        required: true,
    },
    // O objeto JSON final com todos os dados estruturados coletados pela IA.
    structuredData: {
        type: Object,
        required: true,
    },
    // O relatório final em texto (markdown) e as trilhas de aprendizagem geradas pela IA.
    finalReport: {
        type: String,
        required: true,
    }
}, {
    // Adiciona os campos `createdAt` e `updatedAt` automaticamente.
    timestamps: true
});

// Exporta o modelo, criando-o se não existir.
export default models.DiagnosticoAprofundado || model("DiagnosticoAprofundado", DiagnosticoAprofundadoSchema);