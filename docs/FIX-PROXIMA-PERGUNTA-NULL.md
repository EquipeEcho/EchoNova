# Fix: Próxima Pergunta Null no Diagnóstico

## 🐛 Problema Identificado

Durante o diagnóstico aprofundado, a IA ficava "travada" após o usuário priorizar os problemas, exibindo apenas a barra de progresso (100%) sem mostrar a próxima pergunta.

### Sintomas:
```
Identificação de Desafios
Pergunta 2 de 2 (2/2 desta etapa)
100%
[Tela vazia - sem pergunta]
```

### Causa Raiz:
A IA estava retornando:
```json
{
  "status": "em_andamento",
  "proxima_pergunta": null,  // ❌ PROBLEMA!
  "progress": { ... }
}
```

Isso acontecia na transição da **Etapa 2** (Priorização) para a **Etapa 3** (Aprofundamento). A IA não estava gerando imediatamente a primeira pergunta do aprofundamento.

## ✅ Soluções Implementadas

### 1. **Prompt Melhorado** (`prompts.ts`)

#### a) Instrução Explícita na Etapa 3:
```typescript
**CRÍTICO:** IMEDIATAMENTE após o usuário priorizar os problemas na Etapa 2, 
você DEVE fazer a PRIMEIRA pergunta da Etapa 3 (Impacto do primeiro problema).
```

#### b) Validação Obrigatória:
```typescript
**INSTRUÇÕES CRÍTICAS:**
- O campo 'proxima_pergunta' é OBRIGATÓRIO em TODAS as respostas com status 'em_andamento'.
- NUNCA retorne 'proxima_pergunta': null quando o status for 'em_andamento'.
```

#### c) Exemplo Prático de Transição:
```json
USUÁRIO: "baixa motivação"
SUA RESPOSTA DEVE SER:
{
  "status": "em_andamento",
  "proxima_pergunta": {
    "texto": "Focando em baixa motivação, de 0 a 5, qual o impacto dele nos objetivos do negócio?",
    "tipo_resposta": "numero",
    "opcoes": null,
    "placeholder": "Ex: 4"
  },
  "progress": { 
    "currentStep": 2, 
    "totalSteps": 9, 
    "stepTitle": "Problema: baixa motivação", 
    "currentQuestion": 1, 
    "totalQuestions": 6 
  }
}
```

### 2. **Validação na API** (`route.ts`)

Adicionada validação crítica que interrompe o fluxo se detectar o problema:

```typescript
if (iaResponse.status === "em_andamento") {
  if (!iaResponse.proxima_pergunta) {
    console.error(`❌ ERRO CRÍTICO: IA retornou status 'em_andamento' mas proxima_pergunta é null!`);
    console.error(`❌ Dados da resposta:`, JSON.stringify(iaResponse, null, 2));
    return NextResponse.json({ 
      error: "Erro no fluxo do diagnóstico: IA não retornou a próxima pergunta.",
      details: "A IA indicou que o diagnóstico deve continuar, mas não forneceu a próxima pergunta."
    }, { status: 500 });
  }
}
```

### 3. **Tratamento no Frontend** (`page.tsx`)

#### a) Validação na Resposta:
```typescript
else if (data.proxima_pergunta) {
  setPerguntaAtual(data.proxima_pergunta);
  setFase("diagnostico");
} else {
  console.error("❌ Erro: IA retornou status 'em_andamento' sem próxima pergunta", data);
  setError("A IA não retornou a próxima pergunta. Por favor, tente novamente.");
  toast.error("Erro no fluxo do diagnóstico. Tente novamente.");
}
```

#### b) Interface de Erro com Retry:
```tsx
if (error && fase === "diagnostico") {
  return (
    <div className="bg-slate-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ Erro no Diagnóstico</h2>
      <p className="text-slate-300 mb-6">{error}</p>
      <div className="flex gap-4">
        <Button onClick={() => processarResposta(resposta)}>
          🔄 Tentar Novamente
        </Button>
        <Button onClick={handleRefazerDiagnostico}>
          Recomeçar Diagnóstico
        </Button>
      </div>
    </div>
  );
}
```

## 🔍 Como Detectar o Problema

### Logs do Servidor (Terminal):
```bash
❌ ERRO CRÍTICO: IA retornou status 'em_andamento' mas proxima_pergunta é null!
❌ Dados da resposta: { "status": "em_andamento", "proxima_pergunta": null, ... }
```

