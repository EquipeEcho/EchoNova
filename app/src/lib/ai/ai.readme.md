📁 **src/lib/ai/ (Núcleo de Abstração da IA)**
│
├── 📄 **ChatProvider.ts (O Contrato / A Planta Baixa)**
│   └── 📝 **Função:** Este é o arquivo mais importante para a arquitetura. Ele define um "contrato" que qualquer provedor de IA deve seguir. Ele não sabe *como* se comunicar com uma IA, apenas *quais* estruturas de dados e métodos devem existir.
│   │
│   ├── 🧩 **interface IaResponse:** Define um formato de resposta PADRÃO. Não importa se a resposta veio do OpenAI ou do Ollama, ela sempre será convertida para esta estrutura. Isso permite que o resto da sua aplicação (a interface do usuário, por exemplo) espere sempre o mesmo formato de dados.
│   │
│   ├── 🧩 **interface HistoryMessage:** Define um formato PADRÃO para o histórico da conversa. Garante que o histórico seja gerenciado da mesma forma, independentemente do provedor.
│   │
│   └── 🧩 **interface ChatProvider:** É o contrato principal. Declara que qualquer classe que se considere um "ChatProvider" DEVE ter um método chamado `sendMessage` que aceita uma mensagem, um histórico e um prompt inicial, e retorna uma `Promise<IaResponse>`.
│
├── 📁 **Implementações Concretas (Os Trabalhadores)**
│   │
│   ├── 📄 **OpenAIProvider.ts**
│   │   └── 📝 **Função:** É a implementação específica do "contrato" para se comunicar com a API do OpenAI (ChatGPT).
│   │   └── 🔗 **Ligações e Lógica:**
│   │       ├── ➡️ **Implementa:** `ChatProvider`. Ele cumpre as regras definidas em `ChatProvider.ts`.
│   │       ├── ⬅️ **Depende de:** `ChatProvider.ts` para usar as interfaces `IaResponse` e `HistoryMessage`.
│   │       └── ⚙️ **Como funciona:**
│   │           1. Lê a chave da API do OpenAI (`OPENAI_API_KEY`).
│   │           2. Usa a API REST do OpenAI para enviar mensagens ao ChatGPT.
│   │           3. Envia a mensagem e o histórico no formato que a API do OpenAI espera.
│   │           4. Recebe a resposta em texto JSON, a analisa (`JSON.parse`) e a converte para o tipo `IaResponse`.
│   │
│   └── 📄 **OllamaProvider.ts**
│       └── 📝 **Função:** É a implementação específica do "contrato" para se comunicar com um servidor Ollama local ou remoto.
│       └── 🔗 **Ligações e Lógica:**
│           ├── ➡️ **Implementa:** `ChatProvider`. Ele também obedece às mesmas regras.
│           ├── ⬅️ **Depende de:** `ChatProvider.ts` para as interfaces padrão.
│           └── ⚙️ **Como funciona:**
│               1. Lê as URLs do servidor Ollama (`OLLAMA_BASE_URL` e `OLLAMA_MODEL_NAME`).
│               2. Usa a função `fetch` para fazer uma requisição HTTP para a API do Ollama.
│               3. **Adapta** o formato do histórico do padrão `HistoryMessage` para o formato que a API do Ollama espera (ex: `role: "model"` vira `role: "assistant"`).
│               4. Recebe a resposta, extrai o conteúdo JSON e o converte para o tipo `IaResponse`.
│
└── 📄 **providerFactory.ts (A Fábrica / O Gerente)**
    └── 📝 **Função:** Este arquivo atua como uma "fábrica". Sua única responsabilidade é decidir qual provedor de IA deve ser usado, instanciá-lo e entregá-lo para quem o solicitou. Isso é crucial para desacoplar o código.
    └── 🔗 **Ligações e Lógica:**
        ├── ⬅️ **Depende de:** `ChatProvider.ts`, `OpenAIProvider.ts`, e `OllamaProvider.ts`.
        └── ⚙️ **Como funciona:**
            1. Lê a variável de ambiente `AI_PROVIDER` para saber qual IA a aplicação deve usar.
            2. Usa um `switch` para verificar o valor.
            3. Se for "OLLAMA", cria uma `new OllamaProvider()`.
            4. Se for "OPENAI" (ou qualquer outro valor, por ser o padrão), cria uma `new OpenAIProvider()`.
            5. Retorna a instância criada. O importante é que o tipo de retorno da função é `ChatProvider` (a interface), e não a classe concreta. O código que chama `getChatProvider()` não precisa saber se recebeu um OpenAI ou um Ollama, apenas que o objeto retornado tem um método `sendMessage`.

---

### **Resumo da Arquitetura e Fluxo de Dados:**

1.  **Definição do Padrão:** O `ChatProvider.ts` cria um padrão universal de como a aplicação vai interagir com qualquer IA.
2.  **Implementação Específica:** `OpenAIProvider.ts` e `OllamaProvider.ts` são implementações "plugáveis". Cada um sabe como "falar" com sua respectiva IA e como "traduzir" a conversa para o padrão universal.
3.  **Seleção Dinâmica:** O `getChatProvider()` funciona como um gerente que lê uma configuração (`AI_PROVIDER`) e escolhe qual "trabalhador" (OpenAI ou Ollama) será usado na aplicação.
4.  **Uso Desacoplado:** O resto da sua aplicação simplesmente chama `getChatProvider()` uma vez para obter um provedor e, a partir daí, apenas usa o método `.sendMessage()`, sem se preocupar com os detalhes de qual IA está por trás.

Essa arquitetura torna o sistema extremamente **flexível**. Se amanhã você quiser adicionar suporte para outra IA, basta criar um arquivo novo que siga o mesmo "contrato" e adicionar um `case` no `switch` da fábrica. Nenhuma outra parte do seu código precisará ser alterada.