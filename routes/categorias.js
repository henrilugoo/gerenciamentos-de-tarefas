const express = require('express');
const router = express.Router();

const Categoria = require('../models/categoria');

// simple auth middleware
function auth(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.redirect('/login');
}

// Listar categorias do usuário
router.get('/', auth, async (req, res) => {
  try {
    // mostrar categorias globais (usuario_id == null) e as do usuário
    const categorias = await Categoria.find({ $or: [{ usuario_id: req.session.usuario.id }, { usuario_id: null }] }).sort({ nome: 1 });
    return res.render('categorias/lista', { categorias });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao listar categorias');
    return res.redirect('/');
  }
});

// Form novo
router.get('/novo', auth, (req, res) => {
  return res.render('categorias/novo', { returnTo: req.query.returnTo || '' });
});

// Criar
router.post('/criar', auth, async (req, res) => {
  try {
    const { nome, cor } = req.body;
    // Tratar cor padrão/branco como 'sem cor' para não poluir a base
    const corVal = (cor && cor.trim() && cor !== '#ffffff') ? cor : null;
    const c = new Categoria({ nome, cor: corVal, usuario_id: req.session.usuario.id });
    await c.save();
    req.flash('success', 'Categoria criada');
    // Se o usuário clicou em Criar e nova, permanece na página de criação
  if (req.body && req.body.returnTo) return res.redirect(req.body.returnTo);
  if (req.body && req.body.continue) return res.redirect('/categorias/novo');
  return res.redirect('/categorias');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao criar categoria');
    return res.redirect('/categorias');
  }
});

// Editar
router.get('/editar/:id', auth, async (req, res) => {
  try {
    const cat = await Categoria.findById(req.params.id);
    if (!cat) {
      req.flash('error', 'Categoria não encontrada');
      return res.redirect('/categorias');
    }
    if (String(cat.usuario_id) !== String(req.session.usuario.id)) {
      req.flash('error', 'Permissão negada');
      return res.redirect('/categorias');
    }
    return res.render('categorias/editar', { categoria: cat });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao abrir edição');
    return res.redirect('/categorias');
  }
});

// Atualizar
router.post('/atualizar/:id', auth, async (req, res) => {
  try {
    const { nome, cor } = req.body;
    const cat = await Categoria.findById(req.params.id);
    if (!cat) {
      req.flash('error', 'Categoria não encontrada');
      return res.redirect('/categorias');
    }
    if (String(cat.usuario_id) !== String(req.session.usuario.id)) {
      req.flash('error', 'Permissão negada');
      return res.redirect('/categorias');
    }
  cat.nome = nome;
  cat.cor = (cor && cor.trim() && cor !== '#ffffff') ? cor : null;
    await cat.save();
    req.flash('success', 'Categoria atualizada');
    return res.redirect('/categorias');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao atualizar categoria');
    return res.redirect('/categorias');
  }
});

// Deletar
router.post('/deletar/:id', auth, async (req, res) => {
  try {
    const cat = await Categoria.findById(req.params.id);
    if (!cat) {
      req.flash('error', 'Categoria não encontrada');
      return res.redirect('/categorias');
    }
    if (String(cat.usuario_id) !== String(req.session.usuario.id)) {
      req.flash('error', 'Permissão negada');
      return res.redirect('/categorias');
    }
    await Categoria.findByIdAndDelete(req.params.id);
    req.flash('success', 'Categoria excluída');
    return res.redirect('/categorias');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Erro ao excluir categoria');
    return res.redirect('/categorias');
  }
});

module.exports = router;
