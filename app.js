const express = require('express')
const app = express()
const { getAllTopics } = require('./controller/controller.js')

const topicsRegex = new RegExp(/\/api\/topics.*/g)

app.use(express.json())

app.get(`/api/topics`, getAllTopics)

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({msg: err.msg})
  }
})

module.exports = { app }