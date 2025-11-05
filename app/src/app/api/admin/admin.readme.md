📁 **Painel de Administração (app/admin)**
│
├── 🎨 **Frontend: A Interface do Usuário (app/admin/page.tsx)**
│   │   └── 📝 **Função Principal:** Renderizar a página de administração, buscar dados do backend, gerenciar o estado da interface e permitir que o administrador execute operações de CRUD (Criar, Ler, Atualizar, Deletar).
│   │
│   ├── 🧠 **Estado (State Management) com `useState`:**
│   │   ├── `empresas`, `diagnosticos`: Armazenam os dados buscados da API para exibição nas tabelas.
│   │   ├── `loading`, `error`: Controlam a exibição de mensagens de carregamento e erro durante a busca de dados.
│   │   ├── `isDialogOpen`: Um booleano que controla a visibilidade do modal (popup) de edição/criação de empresas.
│   │   └── `editingEmpresa`: Guarda os dados da empresa que está sendo criada ou editada no formulário. É `null` quando o modal está fechado.
│   │
│   ├── ⚙️ **Lógica e Efeitos com `useEffect`:**
│   │   └── `fetchData()`:
│   │       ├── **Função:** Disparada quando o componente é montado (`useEffect`).
│   │       ├── **Ação:** Faz duas chamadas `fetch` em paralelo (usando `Promise.all`) para as rotas `/api/admin/empresas` e `/api/admin/diagnosticos` para buscar todos os dados necessários de uma só vez.
│   │       └── **Resultado:** Preenche os estados `empresas` e `diagnosticos` com os dados recebidos, ou o estado `error` se algo falhar.
│   │
│   ├── ⚡ **Manipuladores de Eventos (Funções de Interação):**
│   │   ├── `handleAddNewEmpresa()`: Prepara o estado para criar uma nova empresa (define `editingEmpresa` como um objeto vazio) e abre o modal.
│   │   ├── `handleEditEmpresa(empresa)`: Recebe uma empresa da lista, coloca seus dados em `editingEmpresa` e abre o modal para edição.
│   │   ├── `handleDeleteEmpresa(id)`: Pede confirmação ao usuário e, em seguida, envia uma requisição `DELETE` para a API (`/api/admin/empresas/[id]`) para excluir a empresa. Após o sucesso, chama `fetchData()` para atualizar a lista.
│   │   ├── `handleDeleteDiagnostico(id)`: Similar ao anterior, mas para diagnósticos, chamando a API `/api/admin/diagnosticos/[id]`.
│   │   └── `handleSaveEmpresa(empresa)`:
│   │       ├── **Lógica Central:** Verifica se é uma criação (sem `_id`) ou uma edição (com `_id`).
│   │       ├── **Ação:** Envia uma requisição `POST` (para criar) ou `PUT` (para atualizar) para a API correspondente, enviando os dados do formulário no corpo da requisição.
│   │       └── **Resultado:** Ao concluir, fecha o modal e chama `fetchData()` para refletir as mudanças na tela.
│   │
│   └── 🧩 **Componentes:**
│       ├── `AdminPage`: O componente principal que contém toda a lógica e a estrutura da página.
│       ├── `Tabs`, `TabsContent`, etc.: Componentes da biblioteca de UI para organizar a visualização em abas (Empresas e Diagnósticos).
│       ├── `Dialog`, `DialogContent`, etc.: Componentes que criam o modal (popup). O modal é renderizado condicionalmente com base no estado `isDialogOpen`.
│       └── `EmpresaForm`:
│           ├── **Função:** Um componente de formulário isolado e reutilizável.
│           ├── **Responsabilidade:** Gerencia seu próprio estado interno para os campos do formulário (`formData`). Recebe os dados iniciais (`empresa`) e funções de callback (`onSave`, `onCancel`) como propriedades (props).
│           └── **Interdependência:** É filho de `AdminPage` e se comunica com ele através das props. Quando o usuário clica em "Salvar", ele chama a função `onSave` (que é a `handleSaveEmpresa` de `AdminPage`).
│
└── 🌐 **Backend: As Rotas da API (app/api/admin/)**
    │   └── 📝 **Função Principal:** Servir como uma ponte segura entre o frontend e o banco de dados. Elas recebem requisições HTTP (GET, POST, PUT, DELETE), executam a lógica de negócios (validação, criptografia) e interagem com o banco de dados através dos Models Mongoose.
    │
    ├── 📁 **Recurso: Empresas (`/api/admin/empresas`)**
    │   ├── 📄 `route.ts`:
    │   │   ├── `GET`: Busca todas as empresas no banco de dados (`Empresa.find()`) e as retorna.
    │   │   └── `POST`: Cria uma nova empresa.
    │   │       └── **Lógica Chave:** Recebe os dados do frontend, criptografa a senha com `bcrypt` se ela for fornecida, e salva no banco (`Empresa.create()`).
    │   └── 📄 `[id]/route.ts`:
    │       ├── `PUT`: Atualiza uma empresa existente.
    │       │   └── **Lógica Chave:** Recebe os novos dados, criptografa a nova senha (se houver) e atualiza o registro no banco (`Empresa.findByIdAndUpdate()`).
    │       └── `DELETE`: Exclui uma empresa.
    │           └── **Lógica Crítica (Transacional):** Primeiro, deleta todos os diagnósticos associados a essa empresa (`Diagnostico.deleteMany()`). Depois, deleta a própria empresa (`Empresa.findByIdAndDelete()`). Isso garante a integridade dos dados, não deixando diagnósticos "órfãos".
    │
    └── 📁 **Recurso: Diagnósticos (`/api/admin/diagnosticos`)**
        ├── 📄 `route.ts`:
        │   └── `GET`: Busca todos os diagnósticos.
        │       └── **Lógica Chave:** Usa `.populate("empresa", "nome_empresa")` para, em uma única consulta ao banco, substituir o ID da empresa pelo seu nome, facilitando a exibição no frontend.
        └── 📄 `[id]/route.ts`:
            └── `DELETE`: Exclui um diagnóstico específico pelo seu ID (`Diagnostico.findByIdAndDelete()`).

---

### **Fluxo de Dados (Exemplo de Edição):**

1.  **Usuário clica em "Editar"** na linha de uma empresa na `AdminPage`.
2.  A função `handleEditEmpresa()` é chamada no frontend.
3.  O estado `editingEmpresa` é preenchido com os dados da empresa clicada e `isDialogOpen` vira `true`.
4.  O componente `Dialog` aparece, e dentro dele, o `EmpresaForm` é renderizado com os dados da empresa.
5.  O usuário altera o nome da empresa no formulário. O estado interno do `EmpresaForm` é atualizado.
6.  O usuário clica em **"Salvar"**.
7.  O `EmpresaForm` chama sua prop `onSave`, que executa a função `handleSaveEmpresa` na `AdminPage`.
8.  `handleSaveEmpresa` envia uma requisição **`PUT`** para `/api/admin/empresas/[id]` com os dados atualizados.
9.  A rota de API no backend recebe a requisição, encontra a empresa no banco de dados e atualiza suas informações.
10. A API retorna uma resposta de sucesso.
11. O `.then()` da `fetch` em `handleSaveEmpresa` é executado, fechando o modal e chamando `fetchData()`.
12. `fetchData()` busca novamente a lista de empresas do backend, que agora contém os dados atualizados.
13. O React re-renderiza a tabela com o nome da empresa corrigido.