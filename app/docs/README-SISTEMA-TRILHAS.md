# Sistema de Trilhas de Aprendizagem - EchoNova

## Visão Geral

Sistema completo de gerenciamento de trilhas de aprendizagem integrado ao diagnóstico aprofundado, permitindo que a IA recomende trilhas baseadas em análise semântica dos problemas identificados.

## Estrutura Criada

### 1. Model de Dados (`/src/models/Trilha.ts`)

Schema Mongoose completo com:
- Informações básicas (nome, descrição, duração, nível)
- Tags semânticas para matching com IA
- Módulos de conteúdo (vídeo, podcast, texto, avaliação, atividade prática)
- Metadados para recomendação inteligente
- Estatísticas de uso

### 2. APIs REST (`/src/app/api/trilhas/`)

#### GET `/api/trilhas`
Listar trilhas com filtros opcionais:
- `?tags=tag1,tag2` - Filtrar por tags
- `?areas=area1,area2` - Filtrar por áreas
- `?status=ativa` - Filtrar por status
- `?nivel=Intermediário` - Filtrar por nível

#### POST `/api/trilhas`
Criar nova trilha

#### GET `/api/trilhas/[id]`
Buscar trilha específica

#### PUT `/api/trilhas/[id]`
Atualizar trilha

#### DELETE `/api/trilhas/[id]`
Deletar trilha

#### GET `/api/trilhas/tags`
Listar todas as tags disponíveis

#### POST `/api/trilhas/seed`
Popular banco com trilhas de exemplo (mock)

### 3. Interface Admin (`/src/app/admin/trilhas/`)

#### Listagem (`/admin/trilhas`)
- Visualização em cards
- Filtros por nome, status e nível
- Busca por tags e descrição
- Preview detalhado de cada trilha
- Estatísticas de uso

#### Cadastro/Edição (`/admin/trilhas/nova` e `/admin/trilhas/[id]`)
- Formulário completo de trilha
- Gerenciamento de módulos
- Tags semânticas
- Metadados para IA
- Validações

### 4. Trilhas Mock

6 trilhas de exemplo prontas para uso:
1. **Liderança Transformadora** - Desenvolvimento de competências de liderança
2. **Cultura Organizacional e Engajamento** - Construção de cultura forte
3. **Inovação e Criatividade Corporativa** - Estimular pensamento inovador
4. **Comunicação Corporativa Efetiva** - Melhorar comunicação interna/externa
5. **Gestão de Performance e Resultados** - Orientação a metas e resultados
6. **Diversidade e Inclusão** - Ambiente inclusivo e diverso

## Como Funciona

### 1. Cadastro de Trilhas

Administradores acessam `/admin/trilhas` e podem:
- Criar novas trilhas manualmente
- Popular trilhas mock com um clique
- Editar trilhas existentes
- Ativar/desativar trilhas

### 2. Tags Semânticas

Cada trilha possui:
- **Tags gerais**: palavras-chave amplas (ex: "liderança", "comunicação")
- **Problemas relacionados**: keywords específicas de problemas que resolve (ex: "baixa-produtividade", "conflitos-internos")
- **Competências desenvolvidas**: habilidades trabalhadas
- **Resultados esperados**: outcomes previstos

### 3. Integração com IA

A IA do diagnóstico:
1. Recebe lista de trilhas disponíveis no contexto
2. Analisa problemas identificados durante o diagnóstico
3. Faz matching semântico entre problemas e trilhas
4. Recomenda 3-5 trilhas prioritárias
5. Retorna IDs e justificativas no structuredData

### 4. Recomendações

A IA considera:
- Matching de tags e problemas
- Nível da trilha vs complexidade do problema
- Múltiplos problemas abordados pela mesma trilha
- Sinergia entre trilhas recomendadas

### 5. Associação com Funcionários

Após receber recomendações, gestores podem:
- Visualizar trilhas recomendadas
- Associar funcionários específicos a cada trilha
- Definir prazos e objetivos
- Acompanhar progresso

## Tipos de Conteúdo dos Módulos

Cada módulo pode ser:

### 📹 Vídeo
- Aulas gravadas
- Webinars
- Tutoriais
- URL do vídeo

### 🎙️ Podcast
- Episódios de áudio
- Entrevistas
- Discussões
- URL do podcast

### 📄 Texto
- Artigos
- eBooks
- Guias
- Markdown/HTML

### ✅ Avaliação
- Quizzes
- Testes
- Provas
- Certificação

### 🛠️ Atividade Prática
- Exercícios
- Projetos
- Simulações
- Estudos de caso

## Fluxo Completo

