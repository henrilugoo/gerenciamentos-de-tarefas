const conexao = require('../config/conexao');
const Schema = conexao.Schema;

const UsuarioSchema = new Schema({
    nome: {
        type: String,
        required: true // Adicionar regras, como "obrigatório"
    },
    email: {
        type: String,
        required: true,
        unique: true // Garante que o email seja único 
    },
    senha: {
        type: String,
        required: true
    },
    dataCriacao: {
        type: Date,
        default: Date.now // Define um valor padrão
    }
});

const Usuario = conexao.model("Usuario", UsuarioSchema);
module.exports = Usuario;