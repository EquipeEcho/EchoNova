const mongoose = require('mongoose');
require('dotenv').config();

const FuncionarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true },
  cargo: { type: String, required: true },
  matricula: { type: String, required: true },
  senha: { type: String, required: true },
  ultimaAlteracaoSenha: { type: Date, default: null },
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa', required: true },
}, { timestamps: true });

const Funcionario = mongoose.models.Funcionario || mongoose.model('Funcionario', FuncionarioSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echonova');
    const f = await Funcionario.find({}).select('nome email ultimaAlteracaoSenha');
    console.log('Funcionários:');
    f.forEach((func, i) => console.log(`${i+1}. ${func.nome}: ${func.ultimaAlteracaoSenha}`));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

check();