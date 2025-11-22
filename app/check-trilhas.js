const mongoose = require('mongoose');
require('dotenv').config();

const TrilhaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  categoria: {
    type: String,
    enum: ["Comunicação", "Gestão de Tempo", "Inovação", "Liderança", "Diversidade"],
    required: true,
  },
  status: {
    type: String,
    enum: ["ativa", "inativa", "rascunho"],
    default: "ativa",
  },
}, { timestamps: true });

const Trilha = mongoose.models.Trilha || mongoose.model("Trilha", TrilhaSchema);

async function checkTrilhasSemCategoria() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echonova');

    // Buscar trilhas onde categoria é null, undefined, vazia ou não está no enum
    const trilhasSemCategoria = await Trilha.find({
      $or: [
        { categoria: null },
        { categoria: undefined },
        { categoria: '' },
        { categoria: { $nin: ['Comunicação', 'Gestão de Tempo', 'Inovação', 'Liderança', 'Diversidade'] } }
      ]
    }).select('nome categoria status createdAt');

    console.log('=== TRILHAS SEM CATEGORIA VÁLIDA ===');
    console.log('Encontradas:', trilhasSemCategoria.length);

    if (trilhasSemCategoria.length > 0) {
      trilhasSemCategoria.forEach((trilha, index) => {
        console.log(`${index + 1}. "${trilha.nome}"`);
        console.log(`   - Categoria atual: "${trilha.categoria}"`);
        console.log(`   - Status: ${trilha.status}`);
        console.log(`   - Criado em: ${trilha.createdAt}`);
        console.log('');
      });
    } else {
      console.log('✅ Nenhuma trilha sem categoria encontrada.');
    }

    // Também vamos ver todas as categorias existentes
    const todasCategorias = await Trilha.distinct('categoria');
    console.log('=== TODAS AS CATEGORIAS EXISTENTES ===');
    console.log(todasCategorias);

    // Estatísticas por categoria
    console.log('\\n=== ESTATÍSTICAS POR CATEGORIA ===');
    for (const cat of ['Comunicação', 'Gestão de Tempo', 'Inovação', 'Liderança', 'Diversidade']) {
      const count = await Trilha.countDocuments({ categoria: cat });
      console.log(`${cat}: ${count} trilha(s)`);
    }

    const totalTrilhas = await Trilha.countDocuments();
    console.log(`\\nTotal de trilhas: ${totalTrilhas}`);

    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

checkTrilhasSemCategoria();