const { deleteCommentById, patchCommentById } = require('../controller/controller');

const commentRouter = require('express').Router();

commentRouter
  .route('/:comment_id')
  .delete(deleteCommentById)
  .patch(patchCommentById)

module.exports = commentRouter;