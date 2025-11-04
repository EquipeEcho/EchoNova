Modelos Mongoose do Projeto
│
├── 📄 **Empresa.ts**
│   └── 📝 **Função:** Define o modelo para os dados da empresa. É a entidade central que agrega a maioria das outras informações.
│   └── 🔗 **Ligações:**
│       ├── ➡️ **User.ts:** Cada usuário pertence a uma empresa.
│       ├── ➡️ **Transacao.ts:** Cada transação é associada a uma empresa.
│       ├── ➡️ **Diagnostico.ts:** Cada diagnóstico é realizado por uma empresa.
│       ├── ➡️ **DiagnosticoAprofundado.ts:** Cada diagnóstico aprofundado está ligado a uma empresa.
│       └── ➡️ **AiSession.ts:** Cada sessão de chat com a IA é iniciada por uma empresa.
│
├── 📄 **User.ts**
│   └── 📝 **Função:** Armazena as informações dos usuários individuais.
│   └── 🔗 **Ligações:**
│       └── ⬅️ **Empresa.ts:** Possui uma referência obrigatória a uma `Empresa`, indicando a qual organização o usuário pertence.
│
├── 📄 **Transacao.ts**
│   └── 📝 **Função:** Modela os dados de transações financeiras, como pagamentos de planos.
│   └── 🔗 **Ligações:**
│       ├── ⬅️ **Empresa.ts:** Contém uma referência à `Empresa` que realizou a transação.
│       └── ➡️ **Empresa.ts:** O modelo `Empresa` possui um campo `transacaoAtualId` que pode referenciar uma `Transacao`.
│
├── 📄 **Diagnostico.ts**
│   └── 📝 **Função:** Guarda os resultados do diagnóstico inicial preenchido pela empresa.
│   └── 🔗 **Ligações:**
│       └── ⬅️ **Empresa.ts:** É diretamente associado a uma `Empresa`.
│
├── 📄 **Respostas.ts**
│   └── 📝 **Função:** Armazena as respostas brutas de um questionário, provavelmente relacionado ao diagnóstico.
│   └── 🔗 **Ligações:**
│       └── ⬅️ **Empresa.ts:** Ligado a uma empresa através do `empresaID`.
│
├── 📄 **AiSession.ts**
│   └── 📝 **Função:** Serve como um registro temporário para as conversas em andamento com a inteligência artificial.
│   └── 🔗 **Ligações:**
│       ├── ⬅️ **Empresa.ts:** Vinculado a uma `Empresa` para identificar quem iniciou a sessão.
│       └── ➡️ **DiagnosticoAprofundado.ts:** A `sessionId` pode ser usada para ligar a sessão ao diagnóstico aprofundado final.
│
└── 📄 **DiagnosticoAprofundado.ts**
    └── 📝 **Função:** Armazena os resultados detalhados do diagnóstico conduzido pela IA, incluindo o histórico da conversa e o relatório final.
    └── 🔗 **Ligações:**
        ├── ⬅️ **Empresa.ts:** Referencia a `Empresa` que realizou o diagnóstico.
        └── ⬅️ **AiSession.ts:** O histórico da conversa (`conversationHistory`) e o `sessionId` são originados da `AiSession`.