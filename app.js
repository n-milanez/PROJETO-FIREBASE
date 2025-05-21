const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

const serviceAccount = require('./projeto-node-firebase-firebase-adminsdk-fbsvc-ca8c8a5621.json');

// Inicializa Firebase
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

// CONFIGURAÇÃO CORRETA DO HANDLEBARS COM HELPER EQ
app.engine("handlebars", exphbs.engine({
  defaultLayout: "main",
  helpers: {
    eq: function (a, b) {
      return a === b;
    }
  }
}));
app.set("view engine", "handlebars");

// MIDDLEWARES
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// ROTA INICIAL
app.get("/", function(req, res){
    res.render("primeira_pagina")
})

// CADASTRAR
app.post('/cadastrar', async function(req, res){
    try {
        await db.collection('posts').add({
            nome: req.body.nome,
            telefone: req.body.telefone,
            origem: req.body.origem,
            data_contato: req.body.data_contato,
            observacao: req.body.observacao,
            criadoEm: Timestamp.now()
        })
        res.redirect('/consulta')
    } catch (erro) {
        res.send('Erro ao criar o post: ' + erro)
    }
})

// CONSULTAR
app.get('/consulta', async function(req, res){
    try {
        const postsSnapshot = await db.collection('posts').get()
        const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        res.render('consulta', { posts })
    } catch (erro) {
        res.send('Erro ao listar os posts: ' + erro)
    }
})

// ATUALIZAR - EXIBIR DADOS PARA EDIÇÃO
app.get('/atualizar/:id', async function(req, res){
    try {
        const doc = await db.collection('posts').doc(req.params.id).get()
        if (!doc.exists) {
            return res.send('Post não encontrado!')
        }
        res.render('atualizar', { post: { id: doc.id, ...doc.data() } })
    } catch (erro) {
        res.send('Erro ao buscar o post: ' + erro)
    }
})

// ATUALIZAR - SALVAR ALTERAÇÕES
app.post('/atualizar/:id', async function(req, res){
    try {
        await db.collection('posts').doc(req.params.id).update({
            nome: req.body.nome,
            telefone: req.body.telefone,
            origem: req.body.origem,
            data_contato: req.body.data_contato,
            observacao: req.body.observacao
        })
        res.redirect('/consulta')
    } catch (erro) {
        res.send('Erro ao atualizar o post: ' + erro)
    }
})

// EXCLUIR
app.get('/excluir/:id', async function(req, res){
    try {
        await db.collection('posts').doc(req.params.id).delete()
        res.redirect('/consulta')
    } catch (erro) {
        res.send('Erro ao excluir o post: ' + erro)
    }
})

app.listen(8081, function () {
    console.log('Servidor Ativo!')
})
