const { getAllTopics, postNewTopic } = require('../controller/controller');

const topicRouter = require('express').Router();

topicRouter
  .route('')
  .get(getAllTopics)
  .post(postNewTopic)

module.exports = topicRouter;