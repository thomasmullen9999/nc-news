const {
  selectAllTopics,
  selectAllEndpoints,
  selectArticleById, 
  selectAllArticles
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