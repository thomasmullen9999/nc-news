const { getAllTopics } = require('../controller/controller');

const topicRouter = require('express').Router();

topicRouter.get('', getAllTopics)

module.exports = topicRouter;