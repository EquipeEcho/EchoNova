import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/*  
  ============================================================
  TIPOS DE USUÁRIO SUPORTADOS
  ============================================================

  1. EMPRESA ADMIN
     - tipo_usuario = "ADMIN"
     - acessa painel do dono da plataforma

  2. EMPRESA USER (RH)
     - tipo_usuario = "USER"
     - acessa painel da empresa (RH)

  3. FUNCIONÁRIO
     - role = "FUNCIONARIO"
     - acessa página do colaborador (/pagina-funcionarios)
*/

// Dados mínimos para qualquer usuário logado
interface BaseUser {
  id: string;
  email: string;
}

// Dados específicos da Empresa (ADMIN e USER)
interface EmpresaUser extends BaseUser {
  nome_empresa: string;
  cnpj: string;
  tipo_usuario: "ADMIN" | "USER";
  planoAtivo: string | null; // essencial, avancado, escalado ou null
}

// Dados específicos do Funcionário
interface FuncionarioUser extends BaseUser {
  nome: string;
  matricula: string;
  cargo: string;
  empresa: string; // nome da empresa
  empresaId: string; // ObjectId da empresa
  role: "FUNCIONARIO";
}

// União dos tipos possíveis (empresa ou funcionário)
type User = EmpresaUser | FuncionarioUser;

interface AuthState {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Estado inicial
      user: null,

      // Salva todos os dados do usuário (RH, ADMIN ou FUNCIONÁRIO)
      login: (userData) => {
        set({ user: userData });
      },

      // Remove qualquer tipo de usuário
      logout: () => {
        set({ user: null });
      },
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),

      // O que salvar no localStorage
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
