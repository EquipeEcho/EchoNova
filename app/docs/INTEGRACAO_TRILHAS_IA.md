# Integração de Trilhas no Diagnóstico Aprofundado

## Visão Geral

Este documento descreve como as trilhas de aprendizagem são integradas ao sistema de diagnóstico aprofundado, permitindo que a IA recomende automaticamente trilhas baseadas nos problemas identificados.

## Estrutura de Dados

### Schema da Trilha

```typescript
interface Trilha {
  _id: string;
  nome: string;
  descricao: string;
  tags: string[];  // Tags semânticas para matching
  areasAbordadas: string[];
  objetivos: string[];
  duracaoEstimada: number;
  nivel: "Iniciante" | "Intermediário" | "Avançado";
  modulos: Modulo[];
  status: "ativa" | "inativa" | "rascunho";
  metadados: {
    problemasRelacionados: string[];  // Keywords de problemas que resolve
    competenciasDesenvolvidas: string[];
    resultadosEsperados: string[];
  };
}
```

## Integração com a IA

### 1. Buscar Trilhas Disponíveis

Antes de iniciar o diagnóstico, o sistema deve buscar todas as trilhas ativas:

```typescript
// No arquivo: src/app/diagnostico-aprofundado/page.tsx

const [trilhasDisponiveis, setTrilhasDisponiveis] = useState([]);

useEffect(() => {
  async function loadTrilhas() {
    const res = await fetch('/api/trilhas?status=ativa');
    const data = await res.json();
    setTrilhasDisponiveis(data.trilhas);
  }
  loadTrilhas();
}, []);
```

### 2. Incluir Trilhas no Prompt da IA

Quando enviar mensagens para a IA, inclua as trilhas disponíveis no contexto:

```typescript
// Exemplo de implementação no handler de mensagens

const systemPrompt = `
Você é um consultor especializado em diagnóstico organizacional.

TRILHAS DE APRENDIZAGEM DISPONÍVEIS:
${trilhasDisponiveis.map(trilha => `
- ID: ${trilha._id}
- Nome: ${trilha.nome}
- Descrição: ${trilha.descricao}
- Tags: ${trilha.tags.join(', ')}
- Problemas que resolve: ${trilha.metadados.problemasRelacionados.join(', ')}
- Competências desenvolvidas: ${trilha.metadados.competenciasDesenvolvidas.join(', ')}
- Nível: ${trilha.nivel}
`).join('\n')}

IMPORTANTE: 
- Ao identificar problemas ou áreas de melhoria, relacione-os com as trilhas disponíveis
- Use as tags e problemasRelacionados para fazer matching semântico
- No relatório final, recomende as trilhas mais adequadas incluindo seus IDs
- Priorize trilhas que abordem múltiplos problemas identificados
`;
```

### 3. Estrutura de Dados Coletados

Atualize o schema de `structuredData` para incluir trilhas recomendadas:

```typescript
interface StructuredData {
  // ... campos existentes ...
  
  // NOVO: Trilhas recomendadas
  trilhasRecomendadas: {
    trilhaId: string;          // ID da trilha no banco
    nomeTrilha: string;        // Nome da trilha
    prioridade: "alta" | "média" | "baixa";
    motivo: string;            // Por que foi recomendada
    problemasQueResolve: string[];  // Problemas específicos que aborda
    areasRelacionadas: string[];    // Áreas do diagnóstico relacionadas
  }[];
  
  // Mapeamento de problemas x trilhas
  mapeamentoProblemasTrilhas: {
    problema: string;
    area: string;
    trilhasSugeridas: string[];  // IDs das trilhas
  }[];
}
```

### 4. Prompt para Geração do Relatório Final

Quando solicitar o relatório final, instrua a IA:

```typescript
const finalPrompt = `
Com base em toda a conversa, gere um relatório completo seguindo esta estrutura JSON:

{
  "structuredData": {
    // ... outros campos ...
    
    "trilhasRecomendadas": [
      {
        "trilhaId": "ID_DA_TRILHA",
        "nomeTrilha": "Nome da Trilha",
        "prioridade": "alta|média|baixa",
        "motivo": "Explicação de por que esta trilha foi recomendada",
        "problemasQueResolve": ["problema1", "problema2"],
        "areasRelacionadas": ["Liderança", "Comunicação"]
      }
    ],
    
    "mapeamentoProblemasTrilhas": [
      {
        "problema": "Descrição do problema identificado",
        "area": "Área organizacional",
        "trilhasSugeridas": ["ID_TRILHA_1", "ID_TRILHA_2"]
      }
    ]
  },
  
  "finalReport": "Relatório em markdown incluindo seção de TRILHAS RECOMENDADAS"
}

DIRETRIZES PARA RECOMENDAÇÃO:
1. Analise semanticamente os problemas identificados
2. Compare com as tags e problemasRelacionados das trilhas
3. Priorize trilhas que resolvam múltiplos problemas
4. Considere o nível de complexidade dos problemas vs nível da trilha
5. Limite a 3-5 trilhas principais (alta prioridade)
6. Adicione 2-3 trilhas complementares (média/baixa prioridade)
7. No relatório markdown, crie uma seção explicando cada trilha recomendada
`;
```

### 5. Processar Resultados

Após receber a resposta da IA:

```typescript
async function processarDiagnostico(resultado) {
  const { structuredData, finalReport } = resultado;
  
  // Salvar no banco
  const diagnostico = await fetch('/api/diagnostico-aprofundado', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      conversationHistory,
      structuredData,
      finalReport,
    })
  });
  
  // Exibir trilhas recomendadas na página de resultados
  router.push(`/diagnostico-aprofundado/resultados/${diagnostico._id}`);
}
```

