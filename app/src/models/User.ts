import mongoose, { Schema, model, models } from "mongoose";
import Empresa from "./Empresa"; // Importe o modelo Empresa

const UsuarioSchema = new Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true }, // hash com bcrypt
  tipo_usuario: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
  empresa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empresa",
    required: true,
  }, // "ref" referencia a empresa
  data_cadastro: { type: Date, default: Date.now },
});

export default models.Usuario || model("Usuario", UsuarioSchema);
