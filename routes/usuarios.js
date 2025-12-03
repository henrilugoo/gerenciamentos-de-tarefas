const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');

// Render login and registrar (se suas views chamarem rotas diferentes, ajuste)
router.get('/login', (req, res) => {
	res.render('login');
});

router.get('/registrar', (req, res) => {
	res.render('registrar');
});

// POST /registrar
router.post('/registrar', async (req, res) => {
	try {
		const { nome, email, senha } = req.body;
		if (!nome || !email || !senha) {
			return res.status(400).render('registrar', { erro: 'Preencha todos os campos' });
		}

		const existente = await Usuario.findOne({ email });
		if (existente) {
			return res.status(400).render('registrar', { erro: 'Email já cadastrado' });
		}

		const salt = await bcrypt.genSalt(10);
		const senhaHash = await bcrypt.hash(senha, salt);

		const novo = new Usuario({ nome, email, senha: senhaHash });
		await novo.save();

		return res.redirect('/login');
	} catch (err) {
		console.error(err);
		return res.status(500).render('registrar', { erro: 'Erro ao registrar usuário' });
	}
});

// POST /login
router.post('/login', async (req, res) => {
	try {
		const { email, senha } = req.body;
		if (!email || !senha) return res.status(400).render('login', { erro: 'Preencha email e senha' });

		const usuario = await Usuario.findOne({ email });
		if (!usuario) return res.status(400).render('login', { erro: 'Usuário não encontrado' });

		const ok = await bcrypt.compare(senha, usuario.senha);
		if (!ok) return res.status(400).render('login', { erro: 'Senha incorreta' });

		req.session.usuario = { id: usuario._id, nome: usuario.nome, email: usuario.email };
		return res.redirect('/tarefas');
	} catch (err) {
		console.error(err);
		return res.status(500).render('login', { erro: 'Erro ao autenticar' });
	}
});

// Logout
router.get('/logout', (req, res) => {
	req.session.destroy(() => {
		res.redirect('/login');
	});
});

module.exports = router;
