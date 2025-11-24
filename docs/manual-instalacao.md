# 📖 Manual de Instalação - Radar Entrenova

## 📋 Sumário

- [Pré-requisitos](#pré-requisitos)
- [Instalação do Ambiente](#instalação-do-ambiente)
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
- [Configuração das Variáveis de Ambiente](#configuração-das-variáveis-de-ambiente)
- [Instalação das Dependências](#instalação-das-dependências)
- [Execução do Projeto](#execução-do-projeto)
- [Verificação da Instalação](#verificação-da-instalação)
- [Solução de Problemas](#solução-de-problemas)

---

## 🔧 Pré-requisitos

Antes de iniciar a instalação, certifique-se de ter os seguintes softwares instalados em seu sistema:

### Obrigatórios

- **Node.js** (versão 18.x ou superior)
  - Download: https://nodejs.org/
  - Verifique a instalação: `node --version`

- **pnpm** (gerenciador de pacotes)
  - Instalação: `npm install -g pnpm`
  - Verifique a instalação: `pnpm --version`

- **MongoDB** (versão 6.0 ou superior)
  - Download: https://www.mongodb.com/try/download/community
  - Ou use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

- **Git**
  - Download: https://git-scm.com/downloads
  - Verifique a instalação: `git --version`

### Opcionais (mas recomendados)

- **VS Code** (Editor de código)
  - Download: https://code.visualstudio.com/

- **MongoDB Compass** (Interface gráfica para MongoDB)
  - Download: https://www.mongodb.com/products/compass

---

## 🚀 Instalação do Ambiente

### 1. Clone o Repositório

```bash
# Via HTTPS
git clone https://github.com/equipeecho/EchoNova.git

# Ou via SSH
git clone git@github.com:equipeecho/EchoNova.git

# Navegue até a pasta do projeto
cd EchoNova
```

### 2. Acesse a pasta da aplicação

```bash
cd app
```

---

## 🗄️ Configuração do Banco de Dados

### Opção 1: MongoDB Local

1. **Inicie o serviço do MongoDB**

   **Windows:**
   ```powershell
   # O MongoDB geralmente inicia automaticamente após a instalação
   # Caso não esteja rodando, execute:
   net start MongoDB
   ```

   **Linux/Mac:**
   ```bash
   sudo systemctl start mongod
   # ou
   sudo service mongod start
   ```

2. **Verifique se o MongoDB está rodando**
   ```bash
   # Tente conectar via mongosh (MongoDB Shell)
   mongosh
   ```

### Opção 2: MongoDB Atlas (Cloud)

1. Acesse https://www.mongodb.com/cloud/atlas
2. Crie uma conta gratuita
3. Crie um novo cluster (tier gratuito disponível)
4. Configure as credenciais de acesso
5. Obtenha a string de conexão (connection string)
6. Adicione seu IP à whitelist

---

## ⚙️ Configuração das Variáveis de Ambiente

1. **Crie o arquivo `.env` na pasta `app`**

```bash
# Na pasta app
touch .env
```

2. **Configure as variáveis de ambiente**

Copie o conteúdo abaixo e ajuste conforme sua configuração:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/echonova
# Ou para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/echonova?retryWrites=true&w=majority

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

# Provedores de IA (configure pelo menos um)
# Gemini (Google)
GEMINI_API_KEY=sua_chave_api_gemini

# OpenAI (opcional, como fallback)
OPENAI_API_KEY=sua_chave_api_openai

# Configuração de Email (para envio de diagnósticos)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_app
EMAIL_FROM=noreply@radarentrenova.com.br

# Stripe (para pagamentos)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT Secret (para autenticação)
JWT_SECRET=seu_secret_super_seguro_aqui_mude_em_producao

# URLs de Callback
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 🔑 Como Obter as Chaves de API

#### Gemini API Key
1. Acesse https://makersuite.google.com/app/apikey
2. Crie uma nova API Key
3. Copie e cole no arquivo `.env`

#### OpenAI API Key (opcional)
1. Acesse https://platform.openai.com/api-keys
2. Crie uma nova API Key
3. Copie e cole no arquivo `.env`

#### Stripe Keys (para pagamentos)
1. Acesse https://dashboard.stripe.com/test/apikeys
2. Copie as chaves de teste
3. Cole no arquivo `.env`

---

## 📦 Instalação das Dependências

Na pasta `app`, execute:

```bash
# Instalar todas as dependências do projeto
pnpm install

# Isso pode levar alguns minutos na primeira vez
```

### Verificar Instalação das Dependências

```bash
# Listar dependências instaladas
pnpm list
```

---

## ▶️ Execução do Projeto

### Modo Desenvolvimento

```bash
# Na pasta app
pnpm dev
```

O servidor estará disponível em: **http://localhost:3000**

### Modo Produção

```bash
# Build da aplicação
pnpm build

# Executar em produção
pnpm start
```

### Scripts Úteis

```bash
# Executar linter
pnpm lint

# Executar testes
pnpm test

# Popular banco de dados com dados de teste
pnpm seed
```

---

## ✅ Verificação da Instalação

### 1. Verifique se o servidor está rodando

Abra o navegador e acesse: **http://localhost:3000**

Você deve ver a página inicial do Radar Entrenova.

### 2. Teste a conexão com o banco de dados

```bash
# Execute um script de teste (dentro da pasta app)
node -e "require('./src/lib/mongodb').connectToDatabase().then(() => console.log('✅ MongoDB conectado!')).catch(err => console.error('❌ Erro:', err))"
```

### 3. Verifique os logs do servidor

No terminal onde você executou `pnpm dev`, você deve ver:

```
✓ Ready in 2.5s
○ Compiling / ...
✓ Compiled / in 1.2s
MongoDB conectado com sucesso!
```

### 4. Teste o diagnóstico básico

1. Acesse http://localhost:3000
2. Clique em "Iniciar Diagnóstico"
3. Responda o questionário simplificado
4. Verifique se o diagnóstico é gerado corretamente

---

## 🔧 Solução de Problemas

### ❌ Erro: "Cannot connect to MongoDB"

**Solução:**
```bash
# Verifique se o MongoDB está rodando
mongosh

# Se não estiver, inicie o serviço
# Windows:
net start MongoDB

# Linux/Mac:
sudo systemctl start mongod
```

### ❌ Erro: "Module not found"

**Solução:**
```bash
# Limpe o cache e reinstale as dependências
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### ❌ Erro: "Port 3000 is already in use"

**Solução:**
```bash
# Windows - Encontre e mate o processo na porta 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Ou execute em outra porta
PORT=3001 pnpm dev
```

### ❌ Erro: "Invalid API Key" (Gemini/OpenAI)

**Solução:**
1. Verifique se as chaves foram copiadas corretamente no `.env`
2. Confirme que não há espaços extras antes/depois das chaves
3. Teste a chave diretamente na documentação da API
4. Regenere uma nova chave se necessário

### ❌ Erro: "ECONNREFUSED" ao enviar email

**Solução:**
1. Verifique as credenciais SMTP no `.env`
2. Para Gmail, use "Senhas de App" ao invés da senha normal
3. Ative "Acesso a apps menos seguros" se necessário

### ❌ Build falha com erro de TypeScript

**Solução:**
```bash
# Limpe o cache do Next.js
rm -rf .next

# Rebuild
pnpm build
```

---

## 📞 Suporte

Se você encontrar problemas durante a instalação:

1. Verifique os logs de erro no terminal
2. Consulte a [documentação oficial do Next.js](https://nextjs.org/docs)
3. Verifique as issues no GitHub do projeto
4. Entre em contato com a equipe de desenvolvimento

---

## 🎉 Instalação Concluída!

Se você chegou até aqui e todos os testes passaram, parabéns! 🚀

Seu ambiente está configurado e pronto para desenvolvimento.

Próximos passos:
- Leia o [Manual do Usuário](./manual-usuario.md)
- Consulte a [Documentação da API](./api.md)
- Explore o código e contribua!

---

**Desenvolvido pela Equipe Echo - FATEC SJC 2025-2**
