const express = require('express');
const router = express.Router();

const Prioridade = require('../models/prioridade');

// simple auth middleware (prioridades can be global, but require login to manage)
function auth(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.redirect('/login');
}

// Listar
router.get('/', auth, async (req, res) => {
  try {
    const prioridades = await Prioridade.find().sort({ nivel: 1 });
    return res.render('prioridades/lista', { prioridades });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao listar prioridades');
    return res.redirect('/');
  }
});

// Form novo
router.get('/novo', auth, (req, res) => {
  return res.render('prioridades/novo', { returnTo: req.query.returnTo || '' });
});

// Criar
router.post('/criar', auth, async (req, res) => {
  try {
    const { nivel } = req.body;
    const p = new Prioridade({ nivel });
    await p.save();
    req.flash('success', 'Prioridade criada');
    if (req.body && req.body.returnTo) return res.redirect(req.body.returnTo);
    if (req.body && req.body.continue) return res.redirect('/prioridades/novo');
    return res.redirect('/prioridades');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao criar prioridade');
    return res.redirect('/prioridades');
  }
});

// Editar
router.get('/editar/:id', auth, async (req, res) => {
  try {
    const p = await Prioridade.findById(req.params.id);
    if (!p) {
      req.flash('error', 'Prioridade não encontrada');
      return res.redirect('/prioridades');
    }
    return res.render('prioridades/editar', { prioridade: p });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao abrir edição');
    return res.redirect('/prioridades');
  }
});

// Atualizar
router.post('/atualizar/:id', auth, async (req, res) => {
  try {
    const { nivel } = req.body;
    const p = await Prioridade.findById(req.params.id);
    if (!p) {
      req.flash('error', 'Prioridade não encontrada');
      return res.redirect('/prioridades');
    }
    p.nivel = nivel;
    await p.save();
    req.flash('success', 'Prioridade atualizada');
    return res.redirect('/prioridades');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao atualizar prioridade');
    return res.redirect('/prioridades');
  }
});

// Deletar
router.post('/deletar/:id', auth, async (req, res) => {
  try {
    await Prioridade.findByIdAndDelete(req.params.id);
    req.flash('success', 'Prioridade excluída');
    return res.redirect('/prioridades');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao excluir prioridade');
    return res.redirect('/prioridades');
  }
});

module.exports = router;
