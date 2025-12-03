// Conexão com o MongoDB (usa DATABASE_URL se definida)
require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.DATABASE_URL || 'mongodb://localhost:27017/gerenciador-tarefas';

async function conectar() {
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ Conectado ao MongoDB com sucesso!');
    } catch (err) {
        console.error('❌ Erro ao conectar ao MongoDB:', err.message);
        // Não finalizar o processo automaticamente aqui — deixe o app decidir
    }
}

conectar();

module.exports = mongoose;