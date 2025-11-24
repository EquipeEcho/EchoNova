# 🔌 Documentação da API - Radar Entrenova

## 📋 Sumário

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Estrutura de Respostas](#estrutura-de-respostas)
- [Endpoints - Empresas](#endpoints---empresas)
- [Endpoints - Diagnósticos](#endpoints---diagnósticos)
- [Endpoints - Funcionários](#endpoints---funcionários)
- [Endpoints - Trilhas](#endpoints---trilhas)
- [Endpoints - Autenticação](#endpoints---autenticação)
- [Endpoints - Admin](#endpoints---admin)
- [Webhooks](#webhooks)
- [Códigos de Status](#códigos-de-status)
- [Rate Limiting](#rate-limiting)
- [Exemplos de Uso](#exemplos-de-uso)

---

## 🌐 Visão Geral

A API do Radar Entrenova é uma API RESTful construída com Next.js 15 (App Router) que fornece acesso programático a todas as funcionalidades do sistema.

### Base URL

```
Desenvolvimento: http://localhost:3000/api
Produção: https://radarentrenova.com.br/api
```

### Formato de Dados

- **Request**: JSON
- **Response**: JSON
- **Encoding**: UTF-8

### Headers Obrigatórios

```http
Content-Type: application/json
Accept: application/json
```

---

## 🔐 Autenticação

### Tipos de Autenticação

#### 1. **Session-based (Cookies)**

Utilizado para autenticação web (frontend):

```javascript
// Login automático via cookie
fetch('/api/diagnosticos', {
  credentials: 'include' // Envia cookies
})
```

#### 2. **JWT Token** (Futuro)

Para integrações externas:

```http
Authorization: Bearer <token>
```

### Endpoints Públicos (Sem Autenticação)

- `POST /api/diagnosticos` - Criar diagnóstico simplificado
- `POST /api/register` - Registro de empresa
- `POST /api/login` - Login de empresa
- `POST /api/login-funcionario` - Login de funcionário

### Endpoints Protegidos

Requerem autenticação:
- Todos os endpoints `/api/admin/*`
- Endpoints de gestão de funcionários
- Endpoints de trilhas atribuídas
- Dashboard endpoints

---

## 📊 Estrutura de Respostas

### Sucesso

```json
{
  "success": true,
  "data": {
    // Dados solicitados
  },
  "message": "Operação realizada com sucesso"
}
```

### Erro

```json
{
  "success": false,
  "error": "Mensagem de erro descritiva",
  "code": "ERROR_CODE",
  "details": {} // Opcional
}
```

---

## 🏢 Endpoints - Empresas

### GET /api/empresas

Lista todas as empresas.

**Autenticação**: Requerida (Admin)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "nome_empresa": "Tech Solutions LTDA",
      "email": "contato@techsolutions.com",
      "cnpj": "12345678000190",
      "planoAtivo": "avancado",
      "tipo_usuario": "EMPRESA",
      "createdAt": "2025-11-15T10:30:00Z"
    }
  ]
}
```

### POST /api/register

Registra nova empresa (após pagamento).

**Autenticação**: Não requerida

**Request:**
```json
{
  "nome_empresa": "Tech Solutions LTDA",
  "email": "contato@techsolutions.com",
  "cnpj": "12345678000190",
  "senha": "SenhaSegura123!",
  "planoAtivo": "avancado"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "empresaId": "507f1f77bcf86cd799439011",
    "nome_empresa": "Tech Solutions LTDA",
    "email": "contato@techsolutions.com"
  },
  "message": "Empresa cadastrada com sucesso"
}
```

---

## 📋 Endpoints - Diagnósticos

### POST /api/diagnosticos

Cria diagnóstico simplificado (sem autenticação).

**Request:**
```json
{
  "perfil": {
    "empresa": "Tech Solutions LTDA",
    "email": "contato@techsolutions.com",
    "cnpj": "12345678000190",
    "setor": "Tecnologia",
    "porte": "Média"
  },
  "dimensoesSelecionadas": [
    "Pessoas & Cultura",
    "Mercado & Clientes"
  ],
  "respostas": {
    "p1-1": "p1-2",
    "p1-2": "p1-3",
    "p1-3": "p1-1",
    "p1-4": "p1-4",
    "p1-5": "p1-2",
    "p1-6": "p1-3",
    "p6-1": "p6-1",
    "p6-2": "p6-2",
    "p6-3": "p6-3",
    "p6-4": "p6-4",
    "p6-5": "p6-1",
    "p6-6": "p6-2"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "diagnosticoId": "507f1f77bcf86cd799439012",
    "resultados": {
      "Pessoas & Cultura": {
        "pontuacao": 2.5,
        "estagio": "Em Desenvolvimento",
        "trilhasDeMelhoria": [
          {
            "meta": "Melhorar engajamento da equipe",
            "trilha": "Cultura Organizacional de Alta Performance",
            "explicacao": "Desenvolva práticas de gestão de pessoas..."
          }
        ]
      },
      "Mercado & Clientes": {
        "pontuacao": 3.2,
        "estagio": "Consolidado",
        "trilhasDeMelhoria": [
          {
            "meta": "Otimizar relacionamento com clientes",
            "trilha": "Customer Success e Fidelização",
            "explicacao": "Aprenda técnicas avançadas..."
          }
        ]
      }
    },
    "mediaGeral": 2.85,
    "leadScore": "morno"
  }
}
```

### GET /api/diagnosticos/:id

Obtém diagnóstico específico.

**Autenticação**: Requerida (Empresa ou Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "empresa": {
      "_id": "507f1f77bcf86cd799439011",
      "nome_empresa": "Tech Solutions LTDA"
    },
    "perfil": { /* ... */ },
    "dimensoesSelecionadas": [ /* ... */ ],
    "resultados": { /* ... */ },
    "status": "concluido",
    "createdAt": "2025-11-15T10:30:00Z"
  }
}
```

### POST /api/diagnostico-ia

Inicia diagnóstico aprofundado com IA.

**Autenticação**: Requerida (Empresa)

**Request:**
```json
{
  "empresaId": "507f1f77bcf86cd799439011",
  "dimensoes": [
    "Pessoas & Cultura",
    "Mercado & Clientes",
    "Estrutura & Operações",
    "Direção & Futuro"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "ai_session_123456",
    "primeiraPergunta": "Me conte um pouco sobre a cultura da sua empresa...",
    "status": "em_andamento"
  }
}
```

### POST /api/diagnostico-ia/responder

Envia resposta para a IA.

**Request:**
```json
{
  "sessionId": "ai_session_123456",
  "resposta": "Temos uma cultura informal, mas valores bem definidos..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "proximaPergunta": "Quais são esses valores documentados?",
    "progresso": 15,
    "dimensaoAtual": "Pessoas & Cultura"
  }
}
```

---

## 👥 Endpoints - Funcionários

### GET /api/funcionarios

Lista funcionários da empresa.

**Autenticação**: Requerida (Empresa)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "nome": "João Silva",
      "email": "joao.silva@techsolutions.com",
      "cargo": "Analista de Sistemas",
      "departamento": "TI",
      "trilhasAtribuidas": ["507f1f77bcf86cd799439020"],
      "dataAdmissao": "2023-01-15T00:00:00Z",
      "status": "ativo"
    }
  ]
}
```

### POST /api/funcionarios

Cadastra novo funcionário.

**Autenticação**: Requerida (Empresa)

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao.silva@techsolutions.com",
  "cargo": "Analista de Sistemas",
  "departamento": "TI",
  "senha": "SenhaInicial123!",
  "dataAdmissao": "2023-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "funcionarioId": "507f1f77bcf86cd799439013",
    "nome": "João Silva",
    "credenciais": {
      "email": "joao.silva@techsolutions.com",
      "senhaTemporaria": "SenhaInicial123!"
    }
  },
  "message": "Funcionário cadastrado. Email de boas-vindas enviado."
}
```

### PUT /api/funcionarios/:id

Atualiza dados do funcionário.

**Autenticação**: Requerida (Empresa)

**Request:**
```json
{
  "cargo": "Coordenador de TI",
  "departamento": "TI"
}
```

### DELETE /api/funcionarios/:id

Remove funcionário.

**Autenticação**: Requerida (Empresa)

---

## 🛤️ Endpoints - Trilhas

### GET /api/trilhas

Lista todas as trilhas disponíveis.

**Autenticação**: Opcional (retorna mais detalhes se autenticado)

**Query Params:**
- `categoria` - Filtrar por categoria
- `nivel` - Filtrar por nível (Iniciante/Intermediário/Avançado)
- `search` - Busca textual

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "nome": "Liderança Transformadora",
      "descricao": "Desenvolva habilidades de liderança...",
      "categoria": "Liderança",
      "nivel": "Intermediário",
      "duracaoEstimada": 20,
      "tags": ["liderança", "gestão", "comunicação"],
      "modulos": [
        {
          "titulo": "Fundamentos da Liderança",
          "tipo": "video",
          "duracao": 45,
          "ordem": 1
        }
      ],
      "status": "ativa"
    }
  ]
}
```

### POST /api/trilhas

Cria nova trilha.

**Autenticação**: Requerida (Admin)

**Request:**
```json
{
  "nome": "Liderança Transformadora",
  "descricao": "Desenvolva habilidades de liderança...",
  "tags": ["liderança", "gestão", "comunicação"],
  "areasAbordadas": ["Liderança", "Gestão de Pessoas"],
  "objetivos": [
    "Desenvolver habilidades de comunicação",
    "Aprender técnicas de gestão de conflitos"
  ],
  "duracaoEstimada": 20,
  "nivel": "Intermediário",
  "categoria": "Liderança",
  "status": "ativa",
  "modulos": [
    {
      "titulo": "Fundamentos da Liderança",
      "descricao": "Conceitos essenciais...",
      "tipo": "video",
      "duracao": 45,
      "url": "https://youtube.com/...",
      "ordem": 1
    }
  ],
  "metadados": {
    "problemasRelacionados": ["baixa-produtividade", "falta-de-liderança"],
    "competenciasDesenvolvidas": ["Liderança", "Comunicação"],
    "resultadosEsperados": ["Melhoria no engajamento da equipe"]
  }
}
```

### PUT /api/trilhas/:id

Atualiza trilha existente.

**Autenticação**: Requerida (Admin)

### POST /api/funcionarios/:id/trilhas

Atribui trilha a funcionário.

**Autenticação**: Requerida (Empresa)

**Request:**
```json
{
  "trilhaId": "507f1f77bcf86cd799439020",
  "dataInicio": "2025-11-20",
  "prazoEstimado": "2025-12-20",
  "prioridade": "alta"
}
```

### GET /api/funcionarios/:id/trilhas/progresso

Obtém progresso das trilhas do funcionário.

**Autenticação**: Requerida (Empresa ou Funcionário)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "trilha": {
        "_id": "507f1f77bcf86cd799439020",
        "nome": "Liderança Transformadora"
      },
      "dataInicio": "2025-11-15T00:00:00Z",
      "progresso": 45,
      "modulosConcluidos": [1, 2],
      "modulosTotal": 5,
      "status": "em_andamento"
    }
  ]
}
```

---

## 🔑 Endpoints - Autenticação

### POST /api/login

Login de empresa.

**Request:**
```json
{
  "email": "contato@techsolutions.com",
  "senha": "SenhaSegura123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "empresa": {
      "_id": "507f1f77bcf86cd799439011",
      "nome_empresa": "Tech Solutions LTDA",
      "email": "contato@techsolutions.com",
      "planoAtivo": "avancado"
    },
    "tipo": "EMPRESA"
  },
  "message": "Login realizado com sucesso"
}
```

### POST /api/login-funcionario

Login de funcionário.

**Request:**
```json
{
  "cnpj": "12345678000190",
  "email": "joao.silva@techsolutions.com",
  "senha": "SenhaInicial123!"
}
```

### POST /api/logout

Logout (invalida sessão).

**Autenticação**: Requerida

**Response:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

## 🔧 Endpoints - Admin

### GET /api/admin/empresas

Lista todas empresas (admin).

**Autenticação**: Requerida (Admin)

### PUT /api/admin/empresas/:id

Atualiza empresa (admin).

### DELETE /api/admin/empresas/:id

Remove empresa e todos dados associados.

### GET /api/admin/diagnosticos

Lista todos diagnósticos.

### POST /api/admin/diagnosticos/bulk-delete

Exclusão em lote de diagnósticos.

**Request:**
```json
{
  "ids": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

### GET /api/metrics

Métricas do sistema.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEmpresas": 150,
    "totalDiagnosticos": 320,
    "diagnosticosHoje": 12,
    "leadsQuentes": 25,
    "leadsMornos": 45,
    "leadsFrios": 30,
    "trilhasMaisRecomendadas": [
      {
        "nome": "Liderança Transformadora",
        "quantidade": 45
      }
    ]
  }
}
```

### POST /api/seed

Popula banco com dados de teste (5 empresas completas).

**Autenticação**: Requerida (Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "empresasCriadas": 5,
    "funcionariosCriados": 18,
    "trilhasAtribuidas": 42,
    "credenciais": [
      {
        "empresa": "Tech Solutions LTDA",
        "email": "empresa1@test.com",
        "senha": "senha123",
        "cnpj": "12345678000190"
      }
    ]
  }
}
```

---

## 🔔 Webhooks

### Stripe - Confirmação de Pagamento

**URL**: `/api/webhooks/stripe`

**Método**: POST

**Headers:**
```http
Stripe-Signature: <signature>
```

**Payload:**
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "customer_email": "contato@techsolutions.com",
      "metadata": {
        "cnpj": "12345678000190",
        "plano": "avancado"
      }
    }
  }
}
```

