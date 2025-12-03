const Prioridade = require('../models/prioridade');
require('../config/conexao');

async function run() {
  try {
    const res = await Prioridade.updateMany({ nivel: 'Media' }, { $set: { nivel: 'Média' } });
    console.log('Atualizados:', res.modifiedCount || res.n || 0);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setTimeout(run, 1000); // espera a conexão
