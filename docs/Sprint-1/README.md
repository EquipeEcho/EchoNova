# 🏁 Sprint Backlog

## User Stories Selecionadas

| Rank | Prioridade | User Story | Estimativa |
|------|------------|------------|------------|
| 1 | Alta | Como usuário, quero responder questionários e acessar relatórios personalizados para receber diagnósticos das minhas necessidades | 5 |
| 2 | Média | Como usuário, quero acessar uma página inicial clara para entender o propósito do Radar Entrenova e acessar as principais funções | 3 |
| 3 | Alta | Como usuário, quero acessar o sistema com meu e-mail e senha para visualizar meus diagnósticos e receber minha trilha personalizada | 5 |

---

# 🏃 DoR - Definition of Ready

| Critério | Descrição |
|----------|-----------|
| Clareza na Descrição | A User Story está escrita no formato “Como [persona], quero [ação] para que [objetivo]”. |
| Critérios de Aceitação Definidos | A história possui objetivos claros que indicam o que é necessário para considerá-la concluída. |
| Cenários de Teste Especificados | A história tem pelo menos 1 cenário de teste estruturado (Dado, Quando, Então). |
| Independente | A história pode ser implementada sem depender de outra tarefa da mesma Sprint. |
| Compreensão Compartilhada | Toda a equipe (incluindo PO e devs) compreende o propósito da história. |
| Estimável | A história possui uma estimativa clara definida no planejamento. |

# 🏆 Definition of Done – Sprint 1

| Critério | Descrição |
|----------|-----------|
| Critérios de Aceitação Atendidos | Todos os cenários de teste da história foram executados e aprovados. |
| Código Revisado | O código foi revisado por pelo menos um colega de equipe. |
| Build/Testes Automatizados| A funcionalidade não quebrou a aplicação e passou nos testes. |
| Validação do PO | O Product Owner validou a entrega com base nos critérios definidos. |

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

---

## 👥 <span id="authors">Autores</span>
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