---

## 📊 Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito (ex: email já cadastrado) |
| 422 | Erro de validação |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |

---

## ⏱️ Rate Limiting

### Limites por Plano

| Plano | Requests/Minuto |
|-------|-----------------|
| Público (sem auth) | 30 |
| Essencial | 60 |
| Avançado | 120 |
| Escalado | Ilimitado |

### Headers de Resposta

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1632150000
```

---

## 💻 Exemplos de Uso

### JavaScript/TypeScript (Next.js)

```typescript
// Criar diagnóstico simplificado
const criarDiagnostico = async (dados: any) => {
  const response = await fetch('/api/diagnosticos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dados),
  });
  
  const result = await response.json();
  return result;
};

// Login de empresa
const login = async (email: string, senha: string) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Importante para cookies
    body: JSON.stringify({ email, senha }),
  });
  
  return await response.json();
};

// Listar trilhas (autenticado)
const listarTrilhas = async () => {
  const response = await fetch('/api/trilhas', {
    credentials: 'include',
  });
  
  return await response.json();
};
```

### cURL

```bash
# Criar diagnóstico
curl -X POST http://localhost:3000/api/diagnosticos \
  -H "Content-Type: application/json" \
  -d '{
    "perfil": {
      "empresa": "Tech Solutions",
      "email": "contato@tech.com",
      "cnpj": "12345678000190",
      "setor": "Tecnologia",
      "porte": "Média"
    },
    "dimensoesSelecionadas": ["Pessoas & Cultura"],
    "respostas": { "p1-1": "p1-2" }
  }'

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "contato@tech.com",
    "senha": "senha123"
  }'

