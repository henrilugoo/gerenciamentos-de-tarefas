const mongoose = require('../config/conexao');
const Prioridade = require('../models/prioridade');
const Categoria = require('../models/categoria');

async function seed() {
  try {
  const priorities = ['Baixa','Média','Alta'];
    for (const nivel of priorities) {
      const exists = await Prioridade.findOne({ nivel });
      if (!exists) {
        await Prioridade.create({ nivel });
        console.log('Criada prioridade:', nivel);
      } else {
        console.log('Prioridade já existe:', nivel);
      }
    }

    const categorias = ['Treino','Pessoal','Estudos','Trabalho'];
    for (const nome of categorias) {
      const exists = await Categoria.findOne({ nome });
      if (!exists) {
        // categorias pré-montadas são globais (usuario_id = null)
        await Categoria.create({ nome, cor: null, usuario_id: null });
        console.log('Criada categoria global:', nome);
      } else {
        console.log('Categoria já existe:', nome);
      }
    }

    console.log('Seed completo');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
