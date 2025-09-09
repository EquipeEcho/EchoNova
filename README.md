# EchoNova
# 📌 Radar Entrenova – Diagnóstico Inteligente de Treinamentos e Mercado

Sistema desenvolvido como parte do projeto **API – Aprendizagem por Projetos Integrados (FATEC – 2025-2)**, em parceria com a **Entrenova**.

O objetivo é aplicar entrevistas estruturadas com empresas reais para gerar diagnósticos automáticos e inteligentes que apoiem decisões estratégicas no mercado de treinamentos corporativos.

---

## 📖 Sumário
- [Sobre o Projeto](#about)
- [Objetivo do Desafio](#objetivo-do-desafio)
- [Backlog do Produto](#backlog-do-produto)
- [Cronograma de Sprints](#sprint)
- [Funcionalidades](#funcionalidades)
- [Requisitos não Funcionais](#requisitos-não-funcionais)
- [Tecnologias Utilizadas](#tecnologias)
- [Manuais e Documentação](#manuais-e-docs)
- [Autores](#authors)

---

## 📌 <span id="about">Sobre o Projeto</span>
Este projeto visa criar uma solução para **diagnóstico inteligente** de treinamentos, combinando **entrevistas estruturadas** com análise automática de dados.

---

## 🎯 <span id="objetivo-do-desafio">Objetivo do Desafio</span>
- Entregar **relatórios personalizados** às empresas, apontando necessidades, oportunidades e melhorias.  
- Fornecer **dados estratégicos** para a Entrenova validar produtos de treinamentos online e atender demandas do mercado.

---
## 📋 <span id="backlog-do-produto">Backlog do Produto</span>
| Rank | Prioridade | User Story                                                                                                                                            | Estimativa | Sprint |
| ---------- | ---------- | ---------- | ---------- | ---------- |
| 1    | Alta       | Como usuário, quero responder questionários e acessar relatórios personalizados para receber diagnósticos das minhas necessidades                     | 5          | 1      |
| 2    | Média      | Como usuário, quero acessar uma página inicial clara para entender o propósito do Radar Entrenova e acessar as principais funções                     | 3          | 1      |
| 3    | Alta       | Como usuário, quero acessar o sistema com meu e-mail e senha para visualizar meus diagnósticos e receber minha trilha personalizada                   | 5          | 1      |
| 4    | Alta       | Como usuário, quero acesso a um questionário aprofundado para receber relatórios mais específicos                                                     | 5          | 2      |
| 5    | Alta       | Como usuário que respondeu aos questionários, quero receber um diagnóstico personalizado para entender minhas necessidades e oportunidades            | 13         | 2      |
| 6    | Alta       | Como cliente, quero um relatório visual dos dados estratégicos que possibilite a tomada de decisão em projetos futuros                                 | 13         | 3     |

---
## 🏃‍ DoR - Definition of Ready
- User Stories com Critérios de Aceitação
- Subtarefas divididas a partir das US
- Design no Figma
- Modelagem do Banco de Dados
- Diagrama de Rotas
- Banco de Dados Vetorizado do Cliente
## 🏆 DoD - Definition of Done
- Manual de Usuário
- Manual da Aplicação
- Documentação da API (Application Programming Interface)
- Código completo
- Vídeos de cada etapa de entrega

---

## ✔ Criterios de Aceitação

### User Story 1 – Mini Questionário
- **Dado** que o usuário preenche o mini questionário, **quando** ele finalizar, **então** todas as respostas devem ser salvas no banco.  
- **Dado** que o usuário finalizou o questionário, **quando** o sistema gerar o relatório, **então** deve ser exibido um relatório simples automático.  
- **Dado** que o questionário foi concluído, **quando** as respostas forem salvas, **então** deve exibir uma mensagem de sucesso clara.  

### User Story 2 – Página Inicial
- **Dado** que o usuário acessa a página inicial, **então** deve exibir título, descrição e propósito do Radar Entrenova.  
- **Dado** que o usuário visualiza a página inicial, **então** deve haver botões funcionais para Login, Cadastro e Mini Questionário.  
- **Dado** que o usuário acessa a página em diferentes dispositivos, **então** a interface deve ser responsiva (desktop e mobile).  

### User Story 3 – Login
- **Dado** que o usuário informa email e senha corretos, **então** deve conseguir acessar sua conta.  
- **Dado** que o usuário informa dados incorretos, **então** deve exibir uma mensagem de erro apropriada.  
- **Dado** que o login é bem-sucedido, **então** o usuário deve visualizar seus diagnósticos e trilha personalizada.  

### User Story 4 – Questionário Aprofundado
- **Dado** que o usuário inicia o questionário aprofundado, **então** devem ser apresentadas perguntas extras além do mini questionário.  
- **Dado** que o usuário responde ao questionário, **então** todas as respostas devem ser salvas corretamente no banco.  
- **Dado** que o questionário é concluído, **então** o sistema deve gerar um relatório específico baseado nas respostas.  

### User Story 5 – Diagnóstico Personalizado
- **Dado** que o usuário completou o questionário, **então** o algoritmo deve gerar um relatório coerente com as respostas fornecidas.  
- **Dado** que o relatório é gerado, **então** a IA deve apresentar recomendações claras e aplicáveis.  

### User Story 6 – Relatório Visual Estratégico
- **Dado** que o usuário acessa o relatório estratégico, **então** devem ser exibidas métricas estratégicas definidas pela Entrenova.  
- **Dado** que há novos dados, **então** os relatórios devem carregar informações atualizadas em tempo real ou por lote.  

---

## 📅 <span id="sprint">Cronograma de Sprints </span>

| Sprint          |    Período    |
| --------------- | :-----------: | 
| 🔖 **SPRINT 1** | 08/09 - 28/09 | 
| 🔖 **SPRINT 2** | 06/10 - 26/10 | 
| 🔖 **SPRINT 3** | 03/11 - 23/11 | 

---

## ⚙️ <span id="funcionalidades">Funcionalidades</span>
-  Aplicação de entrevistas estruturadas  
-  Geração de relatórios personalizados  
-  Diagnóstico inteligente com IA offline  
-  Integração com base de dados de treinamentos  
-  Dashboard para visualização de resultados  

---

## 🔧 <span id="requisitos-não-funcionais">Requisitos Não Funcionais</span>
- IA offline.  
- Manual de instalação (no repositório).  
- Manual do usuário (no repositório).  
- Documentação da API.  

---
## 💻 <span id="tecnologias">Tecnologias</span>

<h4 align="center">
 <a href="https://developer.mozilla.org/pt-BR/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"></a>
 <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"></a>
 <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"></a>
 <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"></a>
 <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"></a>
 <a href="https://ollama.com/"><img src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white"></a>
 <a href="https://code.visualstudio.com/"><img src="https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white"></a>
 <a href="https://www.atlassian.com/software/jira"><img src="https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=jira&logoColor=white"/></a>
 <a href="https://github.com/"><img src="https://img.shields.io/badge/GitHub-121011?style=for-the-badge&logo=github&logoColor=white"/></a>
</h4>

---


## 📚 <span id="manuais-e-docs">Manuais e Documentação</span>
- 📖 [Manual de Instalação](docs/manual-instalacao.md)  
- 👨‍💻 [Manual do Usuário](docs/manual-usuario.md)  
- 🔌 [Documentação da API](docs/api.md)  

---

## 👥 <span id="authors">Autores</span>
Projeto desenvolvido pelos alunos do **3º semestre de ADS – FATEC SJC (2025-2)** em parceria com a **Entrenova**.  

<div align="center">
  <table>
    <tr>
      <th>Membro</th>
      <th>Função</th>
      <th>Github</th>
      <th>Linkedin</th>
    </tr>
    <tr>
      <td>Taylor Henrique</td>
      <td>Scrum Master</td>
      <td><a href="https://github.com/TaylorSilva2"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/taylor-silva-859300330/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Gabriel Sarubi</td>
      <td>Product Owner</td>
      <td><a href="https://github.com/GabrielSarubi-7"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/gabriel-sarubi-3050442b4/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Kayan Matta</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/kayanmatta"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/kayan-da-matta-453905253/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Bruna Matsunaga</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/bruna-hm"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/bruna-hayashi-matsunaga-1b4a71324/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Ryan Araújo</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/Ryan53132"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/ryan-araujo-dos-santos-8391b927b/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Rafael Candido</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/Rafa2-bit"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/rafael-candido-155705317/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Wesley Xavier</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/xvierdev"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/xvierbr/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
    <tr>
      <td>Tiago Bortolini</td>
      <td>Desenvolvedor</td>
      <td><a href="https://github.com/HelionLight"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a></td>
      <td><a href="https://www.linkedin.com/in/tiago-bortolini-772b162b6/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"></a></td>
    </tr>
  </table>
</div>

