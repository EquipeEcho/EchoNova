import { NextResponse } from "next/server";

/**
 * @description Rota para fazer logout do usuário.
 * Remove o cookie de autenticação.
 */
export async function POST() {
  try {
    const response = NextResponse.json({
      message: "Logout realizado com sucesso"
    });

    // Remove o cookie de autenticação
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expira imediatamente
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || "Erro interno no servidor" },
      { status: 500 },
    );
  }
}