```
1. Admin cadastra trilhas
   ↓
2. Admin ativa trilhas
   ↓
3. Empresa inicia diagnóstico aprofundado
   ↓
4. IA analisa problemas identificados
   ↓
5. IA recomenda trilhas baseado em matching semântico
   ↓
6. Gestor visualiza trilhas recomendadas nos resultados
   ↓
7. Gestor associa funcionários às trilhas
   ↓
8. Funcionários acessam conteúdo das trilhas
   ↓
9. Sistema tracka progresso e conclusões
   ↓
10. Dashboard mostra estatísticas e resultados
```

## Estrutura JSON da Trilha

```json
{
  "nome": "Nome da Trilha",
  "descricao": "Descrição detalhada",
  "tags": ["tag1", "tag2"],
  "areasAbordadas": ["Área 1", "Área 2"],
  "objetivos": ["Objetivo 1", "Objetivo 2"],
  "duracaoEstimada": 20,
  "nivel": "Intermediário",
  "modulos": [
    {
      "titulo": "Módulo 1",
      "descricao": "Descrição",
      "tipo": "video",
      "duracao": 45,
      "url": "https://...",
      "ordem": 1
    }
  ],
  "status": "ativa",
  "metadados": {
    "problemasRelacionados": ["problema1", "problema2"],
    "competenciasDesenvolvidas": ["comp1", "comp2"],
    "resultadosEsperados": ["resultado1", "resultado2"]
  }
}
```

## Próximos Passos

### Fase 1: Integração com Diagnóstico ✅ (Atual)
- [x] Model criado
- [x] APIs implementadas
- [x] Interface admin
- [x] Trilhas mock
- [ ] Integrar no prompt da IA
- [ ] Atualizar schema de DiagnosticoAprofundado

### Fase 2: Exibição de Resultados
- [ ] Página de resultados mostrando trilhas recomendadas
- [ ] Cards de trilhas com detalhes
- [ ] Priorização visual
- [ ] Justificativas da IA

### Fase 3: Associação de Funcionários
- [ ] Sistema de atribuição de trilhas
- [ ] Interface de seleção de funcionários
- [ ] Definição de prazos e objetivos
- [ ] Notificações

### Fase 4: Tracking e Progresso
- [ ] Model de progresso por funcionário
- [ ] Marcação de módulos completados
- [ ] Avaliações e notas
- [ ] Certificados

### Fase 5: Dashboard e Analytics
- [ ] Dashboard de RH com estatísticas
- [ ] Gráficos de progresso
- [ ] Taxa de conclusão
- [ ] ROI das trilhas

## Acesso às Funcionalidades

### Admin
- **Listar trilhas**: `/admin/trilhas`
- **Nova trilha**: `/admin/trilhas/nova`
- **Editar trilha**: `/admin/trilhas/[id]`
- **Popular mocks**: Botão na página de listagem

### Gestores
- **Resultados do diagnóstico**: `/diagnostico-aprofundado/resultados/[id]`
- **Associar funcionários**: `/gerenciar-funcionarios?trilha=[id]`

### Funcionários
- **Minhas trilhas**: `/dashboard-cliente/trilhas` (a implementar)
- **Acessar conteúdo**: `/trilhas/[id]/modulo/[moduloId]` (a implementar)

## Exemplo de Uso

### 1. Popular Trilhas Mock
```bash
# Acessar /admin/trilhas
# Clicar em "Popular Trilhas Mock"
# 6 trilhas serão criadas automaticamente
```

### 2. Criar Trilha Manualmente
```bash
# Acessar /admin/trilhas/nova
# Preencher formulário
# Adicionar módulos
# Definir tags semânticas
# Salvar
```

### 3. Buscar Trilhas via API
```javascript
// Buscar trilhas ativas sobre liderança
const res = await fetch('/api/trilhas?status=ativa&tags=liderança');
const { trilhas } = await res.json();
```

### 4. Integração no Diagnóstico
```javascript
// Ver arquivo: docs/INTEGRACAO_TRILHAS_IA.md
// Exemplo completo de como integrar no prompt da IA
```

## Documentação Adicional

- **Integração com IA**: `/docs/INTEGRACAO_TRILHAS_IA.md`
- **Estrutura de Exemplo**: `/docs/estrutura-trilhas-exemplo.json`
- **Model**: `/src/models/Trilha.ts`

## Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **MongoDB + Mongoose** - Banco de dados
- **TypeScript** - Tipagem
- **Shadcn/UI** - Componentes
- **Tailwind CSS** - Estilização

## Observações Importantes

1. **Tags semânticas são cruciais** - Quanto melhores as tags, melhores as recomendações da IA
2. **Trilhas devem ser revisadas** - Mocks são apenas exemplos, adapte ao seu contexto
3. **Módulos podem evoluir** - Sistema preparado para diferentes tipos de conteúdo
4. **Integração com IA requer ajustes** - Seguir documentação de integração

## Suporte

Para dúvidas sobre a implementação, consulte:
- Documentação de integração com IA
- Exemplos JSON
- Código-fonte comentado
