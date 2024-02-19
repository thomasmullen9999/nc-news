const express = require('express')
const app = express()
const { getAllTopics } = require('./controller/controller.js')

app.use(express.json())

app.get('/api/topics', getAllTopics)

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({msg: err.msg})
  }
})

module.exports = { app }