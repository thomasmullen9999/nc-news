const express = require('express')
const app = express()
const { 
  getAllTopics,
  getAllEndpoints, 
  getArticleById, 
  getAllArticles,
  getAllUsers,
  getCommentsByArticleId, 
  postCommentByArticleId, 
  patchArticleById,
  deleteCommentById
} = require('./controller/controller.js')

app.use(express.json())

app.get('/api', getAllEndpoints)

app.get('/api/topics', getAllTopics)

app.get('/api/articles', getAllArticles)

app.get('/api/users', getAllUsers)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles/:article_id/comments', getCommentsByArticleId)

app.post('/api/articles/:article_id/comments', postCommentByArticleId)

app.patch('/api/articles/:article_id', patchArticleById)

app.delete('/api/comments/:comment_id', deleteCommentById)

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  else if (err.code === '22P02') {
    res.status(400).send({ msg: 'Bad request' });
  } 
  else if (err.code === '23503') {
    res.status(404).send({ msg: 'Not found' });
  } 
  else {
    res.status(500).send({ msg: 'Internal Server Error' });
  }
})

module.exports = { app }