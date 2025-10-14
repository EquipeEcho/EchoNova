# Mapa do Projeto EchoNova

Este documento descreve a estrutura de pastas e a finalidade de cada arquivo principal no projeto, servindo como um guia de referência para a equipe de desenvolvimento.

## `src/app/`

O diretório principal que segue a convenção do App Router do Next.js. Cada pasta aqui representa uma rota na aplicação.

### `api/` - Endpoints do Backend

Contém toda a lógica de servidor (rotas da API).

-   **`diagnostico-ia/route.ts`**: Orquestra a conversa interativa com a IA (Gemini) para o diagnóstico aprofundado, gerenciando o estado da conversa e o formato JSON das respostas.
-   **`diagnosticos/route.ts`**: Rota principal para os diagnósticos padrão.
    -   `POST`: Recebe as respostas do formulário, processa os resultados e salva um novo diagnóstico no banco de dados.
    -   `GET`: Lista os diagnósticos associados a um `empresaId`.
-   **`diagnosticos/[id]/route.ts`**: Gerencia operações para um diagnóstico específico.
    -   `GET`: Busca um único diagnóstico pelo seu ID.
    -   `PUT`: Atualiza um diagnóstico existente.
    -   `DELETE`: Remove um diagnóstico.
-   **`empresas/route.ts`**: Rota para listar as empresas cadastradas. Provavelmente usada para fins de administração ou debug.
-   **`login/route.ts`**: Valida as credenciais (`email`, `senha`, `cnpj`) de uma empresa e retorna os dados do usuário em caso de sucesso.
-   **`register/route.ts`**: Cadastra uma nova empresa no banco de dados, criptografando a senha.
-   **`respostas/routes.ts`**: Um endpoint para salvar respostas brutas do formulário, possivelmente um backup ou uma rota alternativa.

### `cadastroLogin/` - Página de Autenticação

-   **`page.tsx`**: Renderiza a página de Cadastro e Login, posicionando o componente principal na tela.
-   **`clientFuncsCadLog.tsx`**: Contém o componente React (`CadastroLoginPag`) com a interface (UI) e a lógica de cliente para os formulários de login e cadastro, incluindo as chamadas para a API.

### `diagnostico-aprofundado/` - Página do Diagnóstico com IA

-   **`page.tsx`**: A interface (UI) do diagnóstico aprofundado, responsável por exibir as perguntas da IA, capturar as respostas do usuário e se comunicar com a API `/api/diagnostico-ia`.

### `form/` - Componentes do Formulário Padrão

-   **`page.tsx`**: O componente central que gerencia o estado e o fluxo do diagnóstico padrão, controlando as etapas de "perfil", "seleção de dimensões" e o preenchimento de cada dimensão.
-   **`utils.tsx`**: Contém um componente genérico (`DiagnosticoPage`) e hooks customizados que criam a interface e a lógica de navegação (próximo/anterior) para qualquer etapa do formulário. É a base visual para o preenchimento das perguntas.
-   **`Perfil.tsx`**: Define a estrutura de dados e as perguntas da etapa "Perfil" do formulário.
-   **`PessoasCultura.tsx`**: Define as perguntas da dimensão "Pessoas e Cultura".
-   **`EstruturaOperacoes.tsx`**: Define as perguntas da dimensão "Estrutura e Operações".
-   **`MercadoClientes.tsx`**: Define as perguntas da dimensão "Mercado e Clientes".
-   **`DirecaoFuturo.tsx`**: Define as perguntas da dimensão "Direção e Futuro".

### `resultados/` - Página de Resultados

-   **`page.tsx`**: Exibe os resultados do diagnóstico padrão após o preenchimento. Busca os dados da API ou do `localStorage` e permite o download do relatório.

### Arquivos na Raiz de `app/`

-   **`page.tsx`**: A página inicial (landing page) da aplicação.
-   **`layout.tsx`**: O layout principal do site, que envolve todas as páginas. Define a estrutura `<html>` e `<body>`, fontes e metadados SEO padrão.
-   **`globals.css`**: Arquivo de estilos globais e configuração do Tailwind CSS.
-   **`clientFuncs.tsx`**: Contém componentes de cliente reutilizáveis em várias páginas, como o `Header` e a animação de ondas (`Ondas`).

## `src/components/ui/`

Componentes de UI genéricos e reutilizáveis, provavelmente baseados no `shadcn/ui`.

-   **`button.tsx`**: Componente de botão.
-   **`dialog.tsx`**: Componente de modal/popup.
-   **`input.tsx`**: Componente de campo de texto.
-   **`label.tsx`**: Componente de rótulo para formulários.
-   **`tabs.tsx`**: Componente para criar interfaces com abas.

## `src/lib/`

Utilitários e lógicas de suporte para a aplicação.

-   **`mongodb.ts`**: Gerencia a conexão com o banco de dados MongoDB, utilizando um sistema de cache para evitar múltiplas conexões.
-   **`prompts.ts`**: Contém o prompt principal que instrui a IA sobre como se comportar, qual a estrutura de dados esperada e quais perguntas fazer no diagnóstico aprofundado.
-   **`utils.ts`**: Função utilitária `cn` para mesclar classes do Tailwind CSS de forma condicional.

## `src/models/`

Define os Schemas do Mongoose, que representam a estrutura dos documentos nas coleções do MongoDB.

-   **`Diagnostico.ts`**: Schema para os dados do diagnóstico padrão.
-   **`DiagnosticoAprofundado.ts`**: Schema para salvar o histórico da conversa e o relatório final do diagnóstico com IA.
-   **`Empresa.ts`**: Schema para os dados da empresa (usuário principal).
-   **`Respostas.ts`**: Schema para as respostas brutas do formulário.
-   **`User.ts`**: Schema para usuários (possivelmente para múltiplos logins por empresa no futuro).