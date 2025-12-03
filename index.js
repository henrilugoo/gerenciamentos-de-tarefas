// Servidor principal
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');

// Garante que a conexão com o MongoDB seja estabelecida ao carregar o app
require('./config/conexao');

const usuariosRouter = require('./routes/usuarios');
const tarefasRouter = require('./routes/tarefas');
const categoriasRouter = require('./routes/categorias');
const prioridadesRouter = require('./routes/prioridades');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET || 'chave_padrao_nao_segura',
    resave: false,
    saveUninitialized: false
}));

// flash messages
app.use(flash());

// expose flash messages to views
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

// Disponibiliza o usuário da sessão para as views (res.locals.user)
app.use((req, res, next) => {
    res.locals.user = req.session ? req.session.usuario : null;
    next();
});

// Rotas
app.use('/', usuariosRouter);
app.use('/tarefas', tarefasRouter);
app.use('/categorias', categoriasRouter);
app.use('/prioridades', prioridadesRouter);

// Rota raiz (redireciona para login ou tarefas, dependendo da sua view)
app.get('/', (req, res) => {
    res.render('home');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});