async function checkTrilhas() {
  try {
    // Fazer requisição para a API de trilhas
    const response = await fetch('http://localhost:3000/api/trilhas');
    const data = await response.json();

    const trilhas = data.trilhas || [];
    console.log('=== ANÁLISE DE TRILHAS ===');
    console.log('Total de trilhas encontradas:', trilhas.length);

    const categoriasValidas = ['Comunicação', 'Gestão de Tempo', 'Inovação', 'Liderança', 'Diversidade'];

    const trilhasSemCategoria = [];
    const estatisticas = {};

    trilhas.forEach(trilha => {
      const categoria = trilha.categoria;

      // Verificar se a categoria é válida
      if (!categoria || !categoriasValidas.includes(categoria)) {
        trilhasSemCategoria.push({
          nome: trilha.nome,
          categoria: categoria,
          status: trilha.status,
          id: trilha._id
        });
      }

      // Contar estatísticas
      if (categoria) {
        estatisticas[categoria] = (estatisticas[categoria] || 0) + 1;
      } else {
        estatisticas['Sem categoria'] = (estatisticas['Sem categoria'] || 0) + 1;
      }
    });

    console.log('\n=== TRILHAS SEM CATEGORIA VÁLIDA ===');
    if (trilhasSemCategoria.length > 0) {
      trilhasSemCategoria.forEach((trilha, index) => {
        console.log(`${index + 1}. "${trilha.nome}"`);
        console.log(`   - Categoria atual: "${trilha.categoria || 'Nenhuma'}"`);
        console.log(`   - Status: ${trilha.status}`);
        console.log(`   - ID: ${trilha.id}`);
        console.log('');
      });
    } else {
      console.log('✅ Nenhuma trilha sem categoria encontrada.');
    }

    console.log('=== ESTATÍSTICAS POR CATEGORIA ===');
    Object.entries(estatisticas).forEach(([categoria, count]) => {
      console.log(`${categoria}: ${count} trilha(s)`);
    });

  } catch (error) {
    console.error('Erro ao consultar trilhas:', error.message);
  }
}

checkTrilhas();