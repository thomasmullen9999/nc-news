const {
  selectAllTopics,
  selectAllEndpoints,
  selectArticleById, 
  selectAllArticles,
  selectCommentsByArticleId,
  insertCommentByArticleId,
  updateArticleById,
  removeCommentById
} = require("../model/model.js");

exports.getAllEndpoints = (req, res, next) => {
  selectAllEndpoints().then((endpoints) => {
    res.status(200).send({ endpoints });
  })
}

exports.getAllTopics = (req, res, next) => {
  selectAllTopics().then((topics) => {
    res.status(200).send({ topics });
  })
  .catch(next);
}

exports.getAllArticles = (req, res, next) => {
  selectAllArticles().then((articles) => {
    res.status(200).send({ articles })
  })
  .catch(next)
}

exports.getArticleById = (req, res, next) => {
  const articleId = req.params.article_id;
  selectArticleById(articleId).then((article) => {
    res.status(200).send({ article });
  })
  .catch(next);
}

exports.getCommentsByArticleId = (req, res, next) => {
  const articleId = req.params.article_id;
  selectCommentsByArticleId(articleId).then((comments) => {
    res.status(200).send( {comments} )
  })
  .catch(next);
}

exports.postCommentByArticleId = (req, res, next) => {
  const articleId = req.params.article_id;
  insertCommentByArticleId(articleId, req.body).then((comment) => {
    res.status(201).send( {comment} )
  })
  .catch(next);
}

exports.patchArticleById = (req, res, next) => {
  const articleId = req.params.article_id;
  const { inc_votes } = req.body;
  updateArticleById(articleId, inc_votes).then((article) => {
    res.status(200).send( {article} )
  })
  .catch(next)
}

exports.deleteCommentById = (req, res, next) => {
  const commentId = req.params.comment_id;
  removeCommentById(commentId).then(() => {
    res.status(204).send({})
  })
  .catch((err) => {
    next(err)
  })
}