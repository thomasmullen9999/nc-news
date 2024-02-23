const { getAllEndpoints } = require('../controller/controller');

const apiRouter = require('express').Router()
const userRouter = require('./users-router.js');
const topicRouter = require('./topics-router.js')
const articleRouter = require('./articles-router.js')
const commentRouter = require('./comments-router.js')

apiRouter.use('/topics', topicRouter)

apiRouter.use('/users', userRouter);

apiRouter.use('/articles', articleRouter);

apiRouter.use('/comments', commentRouter);

apiRouter.get('', getAllEndpoints)

module.exports = apiRouter;