### Logs do Navegador (F12 Console):
```javascript
❌ Erro: IA retornou status 'em_andamento' sem próxima pergunta
⚠️ API não retornou informações de progresso
```

### Interface do Usuário:
- Barra de progresso mostrando 100%
- Nenhuma pergunta visível
- Toast de erro: "Erro no fluxo do diagnóstico"
- Tela com botões "Tentar Novamente" e "Recomeçar Diagnóstico"

## 🎯 Fluxo Correto Esperado

### Etapa 2 → Etapa 3 (Transição Crítica):

**Passo 1 - Usuário prioriza:**
```
USUÁRIO: "baixa motivação"
```

**Passo 2 - IA deve IMEDIATAMENTE responder:**
```json
{
  "status": "em_andamento",
  "proxima_pergunta": {
    "texto": "Focando em baixa motivação, de 0 a 5, qual o impacto...",
    "tipo_resposta": "numero",
    ...
  },
  "progress": {
    "currentStep": 2,
    "totalSteps": 9,
    "stepTitle": "Problema: baixa motivação",
    "currentQuestion": 1,
    "totalQuestions": 6
  },
  "dados_coletados": {
    "problemas_priorizados": [
      { "nome": "baixa motivação", "gravidade": "grave", ... }
    ]
  }
}
```

### Cálculo de Total Steps:
- **1 problema priorizado:** 2 (Etapa 2) + 6 (Etapa 3) + 1 (Etapa 4) = **9 perguntas**
- **2 problemas:** 2 + 12 + 1 = **15 perguntas**
- **3 problemas:** 2 + 18 + 1 = **21 perguntas**

## 📊 Monitoramento

### O que verificar após a correção:

1. **Após priorizar problemas:**
   - ✅ Próxima pergunta aparece imediatamente
   - ✅ Barra de progresso atualiza corretamente
   - ✅ `totalSteps` reflete o cálculo correto

2. **Logs devem mostrar:**
   ```
   📊 MCP: Progresso - Pergunta 3/9 - "Problema: baixa motivação" - Pergunta 1/6 desta etapa
   ```

3. **Não deve aparecer:**
   ```
   ❌ ERRO CRÍTICO: IA retornou status 'em_andamento' mas proxima_pergunta é null!
   ```

## 🔧 Se o Problema Persistir

### Opção 1: Aumentar Temperature
Se a IA estiver muito conservadora, ajuste em `OpenAIProvider.ts`:
```typescript
temperature: 0.9  // Era 0.7
```

### Opção 2: Adicionar System Message Mais Forte
No `OpenAIProvider.ts`, reforçar a instrução:
```typescript
{
  role: "system",
  content: "CRÍTICO: Quando status for 'em_andamento', proxima_pergunta NUNCA pode ser null. SEMPRE gere a próxima pergunta."
}
```

### Opção 3: Validação com Retry Automático
Na API, implementar retry se detectar o problema:
```typescript
if (!iaResponse.proxima_pergunta && iaResponse.status === "em_andamento") {
  // Tentar novamente com mensagem reforçada
  const retryResponse = await provider.sendMessage(
    "Por favor, faça a próxima pergunta do diagnóstico.",
    historico,
    promptComTrilhas
  );
  return retryResponse;
}
```

## 📝 Checklist de Teste

- [ ] Iniciar novo diagnóstico
- [ ] Responder pergunta inicial sobre desafios
- [ ] Priorizar 1 problema
- [ ] Verificar se a pergunta de Impacto aparece imediatamente
- [ ] Verificar logs do servidor
- [ ] Verificar logs do navegador
- [ ] Conferir se a barra de progresso mostra "Pergunta 3 de 9"
- [ ] Repetir com 2 e 3 problemas priorizados

## 🎨 Melhorias Futuras

1. **Fallback Inteligente:** Se a IA falhar, o sistema poderia gerar a próxima pergunta baseado no template
2. **Retry Automático:** Implementar 2-3 tentativas automáticas antes de mostrar erro
3. **Cache de Estado:** Salvar estado antes de cada pergunta para poder voltar
4. **Telemetria:** Logar métricas de quando esse erro ocorre para análise

---

**Status:** ✅ Implementado
**Data:** 23 de novembro de 2025
**Próxima Revisão:** Após 10 diagnósticos completos
