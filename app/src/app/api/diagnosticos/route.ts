import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Diagnostico from "@/models/Diagnostico";
import Empresa from "@/models/Empresa";

// GET - Listar diagnósticos da empresa
export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const empresaId = url.searchParams.get('empresaId');

    if (!empresaId) {
      return NextResponse.json({ error: "ID da empresa é obrigatório" }, { status: 400 });
    }

    const diagnosticos = await Diagnostico.find({ empresa: empresaId })
      .sort({ dataCriacao: -1 })
      .populate('empresa', 'nome_empresa email');

    return NextResponse.json({ diagnosticos });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Criar novo diagnóstico
export async function POST(req: Request) {
  try {
    await connectDB();
    const dados = await req.json();

    // Verificar se a empresa existe pelo nome
    const empresa = await Empresa.findOne({ nome_empresa: dados.nomeEmpresa });
    if (!empresa) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    // Preencher respostas com todas as dimensões (vazias para não selecionadas)
    const respostasCompletas: any = {
      "Pessoas e Cultura": { pergunta1: "", pergunta2: "", pergunta3: "", pergunta4: "", pergunta5: "", pergunta6: "" },
      "Estrutura e Operações": { pergunta1: "", pergunta2: "", pergunta3: "", pergunta4: "", pergunta5: "", pergunta6: "" },
      "Direção e Futuro": { pergunta1: "", pergunta2: "", pergunta3: "", pergunta4: "", pergunta5: "", pergunta6: "" },
      "Mercado e Clientes": { pergunta1: "", pergunta2: "", pergunta3: "", pergunta4: "", pergunta5: "", pergunta6: "" }
    };

    // Sobrescrever com as respostas enviadas
    Object.keys(dados.respostasDimensoes).forEach(dim => {
      respostasCompletas[dim] = dados.respostasDimensoes[dim];
    });

    // Calcular pontuação total
    const pontuacaoTotal = calcularPontuacao(respostasCompletas);

    const perfilCompleto = {
      empresa: dados.perfil.empresa,
      setor: dados.perfil.setor,
      porte: dados.perfil.porte,
      setorOutro: dados.perfil.setorOutro,
      nome_empresa: empresa.nome_empresa,
      email: empresa.email
    };

    const novoDiagnostico = await Diagnostico.create({
      empresa: empresa._id,
      perfil: perfilCompleto,
      dimensoesSelecionadas: dados.dimensoesSelecionadas,
      respostasDimensoes: respostasCompletas,
      pontuacaoTotal,
      status: "concluido",
      dataConclusao: new Date()
    });

    return NextResponse.json({
      message: "Diagnóstico salvo com sucesso",
      diagnostico: novoDiagnostico
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Função para calcular pontuação
function calcularPontuacao(respostasDimensoes: any) {
  let pontuacao = 0;
  const dimensoes = Object.keys(respostasDimensoes);

  dimensoes.forEach(dimensao => {
    const respostas = respostasDimensoes[dimensao];
    Object.values(respostas).forEach((resposta: unknown) => {
      const respostaStr = String(resposta || '');
      // Pontuação baseada no comprimento da resposta (simplificado)
      if (respostaStr.length > 50) pontuacao += 3;
      else if (respostaStr.length > 20) pontuacao += 2;
      else if (respostaStr.length > 0) pontuacao += 1;
    });
  });

  return pontuacao;
}
