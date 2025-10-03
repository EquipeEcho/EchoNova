# 🏁 Sprint Backlog 2

## User Stories Selecionadas

| Rank | Prioridade | User Story                                                               | Estimativa |
| ---- | ---------- | ------------------------------------------------------------------------ | ---------- |
| 6    | Alta       | Como **empresa**, quero receber junto ao diagnóstico inicial um convite para escolher um plano, para poder avançar para o pagamento e posteriormente o cadastro.                     | 3          |
| 7    | Alta       | Como **empresa**, quero visualizar uma tela clara com diferentes planos da plataforma, para comparar opções e escolher o mais adequado antes do cadastro.                            | 3          |
| 8    | Alta       | Como **empresa**, quero realizar o pagamento da taxa de adesão escolhendo um dos planos disponíveis, para desbloquear o cadastro.                                                    | 5          | 
| 9    | Média      | Como **empresa**, quero receber a confirmação de pagamento por email, para ter segurança de que meu plano foi registrado.                                                            | 3          |
| 10   | Alta       | Como **empresa**, quero efetuar meu cadastro somente após o pagamento, para ter acesso aos diagnósticos completos da plataforma.                                                     | 3          | 
| 11   | Alta       | Como **empresa cadastrada**, quero responder um questionário aprofundado para obter um relatório detalhado e que me direcione para minhas trilhas necessárias.                       | 5          |
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
## ✔ Critérios de Aceitação – Sprint 2

### User Story 6 – Convite para Planos
- **Dado** que o usuário concluiu o mini diagnóstico, **quando** ele visualizar o resultado, **então** deve aparecer um convite claro para escolher um plano.  
- **Dado** que o convite é exibido, **quando** o usuário clicar nele, **então** deve ser redirecionado para a tela de planos.  

### User Story 7 – Tela de Planos
- **Dado** que o usuário acessa a tela de planos, **então** deve visualizar as 3 opções comparáveis, com informações claras de preço e benefícios.  
- **Dado** que o usuário clica em um plano, **então** esse plano deve ser marcado como selecionado.  
- **Dado** que o usuário visualiza a tela, **então** a interface deve ser responsiva, funcionando corretamente em desktop e dispositivos móveis.  

### User Story 8 – Pagamento
- **Dado** que o usuário escolheu um plano, **quando** inserir dados válidos de pagamento, **então** a transação deve ser processada com sucesso (simulada).  
- **Dado** que o pagamento foi concluído, **então** deve ser exibida uma tela de confirmação com detalhes da transação.  
- **Dado** que o pagamento falhar, **então** o sistema deve exibir uma mensagem clara e permitir nova tentativa.  

### User Story 9 – Confirmação de Pagamento por Email
- **Dado** que o pagamento foi aprovado, **quando** o sistema receber a confirmação, **então** deve disparar um email de confirmação para o usuário.  
- **Dado** que o email foi enviado, **então** ele deve conter o plano escolhido e os próximos passos para o cadastro.  

### User Story 10 – Cadastro após Pagamento
- **Dado** que o pagamento foi confirmado, **quando** o usuário acessar a plataforma, **então** o cadastro deve ser liberado.  
- **Dado** que o usuário ainda não pagou, **então** o sistema não deve liberar o cadastro.  

### User Story 11 – Questionário Aprofundado
- **Dado** que o usuário é cadastrado, **quando** acessar o questionário aprofundado, **então** deve conseguir responder todas as perguntas obrigatórias.  
- **Dado** que o questionário foi finalizado, **então** o sistema deve gerar um relatório detalhado com base nas respostas.  

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
