# 🏁 Sprint Backlog 3

## User Stories Selecionadas

| Rank | Prioridade | User Story                                                                                             | Estimativa |
| ---- | ---------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| 12   | Alta       | Como **empresa proprietária da API**, quero visualizar quais trilhas foram recomendadas para cada empresa, para acompanhar a jornada de cada cliente e ajustar ofertas estratégicas. | 8          |
| 13   | Média      | Como **empresa proprietária da API**, quero visualizar em um dashboard quais empresas responderam o questionário simplificado, para identificar potenciais clientes. | 5          |
| 14   | Média      | Como **empresa proprietária da API**, quero visualizar no dashboard quais empresas se cadastraram e responderam o questionário completo, para acompanhar leads em potencial. | 5          |
| 15   | Alta       | Como **empresa proprietária da API**, quero ver quais trilhas são as mais escolhidas, para auxiliar na produção de conteúdos específicos. | 3          |

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

---

# 🏆 Definition of Done – Sprint 3

| Critério | Descrição |
|----------|-----------|
| Critérios de Aceitação Atendidos | Todos os cenários de teste da história foram executados e aprovados. |
| Código Revisado | O código foi revisado por pelo menos um colega de equipe. |
| Build/Testes Automatizados| A funcionalidade não quebrou a aplicação e passou nos testes. |
| Validação do PO | O Product Owner validou a entrega com base nos critérios definidos. |

---

## ✔ Critérios de Aceitação – Sprint 3

### User Story 12 – Visualização de Trilhas por Empresa
- **Dado** que a empresa proprietária acessa o dashboard, **quando** selecionar uma empresa, **então** deve visualizar as trilhas recomendadas para ela.  
- **Dado** que o dashboard exibe as trilhas, **então** o sistema deve permitir visualizar detalhes de cada trilha e empresa associada.  

### User Story 13 – Empresas com Questionário Simplificado
- **Dado** que a empresa proprietária acessa o dashboard, **quando** selecionar a aba “Empresas Interessadas”, **então** deve visualizar todas as empresas que completaram o diagnóstico simplificado.  
- **Dado** que as informações são exibidas, **então** devem conter nome, e-mail e data da resposta.  

### User Story 14 – Empresas Cadastradas e Diagnóstico Completo
- **Dado** que a empresa proprietária acessa o dashboard, **quando** selecionar a aba “Empresas Cadastradas”, **então** deve visualizar as empresas que completaram o diagnóstico completo.  
- **Dado** que os dados são exibidos, **então** devem conter o nome da empresa, data de cadastro e status do diagnóstico.  

### User Story 15 – Trilhas Mais Escolhidas
- **Dado** que a empresa proprietária acessa o dashboard, **quando** visualizar a seção de estatísticas, **então** deve ver um ranking das trilhas mais recomendadas.  
- **Dado** que o ranking é exibido, **então** deve ser possível ordenar ou quantificar as trilhas visando utilidade para geração de conteúdos.  

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
