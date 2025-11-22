import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { authenticateAndAuthorize } from "@/lib/middleware/authMiddleware";
import Trilha from "@/models/Trilha";
import Funcionario from "@/models/Funcionario";
import Empresa from "@/models/Empresa";

type Report = {
  trilhas: { total: number; updated: number; nivelSet: number; categoriaSet: number; warnings: string[] };
  funcionarios: { total: number; updated: number; trilhasConverted: number; statusFixed: number; concluidasConverted: number; duplicatesRemoved: number; warnings: string[] };
  empresas: { total: number; updated: number; categoriasInit: number; trilhasInit: number; warnings: string[] };
};

const CATEGORIAS = ["Comunicação", "Gestão de Tempo", "Inovação", "Liderança", "Diversidade"] as const;
type Categoria = typeof CATEGORIAS[number];

function inferCategoria(doc: any): Categoria | null {
  const nome = (doc?.nome || "").toString().toLowerCase();
  const tags = (doc?.tags || []).join(" ").toLowerCase();
  const areas = (doc?.areasAbordadas || []).join(" ").toLowerCase();
  const bucket = `${nome} ${tags} ${areas}`;

  if (/(diversidade|inclus[aã]o|dei|equidade|vi[eé]s)/.test(bucket)) return "Diversidade";
  if (/(lideran[cç]a|gest[aã]o de pessoas|l[ií]der)/.test(bucket)) return "Liderança";
  if (/(inova[cç][aã]o|criatividade|design thinking|prototipagem|ag[ií]l)/.test(bucket)) return "Inovação";
  if (/(gest[aã]o de tempo|produtividade|prioriza[cç][aã]o|wip|cerim[oô]nias)/.test(bucket)) return "Gestão de Tempo";
  if (/(comunica[cç][aã]o|orat[oó]ria|apresenta[cç][oõ]es|negocia[cç][aã]o|feedback)/.test(bucket)) return "Comunicação";
  return null;
}

export async function POST(req: Request) {
  // Protegido: apenas ADMIN pode rodar a migração
  const auth = await authenticateAndAuthorize(req as any, "ADMIN");
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await connectDB();

  const report: Report = {
    trilhas: { total: 0, updated: 0, nivelSet: 0, categoriaSet: 0, warnings: [] },
    funcionarios: { total: 0, updated: 0, trilhasConverted: 0, statusFixed: 0, concluidasConverted: 0, duplicatesRemoved: 0, warnings: [] },
    empresas: { total: 0, updated: 0, categoriasInit: 0, trilhasInit: 0, warnings: [] },
  };

  // --- Migrar Trilhas ---
  const trilhas = await Trilha.find({});
  report.trilhas.total = trilhas.length;
  for (const t of trilhas) {
    let changed = false;
    // Nível padrão
    if (!t.nivel || !["Iniciante", "Intermediário", "Avançado"].includes(t.nivel)) {
      t.nivel = "Intermediário";
      report.trilhas.nivelSet += 1;
      changed = true;
    }
    // Categoria obrigatória
    if (!t.categoria || !CATEGORIAS.includes(t.categoria)) {
      const cat = inferCategoria(t) || "Comunicação";
      t.categoria = cat;
      report.trilhas.categoriaSet += 1;
      changed = true;
    }
    if (changed) {
      await t.save();
      report.trilhas.updated += 1;
    }
  }

  // --- Migrar Funcionários ---
  const funcionarios = await Funcionario.find({});
  report.funcionarios.total = funcionarios.length;
  for (const f of funcionarios) {
    let changed = false;
    const novasTrilhasAtivas: any[] = [];
    const vistoAtivo = new Set<string>();

    // trilhas (ativas)
    for (const entry of f.trilhas || []) {
      const asAny: any = entry as any;
      if (asAny && asAny.trilha) {
        // já é subdoc; garantir status
        const idStr = String(asAny.trilha);
        if (!vistoAtivo.has(idStr)) {
          if (!asAny.status || !["não_iniciado", "em_andamento"].includes(asAny.status)) {
            asAny.status = asAny.status === "iniciado" || asAny.status === "pendente" ? "não_iniciado" : "não_iniciado";
            report.funcionarios.statusFixed += 1;
          }
          novasTrilhasAtivas.push({ trilha: asAny.trilha, status: asAny.status, dataInicio: asAny.dataInicio });
          vistoAtivo.add(idStr);
        }
      } else if (asAny) {
        // é ObjectId
        const idStr = String(asAny);
        if (!vistoAtivo.has(idStr)) {
          novasTrilhasAtivas.push({ trilha: asAny, status: "não_iniciado" });
          vistoAtivo.add(idStr);
          report.funcionarios.trilhasConverted += 1;
        }
      }
    }

    const novasConcluidas: any[] = [];
    const vistoConcluida = new Set<string>();
    for (const entry of f.trilhasConcluidas || []) {
      const asAny: any = entry as any;
      if (asAny && asAny.trilha) {
        const idStr = String(asAny.trilha);
        if (!vistoConcluida.has(idStr)) {
          novasConcluidas.push({ trilha: asAny.trilha, dataConclusao: asAny.dataConclusao });
          vistoConcluida.add(idStr);
        }
      } else if (asAny) {
        const idStr = String(asAny);
        if (!vistoConcluida.has(idStr)) {
          novasConcluidas.push({ trilha: asAny, dataConclusao: undefined });
          vistoConcluida.add(idStr);
          report.funcionarios.concluidasConverted += 1;
        }
      }
    }

    // Remover das ativas as que também estão concluídas (duplicatas)
    const concluidasSet = new Set(novasConcluidas.map((x) => String(x.trilha)));
    const ativasFiltradas = novasTrilhasAtivas.filter((x) => {
      const isDup = concluidasSet.has(String(x.trilha));
      if (isDup) report.funcionarios.duplicatesRemoved += 1;
      return !isDup;
    });

    // Detecta mudanças
    const changedAtivas = JSON.stringify(ativasFiltradas) !== JSON.stringify(f.trilhas || []);
    const changedConcl = JSON.stringify(novasConcluidas) !== JSON.stringify(f.trilhasConcluidas || []);
    if (changedAtivas || changedConcl) {
      f.trilhas = ativasFiltradas as any;
      f.trilhasConcluidas = novasConcluidas as any;
      changed = true;
    }

    if (changed) {
      await f.save();
      report.funcionarios.updated += 1;
    }
  }

  // --- Migrar Empresas ---
  const empresas = await Empresa.find({});
  report.empresas.total = empresas.length;
  for (const e of empresas) {
    let changed = false;
    if (!Array.isArray(e.categoriasAssociadas)) {
      e.categoriasAssociadas = [] as any;
      report.empresas.categoriasInit += 1;
      changed = true;
    }
    if (!Array.isArray(e.trilhasAssociadas)) {
      (e as any).trilhasAssociadas = [];
      report.empresas.trilhasInit += 1;
      changed = true;
    }
    if (changed) {
      await e.save();
      report.empresas.updated += 1;
    }
  }

  return NextResponse.json({ success: true, report }, { status: 200 });
}
