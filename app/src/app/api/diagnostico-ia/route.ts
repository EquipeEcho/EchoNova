import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose"; // --- NOVO IMPORTE ---
import { connectDB } from "@/lib/mongodb";
import { getChatProvider } from "@/lib/ai/providerFactory";
import { promptDiagnosticoAprofundado, getTrilhasParaPrompt } from "@/lib/prompts";
import AiSession from "@/models/AiSession";
import DiagnosticoAprofundado from "@/models/DiagnosticoAprofundado";
import Empresa from "@/models/Empresa";
import Trilha from "@/models/Trilha";
import type { HistoryMessage, IaResponse } from "@/lib/ai/ChatProvider";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

function getTextForHistory(iaResponse: IaResponse): string {
  if (iaResponse.status === "finalizado" && iaResponse.relatorio_final) {
    return iaResponse.relatorio_final;
  }
  if (iaResponse.status === "confirmacao" && iaResponse.resumo_etapa) {
    return iaResponse.resumo_etapa;
  }
  if (iaResponse.proxima_pergunta?.texto) {
    return iaResponse.proxima_pergunta.texto;
  }
  return "Ok, entendi. Podemos continuar.";
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado: token não encontrado." }, { status: 401 });
    }

    let payload: { id?: string } | undefined;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, secret);
      payload = verifiedPayload as { id?: string };
    } catch (_err) {
      return NextResponse.json({ error: "Não autorizado: token inválido." }, { status: 401 });
    }

    const empresaId = payload?.id;
    if (!empresaId) {
      return NextResponse.json({ error: "Não autorizado: token inválido." }, { status: 401 });
    }
    await connectDB();
    const { sessionId, resposta_usuario } = await req.json();
    const provider = getChatProvider();

  let session: InstanceType<typeof AiSession> | null = null;
  let historico: HistoryMessage[] = [];

    if (!sessionId) {
      console.log(`MCP: Iniciando nova sessão para a empresa ${empresaId}`);
      session = new AiSession({
        empresaId: empresaId,
        conversationHistory: [],
      });
      historico = [];
    } else {
      session = await AiSession.findById(sessionId);
      if (!session || session.empresaId.toString() !== empresaId) {
        return NextResponse.json({ error: "Sessão inválida ou não pertence a este usuário." }, { status: 400 });
      }
      historico = session.conversationHistory;
      console.log(`MCP: Continuando sessão ${sessionId} para a empresa ${empresaId}`);
    }

    // Buscar trilhas ativas do banco de dados
    const trilhasFormatadas = await getTrilhasParaPrompt();
    
    // Injetar trilhas no prompt
    const promptComTrilhas = promptDiagnosticoAprofundado.replace(
      "{TRILHAS_DISPONIVEIS}",
      trilhasFormatadas
    );

    const iaResponse = await provider.sendMessage(resposta_usuario, historico, promptComTrilhas);
    const iaTextForHistory = getTextForHistory(iaResponse);

    session.conversationHistory.push(
      { role: 'user', parts: [{ text: resposta_usuario }] },
      { role: 'model', parts: [{ text: iaTextForHistory }] }
    );
    await session.save();
    
    // --- CORREÇÃO (Fluxo Pós-Diagnóstico) ---
    // Variável para armazenar o ID do novo diagnóstico
    let finalDiagnosticId: string | null = null;

    if (iaResponse.status === "finalizado") {
      console.log(`MCP: Finalizando e salvando diagnóstico da sessão: ${session._id}`);
      // Alguns provedores retornam dados_coletados = null na finalização.
      // Garantimos um objeto vazio para cumprir a validação do schema.
      const structuredData = (iaResponse as any).dados_coletados
        ?? (iaResponse as any).dadosColetados
        ?? {};
      // Garante que o relatório final nunca seja nulo ou vazio
      const finalReport = iaResponse.relatorio_final || "Relatório não gerado. Entre em contato com o suporte.";
      const novoDiagnostico = new DiagnosticoAprofundado({
        empresa: new mongoose.Types.ObjectId(empresaId),
        sessionId: session._id.toString(),
        conversationHistory: session.conversationHistory,
        structuredData,
        finalReport,
      });
      await novoDiagnostico.save();
      // Armazenamos o ID para retornar ao frontend
      finalDiagnosticId = novoDiagnostico._id.toString();

      // --- Associação automática de categorias e trilhas à empresa ---
      try {
        const empresaDoc = await Empresa.findById(empresaId);
        if (empresaDoc) {
          const dados = structuredData as any;
          const trilhasRec: Array<any> = dados?.trilhas_recomendadas || dados?.trilhasRecomendadas || [];
          const categoriasSugeridas: string[] = dados?.categorias_para_associar || dados?.categoriasParaAssociar || [];

          // Buscar trilhas por nome para obter categorias e IDs
          const trilhasEncontradas: Array<{ _id: any; categoria: string; nome: string }> = [];
          for (const rec of trilhasRec) {
            if (!rec?.trilha_nome && !rec?.trilhaNome) continue;
            const nomeTrilha = rec.trilha_nome || rec.trilhaNome;
            const trilhaDB = await Trilha.findOne({ nome: nomeTrilha }).select("_id categoria nome");
            if (trilhaDB) {
              trilhasEncontradas.push({ _id: trilhaDB._id, categoria: trilhaDB.categoria, nome: trilhaDB.nome });
            }
          }

          // Consolidar categorias a associar
          const categoriasDeTrilhas = Array.from(new Set(trilhasEncontradas.map(t => t.categoria)));
          const todasCategorias = Array.from(new Set([...(categoriasSugeridas || []), ...categoriasDeTrilhas]));

          // Adicionar categorias novas evitando duplicatas
          const existentes = new Set((empresaDoc.categoriasAssociadas || []).map((c: any) => c.categoria));
          for (const cat of todasCategorias) {
            if (!existentes.has(cat)) {
              empresaDoc.categoriasAssociadas.push({ categoria: cat, motivoAssociacao: "Recomendação da IA" });
            }
          }

          // Adicionar trilhas associadas evitando duplicatas
          const trilhasExistentes = new Set((empresaDoc.trilhasAssociadas || []).map((e: any) => String(e.trilha)));
          for (const t of trilhasEncontradas) {
            if (!trilhasExistentes.has(String(t._id))) {
              empresaDoc.trilhasAssociadas.push({ trilha: t._id, origem: "IA", motivoAssociacao: "Recomendação da IA" });
            }
          }

          await empresaDoc.save();
          console.log(`MCP: Empresa ${empresaId} associada a ${todasCategorias.length} categorias e ${trilhasEncontradas.length} trilhas.`);
        }
      } catch (assocErr) {
        console.warn("Associação automática de categorias/trilhas falhou:", assocErr);
      }

      await AiSession.findByIdAndDelete(session._id);
      console.log(`MCP: Sessão temporária ${session._id} removida.`);
    }

    // --- MELHORIA (Redirecionamento Pós-Diagnóstico) ---
    // Adicionamos o `finalDiagnosticId` à resposta.
    // O frontend usará isso para redirecionar o usuário para a página de resultados.
    return NextResponse.json({ 
      sessionId: session._id.toString(), 
      finalDiagnosticId, // Retorna o ID aqui
      ...iaResponse 
    });

  } catch (error: unknown) {
    console.error("Erro no MCP (/api/diagnostico-ia):", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
    return NextResponse.json({ error: "Falha ao processar a requisição.", details: errorMessage }, { status: 500 });
  }
}