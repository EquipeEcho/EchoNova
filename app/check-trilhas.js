const mongoose = require('mongoose');
require('dotenv').config();

const FuncionarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  cargo: { type: String, required: true },
  matricula: { type: String, required: true },
  senha: { type: String, required: true },
  ultimaAlteracaoSenha: { type: Date, default: null },
  trilhas: [{
    trilha: { type: mongoose.Schema.Types.ObjectId, ref: "Trilha" },
    status: { type: String, enum: ["não_iniciado", "em_andamento", "pendente"], default: "não_iniciado" },
    dataInicio: { type: Date }
  }],
  trilhasConcluidas: [{
    trilha: { type: mongoose.Schema.Types.ObjectId, ref: "Trilha" },
    dataConclusao: { type: Date, default: Date.now }
  }],
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: "Empresa", required: true },
  data_cadastro: { type: Date, default: Date.now }
}, { timestamps: true });

const Funcionario = mongoose.models.Funcionario || mongoose.model("Funcionario", FuncionarioSchema);

async function fixFuncionarioStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echonova');

    console.log('=== CORRIGINDO STATUS DOS FUNCIONÁRIOS ===');

    // Buscar funcionários com status "pendente"
    const funcionariosComPendente = await Funcionario.find({
      'trilhas.status': 'pendente'
    });

    console.log(`Encontrados ${funcionariosComPendente.length} funcionários com status "pendente"`);

    let totalCorrigidos = 0;

    for (const funcionario of funcionariosComPendente) {
      let changed = false;

      for (const trilha of funcionario.trilhas) {
        if (trilha.status === 'pendente') {
          console.log(`Corrigindo funcionário ${funcionario._id}: ${trilha.status} → não_iniciado`);
          trilha.status = 'não_iniciado';
          changed = true;
          totalCorrigidos++;
        }
      }

      if (changed) {
        await funcionario.save();
      }
    }

    console.log(`\\n✅ Correção concluída!`);
    console.log(`- Status corrigidos: ${totalCorrigidos}`);

    // Verificar se ainda existem
    const restantes = await Funcionario.countDocuments({ 'trilhas.status': 'pendente' });
    console.log(`- Status "pendente" restantes: ${restantes}`);

    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

fixFuncionarioStatus();