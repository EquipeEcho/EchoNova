# Atualização: Barra de Progresso do Diagnóstico Aprofundado

## 📋 Resumo das Alterações

A barra de progresso do diagnóstico aprofundado foi restaurada e aprimorada com informações mais detalhadas sobre o andamento do processo.

## ✅ Mudanças Implementadas

### 1. **Prompt da IA (prompts.ts)**
- ✅ Adicionados campos `currentQuestion` e `totalQuestions` ao objeto `progress`
- ✅ Adicionado campo `stepTitle` para descrever a etapa atual
- ✅ Instruções detalhadas sobre como calcular o progresso em cada etapa
- ✅ Exemplos práticos de como preencher os campos de progresso

**O que a IA agora DEVE retornar:**
```json
{
  "progress": {
    "currentStep": 0,      // Pergunta atual no fluxo TOTAL (0-indexed)
    "totalSteps": 21,      // Total de perguntas em TODO o diagnóstico
    "stepTitle": "Identificação de Desafios",  // Descrição da etapa
    "currentQuestion": 1,  // Qual pergunta DESTA etapa (1-indexed)
    "totalQuestions": 2    // Quantas perguntas TEM nesta etapa
  }
}
```

### 2. **API (route.ts)**
- ✅ Adicionada validação do campo `progress` nas respostas da IA
- ✅ Logs detalhados para monitorar o progresso:
  - `📊 MCP: Progresso - Pergunta X/Y - "Título" - Pergunta N/M desta etapa`
  - `⚠️ MCP: IA não retornou 'progress' na resposta` (se falhar)

### 3. **Frontend (page.tsx)**
- ✅ Interface `ProgressState` expandida com novos campos opcionais
- ✅ Logs detalhados no console do navegador para debug
- ✅ Sempre exibe a barra quando `progress.totalSteps > 0` (removida verificação desnecessária)

### 4. **Componente ProgressBar (ProgressBar.tsx)**
- ✅ Novos parâmetros opcionais: `stepTitle`, `currentQuestion`, `totalQuestions`
- ✅ Exibe o título da etapa quando disponível (ex: "Problema: Comunicação Ineficiente")
- ✅ Mostra progresso detalhado: "Pergunta 3 de 21 (1/6 desta etapa) | 14%"
- ✅ Melhor feedback visual e informativo para o usuário

## 🎯 Como Funciona Agora

### Cálculo do Progresso Total

A IA calcula o total de perguntas dinamicamente:

1. **Etapa 2** (Identificação): 2 perguntas
   - Pergunta inicial sobre desafios
   - Pergunta de priorização

2. **Etapa 3** (Aprofundamento): N × 6 perguntas
   - Onde N = número de problemas priorizados
   - 6 perguntas por problema (impacto, frequência, alcance, 2 evidências, causa raiz)

3. **Etapa 4** (Confirmação): 1 pergunta
   - Confirmação para gerar relatório

**Exemplo:** Se o usuário prioriza 3 problemas:
- Total = 2 + (3 × 6) + 1 = **21 perguntas**

### Informações Exibidas

#### Durante o Diagnóstico:
```
┌─────────────────────────────────────────────────┐
│  Problema: Comunicação Ineficiente              │ ← stepTitle
│                                                 │
│  Pergunta 5 de 21 (3/6 desta etapa)    24%     │ ← progresso
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │ ← barra visual
└─────────────────────────────────────────────────┘
```

## 🔍 Como Testar

### 1. Monitorar Logs (Console do Navegador)
```
📊 Dados de progresso recebidos: { currentStep: 0, totalSteps: 21, ... }
✅ Barra de progresso atualizada: 1/21 - Identificação de Desafios
```

### 2. Monitorar Logs (Terminal do Servidor)
```
📊 MCP: Progresso - Pergunta 1/21 - "Identificação de Desafios" - Pergunta 1/2 desta etapa
📊 MCP: Progresso - Pergunta 3/21 - "Problema: Comunicação Ineficiente" - Pergunta 1/6 desta etapa
```

### 3. Verificar Visualmente
- A barra de progresso deve aparecer **imediatamente** na primeira pergunta
- O título da etapa deve mudar conforme o progresso
- A porcentagem deve aumentar gradualmente
- As informações detalhadas devem ser precisas

## ⚠️ Possíveis Problemas e Soluções

### Problema 1: Barra não aparece
**Causa:** A IA não está retornando o campo `progress`
**Solução:** Verifique os logs do servidor e do navegador
- Se aparecer `⚠️ MCP: IA não retornou 'progress'`, a IA não está seguindo o prompt
- Considere reiniciar o servidor ou testar com um provider diferente

### Problema 2: Porcentagem incorreta
**Causa:** A IA calculou `totalSteps` errado
**Solução:** Verifique os logs para ver como a IA está calculando
- O cálculo deve ser: 2 + (N × 6) + 1, onde N = problemas priorizados
- Se estiver errado, o prompt pode precisar de ajuste

### Problema 3: Título não aparece
**Causa:** A IA não está preenchendo `stepTitle`
**Solução:** Verifique se o campo existe no objeto `progress`
- É opcional, mas deveria ser preenchido pela IA
- Não afeta o funcionamento da barra, apenas a informação visual

## 📊 Estrutura de Dados Completa

### Resposta da API ao Frontend:
```typescript
{
  sessionId: string,
  status: "em_andamento" | "finalizado",
  proxima_pergunta: {
    texto: string,
    tipo_resposta: "texto" | "numero" | "selecao" | "sim_nao",
    opcoes: string[] | null,
    placeholder: string
  },
  progress: {
    currentStep: number,       // 0-indexed
    totalSteps: number,        // Total de perguntas
    stepTitle: string,         // Ex: "Identificação de Desafios"
    currentQuestion: number,   // 1-indexed
    totalQuestions: number     // Perguntas desta etapa
  },
  dados_coletados: {...}
}
```

## 🎨 Customização Visual

O componente ProgressBar usa as cores da marca EchoNova:
- Barra de fundo: `bg-slate-700`
- Barra de progresso: `bg-linear-to-r from-pink-500 to-pink-600`
- Texto do título: `text-pink-400`
- Texto dos detalhes: `text-neutral-300` e `text-slate-400`

Para alterar, edite `src/components/ui/ProgressBar.tsx`.

## 📝 Próximos Passos

- [ ] Testar com diagnóstico real
- [ ] Verificar se a IA está retornando o progresso corretamente
- [ ] Ajustar o prompt se necessário
- [ ] Considerar adicionar animações suaves
- [ ] Adicionar sons ou feedback háptico (opcional)

---

**Data da Atualização:** 23 de novembro de 2025
**Status:** ✅ Implementado e pronto para teste
