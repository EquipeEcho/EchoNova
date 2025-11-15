import { NextRequest, NextFetchEvent } from "next/server";
import { jwtVerify } from "jose";
import Empresa from "@/models/Empresa";
import { connectDB } from "@/lib/mongodb";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    nome_empresa: string;
    plano: string | null;
    tipo_usuario: string;
  };
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { payload, error: null };
  } catch (error) {
    return { payload: null, error };
  }
}

export async function authenticateAndAuthorize(
  request: NextRequest,
  requiredRole: "ADMIN" | "USER" | "ANY" = "ANY"
) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : request.cookies.get("auth_token")?.value;

    if (!token) {
      return {
        isAuthorized: false,
        error: "Não autorizado: token não encontrado",
        status: 401,
        user: null
      };
    }

    const { payload, error } = await verifyToken(token);
    
    if (error || !payload) {
      return {
        isAuthorized: false,
        error: "Não autorizado: token inválido",
        status: 401,
        user: null
      };
    }

    // Fetch user from database to verify role
    const user = await Empresa.findById(payload.id).select("-senha");
    
    if (!user) {
      return {
        isAuthorized: false,
        error: "Não autorizado: usuário não encontrado",
        status: 401,
        user: null
      };
    }

    // Check if user has required role
    if (requiredRole !== "ANY" && user.tipo_usuario !== requiredRole) {
      return {
        isAuthorized: false,
        error: "Acesso negado: permissões insuficientes",
        status: 403,
        user: null
      };
    }

    return {
      isAuthorized: true,
      error: null,
      status: 200,
      user: {
        id: user._id.toString(),
        email: user.email,
        nome_empresa: user.nome_empresa,
        plano: user.planoAtivo,
        tipo_usuario: user.tipo_usuario
      }
    };
  } catch (error: any) {
    return {
      isAuthorized: false,
      error: "Erro interno de autenticação",
      status: 500,
      user: null
    };
  }
}