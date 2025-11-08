import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // TODO: Validar token JWT do header Authorization
    // const token = request.headers.get("authorization")?.replace("Bearer ", "");

    // TODO: Buscar dados do funcionário no banco
    // Por enquanto, retorno mockado:
    const funcionario = {
      nome: "João Silva",
      email: "joao.silva@empresa.com",
      matricula: "12345",
      cargo: "Analista de Vendas",
      empresa: "Empresa XYZ Ltda",
      trilhas: [
        {
          id: "1",
          nome: "Técnicas de Vendas Avançadas",
          descricao: "Domine estratégias modernas de vendas consultivas",
          progresso: 65,
          status: "em_andamento",
          dataInicio: "2025-10-01",
        },
        {
          id: "2",
          nome: "Atendimento ao Cliente",
          descricao: "Aprenda a encantar seus clientes",
          progresso: 100,
          status: "concluido",
          dataInicio: "2025-09-01",
          dataConclusao: "2025-09-30",
        },
        {
          id: "3",
          nome: "Negociação Eficaz",
          descricao: "Técnicas de negociação win-win",
          progresso: 0,
          status: "não_iniciado",
        },
      ],
    };

    return NextResponse.json(funcionario);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar perfil" },
      { status: 500 }
    );
  }
}
