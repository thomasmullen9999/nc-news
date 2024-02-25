const { getAllArticles, getArticleById, getCommentsByArticleId, postCommentByArticleId, patchArticleById, postNewArticle } = require('../controller/controller');

const articleRouter = require('express').Router();

articleRouter.get('', getAllArticles)

articleRouter.post('', postNewArticle)

articleRouter
  .route('/:article_id')
  .get(getArticleById)
  .patch(patchArticleById)

articleRouter
  .route('/:article_id/comments')
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId)

module.exports = articleRouter;