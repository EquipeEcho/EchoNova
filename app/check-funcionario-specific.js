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

async function checkFuncionario() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/echonova');
    const func = await Funcionario.findById('6921003971e04ddbc7cfa2c8').select('nome email ultimaAlteracaoSenha');
    console.log('Funcionário encontrado:');
    console.log('Nome:', func.nome);
    console.log('Email:', func.email);
    console.log('ultimaAlteracaoSenha:', func.ultimaAlteracaoSenha);
    console.log('É null?', func.ultimaAlteracaoSenha === null);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

checkFuncionario();