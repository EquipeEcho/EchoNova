import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Empresa from "@/models/Empresa";
import bcrypt from "bcryptjs"; // CORREÇÃO: Importar bcryptjs para criptografar a senha

// POST - Criar nova empresa ou retornar existente
export async function POST(req: Request) {
  try {
    await connectDB();
    const { perfil } = await req.json();

    console.log("[API Empresas] Dados recebidos:", perfil);

    if (!perfil || !perfil.cnpj) {
      return NextResponse.json(
        { error: "Dados incompletos para criar empresa." },
        { status: 400 }
      );
    }

    // Verifica se já existe uma empresa com o mesmo CNPJ
    let empresaExistente = await Empresa.findOne({ cnpj: perfil.cnpj });
    
    if (empresaExistente) {
      console.log(`[API Empresas] Empresa já existe com CNPJ ${perfil.cnpj}, retornando existente`);
      // Retorna a empresa existente - permitindo múltiplos diagnósticos
      return NextResponse.json({ empresa: empresaExistente });
    }

    // Verifica se já existe uma empresa com o mesmo email
    const empresaComMesmoEmail = await Empresa.findOne({ email: perfil.email });
    
    if (empresaComMesmoEmail) {
      console.log(`[API Empresas] Email ${perfil.email} já cadastrado`);
      return NextResponse.json(
        { error: "Este email já foi cadastrado. Por favor, use outro email." },
        { status: 400 }
      );
    }

    // CORREÇÃO: Criar uma senha placeholder e criptografá-la
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(`temp_${Date.now()}`, salt); // Cria uma senha temporária única e segura

    console.log(`[API Empresas] Criando nova empresa para CNPJ ${perfil.cnpj}`);
    
    // Cria nova empresa
    const novaEmpresa = await Empresa.create({
      nome_empresa: perfil.empresa,
      email: perfil.email,
      cnpj: perfil.cnpj,
      senha: hashedPassword, // CORREÇÃO: Adicionado o campo 'senha' obrigatório
      area_atuacao: perfil.setor,
      tamanho: perfil.porte,
    });

    console.log(`[API Empresas] Nova empresa criada com ID: ${novaEmpresa._id}`);
    return NextResponse.json({ empresa: novaEmpresa });
  } catch (error) {
    console.error("[API Empresas] Erro ao criar empresa:", error);
    
    // Verifica se é erro de chave duplicada do MongoDB
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      const keyValue = (error as any).keyValue;
      if (keyValue?.email) {
        return NextResponse.json(
          { error: "Este email já foi cadastrado. Por favor, use outro email." },
          { status: 400 }
        );
      }
      if (keyValue?.cnpj) {
        return NextResponse.json(
          { error: "Este CNPJ já foi cadastrado. Por favor, use outro CNPJ." },
          { status: 400 }
        );
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro interno ao criar empresa.", details: errorMessage },
      { status: 500 }
    );
  }
}