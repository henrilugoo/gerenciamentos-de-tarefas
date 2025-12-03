const conexao = require('../config/conexao');
const Schema = conexao.Schema;

const CategoriaSchema = new Schema({
    // Nome da categoria (ex: "Trabalho", "Estudo") 
    nome: {
        type: String,
        required: true
    },
    // Cor opcional (ex: "#FF5733") 
    cor: {
        type: String,
        required: false // 'required: false' significa que é opcional
    },

    // --- Chave Estrangeira (FK) ---
    // Referencia o _id do USUÁRIO (dono da categoria) 
    usuario_id: {
        type: conexao.Schema.Types.ObjectId, // Tipo especial para FK
        ref: 'Usuario', // Indica qual Model estamos a referenciar
        required: false  // Opcional: null = categoria global
    }
});

const Categoria = conexao.model("Categoria", CategoriaSchema);
module.exports = Categoria;