# Requisição autenticada
curl http://localhost:3000/api/funcionarios \
  -b cookies.txt
```

### Python

```python
import requests

# Criar diagnóstico
url = "http://localhost:3000/api/diagnosticos"
payload = {
    "perfil": {
        "empresa": "Tech Solutions",
        "email": "contato@tech.com",
        "cnpj": "12345678000190",
        "setor": "Tecnologia",
        "porte": "Média"
    },
    "dimensoesSelecionadas": ["Pessoas & Cultura"],
    "respostas": {"p1-1": "p1-2"}
}

response = requests.post(url, json=payload)
print(response.json())

# Login e requisição autenticada
session = requests.Session()
login_response = session.post(
    "http://localhost:3000/api/login",
    json={"email": "contato@tech.com", "senha": "senha123"}
)

# Usar mesma sessão para requisições autenticadas
trilhas = session.get("http://localhost:3000/api/trilhas")
print(trilhas.json())
```

---

## 🔒 Segurança

### Boas Práticas

1. **Sempre use HTTPS em produção**
2. **Nunca exponha chaves de API no frontend**
3. **Valide todos os inputs**
4. **Use rate limiting**
5. **Implemente CORS adequadamente**

### Variáveis de Ambiente Sensíveis

```env
# NUNCA commite essas variáveis
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
```

---

## 📞 Suporte

Para questões sobre a API:

- 📧 Email: api@radarentrenova.com.br
- 📚 Documentação: https://docs.radarentrenova.com.br
- 🐛 Reportar bugs: GitHub Issues

---

**Desenvolvido pela Equipe Echo - FATEC SJC 2025-2**

Versão da API: 1.0.0
