const conexao = require('../config/conexao');
const Schema = conexao.Schema;

const TarefaSchema = new Schema({
    // Título curto da tarefa 
    titulo: {
        type: String,
        required: true
    },
    // (Opcional) Detalhes adicionais 
    descricao: {
        type: String,
        required: false
    },
    // Status da tarefa (Padrão: false) 
    concluida: {
        type: Boolean,
        default: false 
    },
    // Data de início e fim (opcionais)
    dataInicio: {
        type: Date,
        required: false
    },
    // Timestamp de quando a tarefa foi criada 
    dataCriacao: {
        type: Date,
        default: Date.now // Valor padrão é a data/hora atual
    },
    // (Opcional) Prazo final 
    dataVencimento: {
        type: Date,
        required: false
    },

    // --- Chaves Estrangeiras (FKs) ---

    // Referencia o _id da coleção USUÁRIO 
    usuario_id: {
        type: conexao.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    // Referencia o _id da coleção CATEGORIA 
    categoria_id: {
        type: conexao.Schema.Types.ObjectId,
        ref: 'Categoria',
        required: false // tornar opcional para facilitar criação via UI
    },
    // Referencia o _id da coleção PRIORIDADE 
    id_prioridade: {
        type: conexao.Schema.Types.ObjectId,
        ref: 'Prioridade',
        required: false // opcional
    }
});

const Tarefa = conexao.model("Tarefa", TarefaSchema);
module.exports = Tarefa;