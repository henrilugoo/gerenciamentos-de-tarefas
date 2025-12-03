
const conexao = require('../config/conexao');
const Schema = conexao.Schema;


const PrioridadeSchema = new Schema({
    // "nivel" (ex: "Alta") 
    nivel: {
        type: String,
        required: true 
    }
    // O _id (PK) é adicionado automaticamente pelo MongoDB 
});

// O Mongoose vai criar uma coleção chamada 'prioridades'
const Prioridade = conexao.model("Prioridade", PrioridadeSchema);
module.exports = Prioridade;