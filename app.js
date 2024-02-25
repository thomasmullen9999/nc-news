const express = require('express')
const app = express()
const apiRouter = require('./routes/api-router.js');

app.use(express.json())

app.use('/api', apiRouter);

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
  else if (err.code === '23505') {
    res.status(400).send({ msg: 'Bad request (duplicate key)' });
  } 
  else {
    res.status(500).send({ msg: 'Internal Server Error' });
  }
})

module.exports = { app }