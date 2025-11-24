📁 app/src/ (Raiz do Projeto)
│
├── 🎨 **Frontend: Interface do Usuário (Páginas)**
│   │
│   ├── 📁 app/admin/
│   │   └── 📄 page.tsx: Constrói a interface visual completa do painel de administração. É responsável por buscar e exibir listas de empresas e diagnósticos em abas, além de gerenciar um modal para criação e edição de registros. Comunica-se exclusivamente com as rotas em `/api/admin/` para realizar todas as operações de dados.
│   │
│   ├── 📁 app/cadastroLogin/
│   │   ├── 📄 page.tsx: Define a estrutura visual da página de login, importando e renderizando o componente de formulário.
│   │   └── 📄 clientFuncsCadLog.tsx: Implementa o componente de formulário de login (`CadastroLoginPag`). Gerencia os estados dos campos de input (email, CNPJ, senha) e envia as credenciais para a API `/api/login` ao submeter o formulário.
│   │
│   ├── 📁 app/diagnostico-aprofundado/
│   │   ├── 📄 page.tsx: Orquestra a interface do chat interativo com a IA. Controla o fluxo do diagnóstico por fases ("setup", "confirmacao", "diagnostico"), envia as respostas do usuário para a rota `/api/diagnostico-ia` e exibe as perguntas retornadas pela IA, funcionando como uma "máquina de estados" para a conversa.
│   │   └── 📁 resultados/[id]/
│   │       └── 📄 page.tsx: Exibe o relatório final de um diagnóstico aprofundado. Utiliza o ID da URL para buscar os dados do diagnóstico na API, renderiza o relatório (em formato Markdown) e oferece a funcionalidade de download do resultado em PDF.
│   │
│   └── 📄 app/clientFuncs.tsx: Agrupa componentes React reutilizáveis para a interface principal.
│       ├── `Ondas`: Renderiza o efeito visual de fundo com ondas animadas (SVG).
│       ├── `Header`: Cria o cabeçalho fixo com links de redes sociais e o botão que abre o modal de login.
│       └── `DialogCloseButton`: Implementa o modal (popup) de login, gerenciando seu estado e interagindo com a API `/api/login` e o store de autenticação.
│
├── 🌐 **Backend: API e Lógica de Negócios (Rotas do Servidor)**
│   │
│   └── 📁 app/api/
│       ├── 📁 admin/
│       │   ├── 📁 diagnosticos/
│       │   │   ├── 📄 route.ts: Endpoint `GET` que lista todos os diagnósticos, populando o nome da empresa associada para exibição no painel.
│       │   │   └── 📄 [id]/route.ts: Endpoint `DELETE` para remover um diagnóstico específico do banco.
│       │   └── 📁 empresas/
│       │       ├── 📄 route.ts: Endpoints `GET` para listar e `POST` para criar empresas (com criptografia de senha).
│       │       └── 📄 [id]/route.ts: Endpoints `PUT` para atualizar e `DELETE` para remover uma empresa (incluindo a lógica para remover seus diagnósticos associados).
│       │
│       ├── 📁 diagnostico-aprofundado/
│       │   ├── 📄 [id]/route.ts: Endpoint `GET` seguro que busca um diagnóstico aprofundado específico, validando a posse pelo usuário autenticado via JWT.
│       │   └── 📄 ultimo/route.ts: Endpoint `GET` seguro que busca o diagnóstico aprofundado mais recente do usuário autenticado.
│       │
│       ├── 📁 diagnosticos/
│       │   ├── 📄 route.ts: Rota principal do diagnóstico inicial. O `POST` cria a `Empresa` se ela não existir (com senha temporária segura), processa os resultados (usando IA com fallback) e salva o `Diagnostico`. O `GET` lista diagnósticos de uma empresa.
│       │   └── 📄 [id]/route.ts: Fornece endpoints `GET`, `PUT` e `DELETE` para gerenciar um único diagnóstico inicial.
│       │
│       ├── 📁 empresa/
│       │   └── 📄 [id]/route.ts: Endpoint `GET` para buscar dados públicos de uma empresa pelo seu ID.
│       │
│       ├── 📁 empresas/
│       │   ├── 📄 route.ts: Endpoint `POST` para criar uma empresa, usado no fluxo do diagnóstico inicial.
│       │   └── 📄 check-cnpj/route.ts: Endpoint de utilidade (`POST`) para verificar se um CNPJ já está cadastrado.
│       │
│       ├── 📁 transacoes/
│       │   ├── 📄 iniciar/route.ts: Endpoint `POST` que cria um registro de `Transacao` com status "pendente".
│       │   ├── 📄 finalizar/route.ts: Endpoint `POST` que conclui a compra. Atualiza a transação para "concluída", ativa o `planoAtivo` na `Empresa`, e atualiza os dados cadastrais (senha definitiva, email, etc.).
│       │   └── 📄 [id]/route.ts: Endpoint `GET` que busca os detalhes de uma transação específica.
│       │
│       ├── 📄 diagnostico-ia/route.ts: **O motor da conversa com a IA.** Gerencia a sessão de chat (`AiSession`), autentica o usuário, envia o histórico da conversa para o provedor de IA e, quando a IA finaliza, cria o registro permanente `DiagnosticoAprofundado` e remove a sessão temporária.
│       ├── 📄 login/route.ts: Endpoint `POST` para autenticação. Valida credenciais, compara a senha (`bcrypt`), gera um token JWT e o envia ao cliente dentro de um cookie `HttpOnly` seguro.
│       ├── 📄 register/route.ts: Endpoint `POST` para registro direto de uma nova empresa, garantindo que a senha seja criptografada.
│       ├── 📄 respostas/route.ts: Endpoint `POST` simples para armazenar as respostas brutas de um formulário no banco de dados.
│       ├── 📄 send-diagnostico/route.ts: Endpoint `POST` que usa `jsPDF` para gerar um relatório em PDF no servidor e `nodemailer` para enviá-lo como anexo por e-mail.
│       └── 📄 send-pagamento/route.ts: Endpoint `POST` que gera um PDF de confirmação de pagamento e o envia por e-mail ao cliente.
│
├── 🧩 **Componentes de UI Reutilizáveis (components/ui/)**
│   ├── 📄 button.tsx: Fornece o componente de botão base, estilizado e configurável.
│   ├── 📄 dialog.tsx: Implementa a base para a criação de modais (popups) interativos.
│   ├── 📄 input.tsx: Fornece o componente de campo de texto estilizado.
│   ├── 📄 label.tsx: Fornece o componente de rótulo para formulários, associado aos inputs.
│   ├── 📄 loader.tsx: Componente simples que exibe uma animação de carregamento e um texto.
│   ├── 📄 LoginForm.tsx: Componente encapsulado que contém toda a lógica de um formulário de login, incluindo gerenciamento de estado, validação, chamada à API e feedback ao usuário via toasts.
│   ├── 📄 PrimaryButton.tsx: Um wrapper sobre o `button.tsx` que padroniza o estilo dos botões de ação principal da aplicação (gradiente rosa).
│   ├── 📄 ProgressBar.tsx: Componente visual que renderiza uma barra de progresso para indicar o avanço em formulários de múltiplas etapas.
│   ├── 📄 select.tsx: Fornece componentes para criar menus de seleção (dropdowns).
│   └── 📄 tabs.tsx: Fornece componentes para criar interfaces organizadas em abas.
│
├── ⚙️ **Core & Bibliotecas de Suporte (lib/)**
│   │
│   ├── 📁 ai/
│   │   ├── 📄 ChatProvider.ts: **O Contrato da IA.** Define a estrutura padrão que toda comunicação com IA deve seguir, através das interfaces `IaResponse`, `HistoryMessage`, e `ChatProvider`. Garante que a aplicação seja agnóstica ao provedor de IA.
│   │   ├── 📄 OpenAIProvider.ts: Implementação específica do `ChatProvider` para se comunicar com a API do OpenAI (ChatGPT).
│   │   ├── 📄 OllamaProvider.ts: Implementação específica do `ChatProvider` para se comunicar com um servidor Ollama.
│   │   ├── 📄 providerFactory.ts: **A Fábrica de IA.** Uma função que lê uma variável de ambiente (`AI_PROVIDER`) e decide qual provedor (OpenAI, Ollama, etc.) instanciar e retornar, permitindo a troca de IAs sem alterar o código da aplicação.
│   │   └── 📄 ai.readme.md: Documentação em Markdown sobre a arquitetura do núcleo de IA.
│   │
│   ├── 📁 stores/
│   │   └── 📄 useAuthStore.ts: Define o "store" global de autenticação usando Zustand. Gerencia o estado do usuário logado (`user`) e fornece ações (`login`, `logout`). Utiliza o middleware `persist` para manter o usuário logado mesmo após recarregar a página.
│   │
│   ├── 📄 mongodb.ts: Utilitário de conexão com o banco de dados MongoDB. Implementa um sistema de cache de conexão para otimizar o desempenho em ambientes serverless.
│   ├── 📄 prompts.ts: **O "Cérebro" da IA.** Contém as instruções (prompts) detalhadas que guiam o comportamento da IA. `promptDiagnosticoAprofundado` define o fluxo da conversa, e `promptMiniDiagnostico` define as regras para processamento de dados do diagnóstico inicial.
│   └── 📄 utils.ts: Arquivo de utilidades, contendo a função `cn` para mesclar classes do Tailwind CSS de forma segura.
│
├── 🗃️ **Camada de Dados: Modelos Mongoose (models/)**
│   ├── 📄 AiSession.ts: Define o schema para sessões de chat temporárias com a IA, armazenando o histórico da conversa em andamento.
│   ├── 📄 Diagnostico.ts: Define o schema para os resultados do diagnóstico inicial (formulário).
│   ├── 📄 DiagnosticoAprofundado.ts: Define o schema para os resultados permanentes do diagnóstico com IA, incluindo o histórico completo e o relatório final.
│   ├── 📄 Empresa.ts: O schema central do projeto. Define a estrutura para os dados da empresa, incluindo informações de login, plano e referências a outras coleções.
│   ├── 📄 Respostas.ts: Define o schema para armazenar as respostas brutas de um questionário.
│   ├── 📄 Transacao.ts: Define o schema para transações financeiras (pagamentos de planos).
│   ├── 📄 User.ts: Define o schema para usuários individuais associados a uma empresa.
│   └── 📄 0-readme.models.md: Documentação em Markdown sobre a estrutura e interdependências dos modelos de dados.
│
└── 📚 **Recursos Adicionais**
    └── 📄 favicon.ico: Ícone do site que é exibido na aba do navegador.