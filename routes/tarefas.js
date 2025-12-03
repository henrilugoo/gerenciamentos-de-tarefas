const express = require('express');
const router = express.Router();

const Tarefa = require('../models/tarefa');
const Prioridade = require('../models/prioridade');
const Categoria = require('../models/categoria');

// Middleware simples para proteger rotas (verifica sessão)
function auth(req, res, next) {
	if (req.session && req.session.usuario) return next();
	return res.redirect('/login');
}

// Lista tarefas do usuário logado (com busca e filtros)
router.get('/', auth, async (req, res) => {
	try {
		const usuarioId = req.session.usuario.id;
		const { q, prioridade, status } = req.query;

		const filtros = { usuario_id: usuarioId };

		if (q) {
			filtros.titulo = { $regex: q, $options: 'i' };
		}

		if (prioridade) {
			filtros.id_prioridade = prioridade;
		}

		if (status === 'concluida') filtros.concluida = true;
		if (status === 'pendente') filtros.concluida = false;

			const tarefas = await Tarefa.find(filtros).populate('categoria_id id_prioridade').sort({ dataCriacao: -1 });
			const prioridades = await Prioridade.find().sort({ nivel: 1 });
			const categorias = await Categoria.find({ $or: [{ usuario_id: req.session.usuario.id }, { usuario_id: null }] }).sort({ nome: 1 });
			return res.render('tarefas/lista', { tarefas, prioridades, categorias, q: q || '', prioridade: prioridade || '', status: status || '' });
	} catch (err) {
		console.error(err);
		req.flash('error', 'Erro ao buscar tarefas');
		return res.redirect('/');
	}
});

	// Página de pesquisa separada
	router.get('/pesquisar', auth, async (req, res) => {
		try {
			const usuarioId = req.session.usuario.id;
			const { q, prioridade, categoria, status } = req.query;

			const filtros = { usuario_id: usuarioId };
			if (q) filtros.titulo = { $regex: q, $options: 'i' };
			if (prioridade) filtros.id_prioridade = prioridade;
			if (categoria) filtros.categoria_id = categoria;
			if (status === 'concluida') filtros.concluida = true;
			if (status === 'pendente') filtros.concluida = false;

			const tarefas = await Tarefa.find(filtros).populate('categoria_id id_prioridade').sort({ dataCriacao: -1 });
			const prioridades = await Prioridade.find().sort({ nivel: 1 });
			const categorias = await Categoria.find({ $or: [{ usuario_id: usuarioId }, { usuario_id: null }] }).sort({ nome: 1 });

			return res.render('tarefas/pesquisar', { tarefas, prioridades, categorias, q: q || '', prioridade: prioridade || '', categoria: categoria || '' });
		} catch (err) {
			console.error(err);
			req.flash('error', 'Erro na pesquisa');
			return res.redirect('/tarefas');
		}
	});

// Criar nova tarefa
router.post('/criar', auth, async (req, res) => {
	try {
		const usuarioId = req.session.usuario.id;
		const { titulo, descricao, dataVencimento, dataInicio, id_prioridade, categoria_id } = req.body;
		const nova = new Tarefa({
			titulo,
			descricao,
			dataInicio: dataInicio || null,
			dataVencimento: dataVencimento || null,
			usuario_id: usuarioId,
			id_prioridade: id_prioridade || null,
			categoria_id: categoria_id || null
		});
		await nova.save();
		req.flash('success', 'Tarefa criada com sucesso');
		return res.redirect('/tarefas');
	} catch (err) {
		console.error(err);
		req.flash('error', 'Erro ao criar tarefa');
		return res.redirect('/tarefas');
	}
});

// Rota para editar (form)
router.get('/editar/:id', auth, async (req, res) => {
	try {
		const { id } = req.params;
	const tarefa = await Tarefa.findById(id).populate('categoria_id id_prioridade');
		if (!tarefa) {
			req.flash('error', 'Tarefa não encontrada');
			return res.redirect('/tarefas');
		}
		if (String(tarefa.usuario_id) !== String(req.session.usuario.id)) {
			req.flash('error', 'Permissão negada');
			return res.redirect('/tarefas');
		}
		const prioridades = await Prioridade.find();
		const categorias = await Categoria.find().sort({ nome: 1 });
		return res.render('tarefas/editar', { tarefa, prioridades, categorias });
	} catch (err) {
		console.error(err);
		req.flash('error', 'Erro ao abrir edição');
		return res.redirect('/tarefas');
	}
});

