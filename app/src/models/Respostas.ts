import { Schema, model, models } from "mongoose";

const RespostaSchema = new Schema(
  {

    empresaID:{
       
      type: String, 
      required: false
    
    },

    perfil: {

      type: Object,
      required: true,

    },

    respostas: {

      type: Object,
      required: true,

    },

  },

  { timestamps: true } 

);


RespostaSchema.index({ "perfil.empresa": 1, createdAt: -1 });

export default models.Respostas || model("Respostas", RespostaSchema);