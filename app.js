const express = require('express')
const app = express()
const { getAllTopics, getAllEndpoints, getArticleById, getAllArticles, getCommentsByArticleId, postCommentByArticleId } = require('./controller/controller.js')

app.use(express.json())

app.get('/api', getAllEndpoints)

app.get('/api/topics', getAllTopics)

app.get('/api/articles', getAllArticles)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles/:article_id/comments', getCommentsByArticleId)

app.post('/api/articles/:article_id/comments', postCommentByArticleId)

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({msg: err.msg})
  }
})

module.exports = { app }