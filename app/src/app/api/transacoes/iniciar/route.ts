import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Transacao from "@/models/Transacao";
import Empresa from "@/models/Empresa";

// Simula os preços dos planos
const PLANOS = {
    essencial: 590,
    avancado: 990,
    escalado: 0, // "Sob Consulta"
};

export async function POST(req: Request) {
    try {
        const { empresaId, plano } = await req.json();

        if (!empresaId || !plano) {
            return NextResponse.json(
                { error: "empresaId e plano são obrigatórios" },
                { status: 400 }
            );
        }

        await connectDB();

        // Verifica se a empresa existe
        const empresa = await Empresa.findById(empresaId);
        if (!empresa) {
            return NextResponse.json(
                { error: "Empresa não encontrada" },
                { status: 404 }
            );
        }

        // Cria uma nova transação “pendente”
        const planoKey = plano.toLowerCase() as keyof typeof PLANOS;
        const valorPlano = PLANOS[planoKey] ?? 0;

        const novaTransacao = await Transacao.create({
            empresaId,
            plano,
            valor: valorPlano,
            status: "pendente",
            dataCriacao: new Date(),
        });


        // Associa à empresa
        empresa.transacaoAtualId = novaTransacao._id;
        await empresa.save();

        return NextResponse.json({
            message: "Transação iniciada com sucesso",
            transacaoId: novaTransacao._id,
            valor: valorPlano,
            status: "pendente",
        });
    } catch (error) {
        console.error("Erro ao iniciar transação:", error);
        return NextResponse.json(
            { error: "Erro interno ao iniciar transação" },
            { status: 500 }
        );
    }
}
