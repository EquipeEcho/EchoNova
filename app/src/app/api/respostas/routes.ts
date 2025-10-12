import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Respostas from "@/models/Respostas";

export async function POST(request: Request) {
  try {

    await connectDB();

    const dados = await request.json();

    console.log("📩 Recebido do front:", dados);
    
    const newResposta = await Respostas.create({

      perfil: dados.perfil,
      respostas: dados.respostas,

    });



    return NextResponse.json({
      sucesso: true,
      mensagem: "Respostas salvas com sucesso!",
      data: newResposta,
    });
  }
  
  
  
  catch (erro) {
    console.error("Erro ao salvar:", erro);
    return NextResponse.json(
      { sucesso: false, mensagem: "Erro ao salvar respostas." },
      { status: 500 }
    );
  }


  
}