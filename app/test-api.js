async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/debug/funcionarios');
    const data = await response.json();
    console.log('Funcionários encontrados:', data.total);
    data.funcionarios.forEach((f, i) => {
      console.log(`${i+1}. ${f.nome}: ultimaAlteracaoSenha = ${f.ultimaAlteracaoSenha}`);
    });
  } catch (error) {
    console.error('Erro:', error);
  }
}

testAPI();