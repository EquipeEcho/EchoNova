import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { authenticateAndAuthorize } from "@/lib/middleware/authMiddleware";
import Funcionario from "@/models/Funcionario";

export async function POST(req: Request) {
  // Protegido: apenas ADMIN pode rodar a correção
  const auth = await authenticateAndAuthorize(req as any, "ADMIN");
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await connectDB();

  try {
    // Buscar todos os funcionários
    const funcionarios = await Funcionario.find({});

    let totalUpdated = 0;
    let totalStatusFixed = 0;

    for (const funcionario of funcionarios) {
      let needsUpdate = false;

      // Corrigir status das trilhas ativas
      if (funcionario.trilhas && Array.isArray(funcionario.trilhas)) {
        for (const trilha of funcionario.trilhas) {
          if (trilha.status === "pendente") {
            trilha.status = "não_iniciado";
            totalStatusFixed++;
            needsUpdate = true;
          }
        }
      }

      // Salvar se houve mudanças
      if (needsUpdate) {
        await funcionario.save();
        totalUpdated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Correção de status concluída",
      report: {
        funcionariosProcessados: funcionarios.length,
        funcionariosAtualizados: totalUpdated,
        statusCorrigidos: totalStatusFixed
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Erro ao corrigir status:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao corrigir status" },
      { status: 500 }
    );
  }
}