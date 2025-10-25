// app/src/lib/stores/useAuthStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Definimos a interface (o "formato") dos dados do nosso usuário.
interface User {
  id: string;
  nome_empresa: string;
  email: string;
  planoAtivo: string | null;
}

// 2. Definimos a interface do nosso "store" (o estado e as ações).
interface AuthState {
  user: User | null; // O usuário pode ser um objeto User ou nulo (se não estiver logado).
  login: (userData: User) => void; // Ação para fazer login.
  logout: () => void; // Ação para fazer logout.
}

// 3. Criamos o store com Zustand.
export const useAuthStore = create<AuthState>()(
  // A função `persist` do Zustand salva automaticamente o estado no localStorage.
  // Isso significa que, se o usuário recarregar a página, ele continuará logado!
  persist(
    (set) => ({
      // Estado inicial
      user: null,

      // Ação de login: recebe os dados do usuário e os armazena no estado.
      login: (userData) => set({ user: userData }),

      // Ação de logout: limpa os dados do usuário do estado.
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage', // Nome da chave no localStorage.
      storage: createJSONStorage(() => localStorage), // Especifica que queremos usar o localStorage.
      // Adiciona um atraso para garantir que o localStorage esteja disponível
      partialize: (state) => ({ user: state.user }),
    }
  )
);