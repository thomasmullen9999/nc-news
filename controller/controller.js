const {
  selectAllTopics,
  selectAllArticles,
  selectAllUsers,
  selectAllEndpoints,
  selectArticleById, 
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
  const { topic, order, sort_by } = req.query;
  selectAllArticles(topic, order, sort_by).then((articles) => {
    res.status(200).send({ articles })
  })
  .catch(next)
}

exports.getAllUsers = (req, res, next) => {
  selectAllUsers().then((users) => {
    res.status(200).send({ users })
  })
  .catch(next)
}

exports.getArticleById = (req, res, next) => {
  const articleId = req.params.article_id;
  selectArticleById(articleId).then((article) => {
    res.status(200).send({ article });
  })
  .catch((err) => {
    next(err)
  })
}

exports.getCommentsByArticleId = (req, res, next) => {
  const articleId = req.params.article_id;
  selectCommentsByArticleId(articleId).then((comments) => {
    res.status(200).send( {comments} )
  })
  .catch((err) => {
    next(err)
  })
}

exports.postCommentByArticleId = (req, res, next) => {
  const articleId = req.params.article_id;
  insertCommentByArticleId(articleId, req.body).then((comment) => {
    res.status(201).send( {comment} )
  })
  .catch((err) => {
    next(err)
  })
}

exports.patchArticleById = (req, res, next) => {
  const articleId = req.params.article_id;
  const { inc_votes } = req.body;
  updateArticleById(articleId, inc_votes).then((article) => {
    res.status(200).send( {article} )
  })
  .catch((err) => {
    next(err)
  })
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