// Rota para criar (form separado)
router.get('/novo', auth, async (req, res) => {
	try {
		const prioridades = await Prioridade.find().sort({ nivel: 1 });
		const categorias = await Categoria.find({ $or: [{ usuario_id: req.session.usuario.id }, { usuario_id: null }] }).sort({ nome: 1 });
		return res.render('tarefas/novo', { prioridades, categorias });
	} catch (err) {
		console.error(err);
		req.flash('error', 'Erro ao abrir formulário de nova tarefa');
		return res.redirect('/tarefas');
	}
});

// Atualizar tarefa
router.post('/atualizar/:id', auth, async (req, res) => {
	try {
		const { id } = req.params;
		const { titulo, descricao, dataVencimento, dataInicio, concluida, id_prioridade, categoria_id } = req.body;
	const tarefa = await Tarefa.findById(id).populate('categoria_id id_prioridade');
		if (!tarefa) {
			req.flash('error', 'Tarefa não encontrada');
			return res.redirect('/tarefas');
		}
		if (String(tarefa.usuario_id) !== String(req.session.usuario.id)) {
			req.flash('error', 'Permissão negada');
			return res.redirect('/tarefas');
		}

		tarefa.titulo = titulo;
		tarefa.descricao = descricao;
		tarefa.dataInicio = dataInicio || null;
		tarefa.dataVencimento = dataVencimento || null;
		tarefa.concluida = !!concluida;
		tarefa.id_prioridade = id_prioridade || null;
		tarefa.categoria_id = categoria_id || null;

		await tarefa.save();
		req.flash('success', 'Tarefa atualizada com sucesso');
		return res.redirect('/tarefas');
	} catch (err) {
		console.error(err);
		req.flash('error', 'Erro ao atualizar tarefa');
		return res.redirect('/tarefas');
	}
});

// Deletar tarefa (com permissão)
router.post('/deletar/:id', auth, async (req, res) => {
	try {
		const { id } = req.params;
		const tarefa = await Tarefa.findById(id);
		if (!tarefa) {
			req.flash('error', 'Tarefa não encontrada');
			return res.redirect('/tarefas');
		}
		if (String(tarefa.usuario_id) !== String(req.session.usuario.id)) {
			req.flash('error', 'Permissão negada');
			return res.redirect('/tarefas');
		}
		await Tarefa.findByIdAndDelete(id);
		req.flash('success', 'Tarefa excluída');
		return res.redirect('/tarefas');
	} catch (err) {
		console.error(err);
		req.flash('error', 'Erro ao deletar tarefa');
		return res.redirect('/tarefas');
	}
});

// Marcar como concluída
router.post('/concluir/:id', auth, async (req, res) => {
	try {
		const { id } = req.params;
		const tarefa = await Tarefa.findById(id);
		if (!tarefa) {
			req.flash('error', 'Tarefa não encontrada');
			return res.redirect('/tarefas');
		}
		if (String(tarefa.usuario_id) !== String(req.session.usuario.id)) {
			req.flash('error', 'Permissão negada');
			return res.redirect('/tarefas');
		}
		tarefa.concluida = true;
		await tarefa.save();
		req.flash('success', 'Tarefa marcada como concluída');
		return res.redirect('/tarefas');
	} catch (err) {
		console.error(err);
		req.flash('error', 'Erro ao concluir tarefa');
		return res.redirect('/tarefas');
	}
});

// Reabrir tarefa (marcar como pendente)
router.post('/reabrir/:id', auth, async (req, res) => {
	try {
		const { id } = req.params;
		const tarefa = await Tarefa.findById(id);
		if (!tarefa) {
			req.flash('error', 'Tarefa não encontrada');
			return res.redirect('/tarefas');
		}
		if (String(tarefa.usuario_id) !== String(req.session.usuario.id)) {
			req.flash('error', 'Permissão negada');
			return res.redirect('/tarefas');
		}
		tarefa.concluida = false;
		await tarefa.save();
		req.flash('success', 'Tarefa reaberta');
		return res.redirect('/tarefas');
	} catch (err) {
		console.error(err);
		req.flash('error', 'Erro ao reabrir tarefa');
		return res.redirect('/tarefas');
	}
});

module.exports = router;

// Rota alternativa /tarefas/lista -> redireciona para a listagem principal
router.get('/lista', auth, (req, res) => {
	return res.redirect('/tarefas');
});
