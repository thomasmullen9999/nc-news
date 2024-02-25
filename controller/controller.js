const {
  selectAllTopics,
  selectAllArticles,
  selectAllUsers,
  selectAllEndpoints,
  selectArticleById, 
  selectCommentsByArticleId,
  insertCommentByArticleId,
  updateArticleById,
  removeCommentById,
  selectUserByUsername,
  updateCommentById,
  insertNewArticle
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
  .catch((err) => {
    next(err)
  })
}

exports.getAllArticles = (req, res, next) => {
  const { topic, order, sort_by, limit, p } = req.query;
  selectAllArticles(topic, order, sort_by, limit, p).then((result) => {
    res.status(200).send({ articles: result.articles, total_count: result.total_count })
  })
  .catch((err) => {
    next(err)
  })
}

exports.getAllUsers = (req, res, next) => {
  selectAllUsers().then((users) => {
    res.status(200).send({ users })
  })
  .catch((err) => {
    next(err)
  })
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
  const { limit, p } = req.query;
  selectCommentsByArticleId(articleId, limit, p).then((result) => {
    res.status(200).send( { comments: result.comments, total_count: result.total_count } )
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

exports.getUserByUsername = (req, res, next) => {
  const username = req.params.username;
  selectUserByUsername(username).then((user) => {
    res.status(200).send({ user });
  })
  .catch((err) => {
    next(err)
  })
}

exports.patchCommentById = (req, res, next) => {
  const commentId = req.params.comment_id;
  const { inc_votes } = req.body;
  updateCommentById(commentId, inc_votes).then((comment) => {
    res.status(200).send( {comment} )
  })
  .catch((err) => {
    next(err)
  })
}

exports.postNewArticle = (req, res, next) => {
  insertNewArticle(req.body).then((article) => {
    res.status(201).send( {article} )
  })
  .catch((err) => {
    next(err)
  })
}