## Exemplo de Matching Semântico

### Cenário: Problema Identificado

```
Problema: "Baixa produtividade e desmotivação da equipe"
Área: Gestão de Pessoas
```

### Trilhas que Fazem Match

```javascript
// Trilha 1: "Liderança Transformadora"
tags: ["liderança", "gestão", "comunicação", "tomada-de-decisão"]
problemasRelacionados: ["baixa-produtividade", "baixo-engajamento", "falta-de-liderança"]
Match: ALTO (2 tags relacionadas diretamente)

// Trilha 2: "Cultura Organizacional e Engajamento"
tags: ["cultura-organizacional", "engajamento", "valores"]
problemasRelacionados: ["baixo-engajamento", "alta-rotatividade", "clima-ruim"]
Match: MÉDIO (1 tag relacionada)

// Trilha 3: "Gestão de Performance e Resultados"
tags: ["gestão-performance", "kpis", "metas", "produtividade"]
problemasRelacionados: ["baixa-produtividade", "resultados-insatisfatórios"]
Match: ALTO (1 tag exata)
```

### Recomendação da IA

```json
{
  "trilhasRecomendadas": [
    {
      "trilhaId": "trilha_1_id",
      "nomeTrilha": "Liderança Transformadora",
      "prioridade": "alta",
      "motivo": "Aborda diretamente os problemas de baixa produtividade e engajamento através do desenvolvimento de competências de liderança",
      "problemasQueResolve": ["baixa-produtividade", "baixo-engajamento"],
      "areasRelacionadas": ["Gestão de Pessoas", "Liderança"]
    },
    {
      "trilhaId": "trilha_3_id",
      "nomeTrilha": "Gestão de Performance e Resultados",
      "prioridade": "alta",
      "motivo": "Foca especificamente na melhoria da produtividade através de metas e indicadores claros",
      "problemasQueResolve": ["baixa-produtividade"],
      "areasRelacionadas": ["Gestão de Performance"]
    },
    {
      "trilhaId": "trilha_2_id",
      "nomeTrilha": "Cultura Organizacional e Engajamento",
      "prioridade": "média",
      "motivo": "Complementa as outras trilhas trabalhando aspectos culturais e de pertencimento",
      "problemasQueResolve": ["baixo-engajamento", "desmotivação"],
      "areasRelacionadas": ["Cultura Organizacional"]
    }
  ]
}
```

## Exibição na Página de Resultados

Na página de resultados do diagnóstico:

```typescript
// src/app/diagnostico-aprofundado/resultados/[id]/page.tsx

// 1. Buscar dados do diagnóstico (já existente)
const diagnostico = await fetch(`/api/diagnostico-aprofundado/${id}`);

// 2. Buscar detalhes completos das trilhas recomendadas
const trilhasRecomendadas = await Promise.all(
  diagnostico.structuredData.trilhasRecomendadas.map(async (rec) => {
    const res = await fetch(`/api/trilhas/${rec.trilhaId}`);
    return { ...rec, detalhes: await res.json() };
  })
);

// 3. Renderizar seção de trilhas
<section className="trilhas-recomendadas">
  <h2>Trilhas de Aprendizagem Recomendadas</h2>
  {trilhasRecomendadas.map(trilha => (
    <TrilhaCard 
      key={trilha.trilhaId}
      trilha={trilha.detalhes}
      prioridade={trilha.prioridade}
      motivo={trilha.motivo}
      onAssociarFuncionarios={() => handleAssociar(trilha.trilhaId)}
    />
  ))}
</section>
```

## Associação de Funcionários às Trilhas

Após o diagnóstico, gestores podem associar funcionários:

```typescript
// API: /api/funcionarios/[id]/trilhas
POST {
  trilhaId: string;
  dataInicio: Date;
  prazo: Date;
  observacoes: string;
}

// Frontend: Botão "Associar Funcionários" em cada trilha
function handleAssociarFuncionarios(trilhaId) {
  router.push(`/gerenciar-funcionarios?trilha=${trilhaId}`);
}
```

## Checklist de Implementação

- [x] Model de Trilha criado
- [x] APIs de CRUD de trilhas criadas
- [x] Interface admin de gerenciamento
- [x] Trilhas mock populadas
- [ ] Modificar prompt do diagnóstico para incluir trilhas
- [ ] Atualizar schema de structuredData
- [ ] Implementar exibição de trilhas nos resultados
- [ ] Criar sistema de associação funcionário-trilha
- [ ] Atualizar Model DiagnosticoAprofundado se necessário

## Próximos Passos

1. **Modificar o arquivo do diagnóstico aprofundado** para incluir a lógica de trilhas
2. **Atualizar a página de resultados** para exibir trilhas recomendadas
3. **Criar sistema de atribuição** de trilhas aos funcionários
4. **Implementar tracking** de progresso nas trilhas
5. **Dashboard de acompanhamento** para gestores

## Exemplo de Modificação no Diagnóstico

Arquivo a modificar: `src/app/diagnostico-aprofundado/page.tsx`

Adicionar após a linha ~80:

```typescript
const [trilhasDisponiveis, setTrilhasDisponiveis] = useState([]);

useEffect(() => {
  async function carregarTrilhas() {
    try {
      const res = await fetch('/api/trilhas?status=ativa');
      const data = await res.json();
      if (res.ok) {
        setTrilhasDisponiveis(data.trilhas);
      }
    } catch (error) {
      console.error('Erro ao carregar trilhas:', error);
    }
  }
  carregarTrilhas();
}, []);
```

E modificar o systemPrompt para incluir as trilhas (linha ~200+).
