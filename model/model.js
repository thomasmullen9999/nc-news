const db = require ('../db/connection.js')
const fs = require("fs/promises");

exports.selectAllEndpoints = () => {
  return fs.readFile(`${__dirname}/../endpoints.json`, 'utf-8')
  .then((endpointsFile, err) => {
    const parsedFile = JSON.parse(endpointsFile);
    return parsedFile;
  })
  .catch((err) => {
    return err
  })
}

exports.selectAllTopics = async () => {
  try {
    return db.query(`SELECT * FROM topics;`)
    .then((topics) => {
      return topics.rows
    })
  } 
  catch(err) {
    return err
  }
}

exports.selectAllArticles = async () => {
  return db.query(`SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.body) AS comment_count FROM articles JOIN comments ON articles.article_id = comments.article_id 
  GROUP BY articles.article_id
  ORDER BY created_at DESC;`)
  .then((articles) => {
    return articles.rows
  })
  .catch((err) => {
    console.log(err)
  })
}

exports.selectArticleById = async (articleId) => {
  const articleIdNum = Number(articleId)
  const regex = new RegExp(/[^\d]/g)
  if (regex.test(articleIdNum)) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  return db.query(
    `SELECT * FROM articles 
    WHERE article_id = $1;`, [articleIdNum])
  .then((article) => {
    if (article.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found" })
    }
    return article.rows[0]
  })
}

exports.selectCommentsByArticleId = (articleId) => {
  const articleIdNum = Number(articleId)
  const regex = new RegExp(/[^\d]/g)
  if (regex.test(articleIdNum)) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  return db.query(
    `SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;`, [articleIdNum])
  .then((comments) => {
    if (comments.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found" })
    }
    return comments.rows
  })
}

exports.insertCommentByArticleId = (articleId, newComment) => {
  const articleIdNum = Number(articleId)
  const regex = new RegExp(/[^\d]/g)
  if (regex.test(articleIdNum)) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  const { username, body } = newComment;
  if (!username || !body) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  // need to check if the article exists
  
  return db.query(
    `INSERT INTO comments 
      (author, body, article_id, votes)
    VALUES
      ($1, $2, $3, $4)
    RETURNING *;`, 
    [username, body, articleId, 0])
    .then((comment) => {
      return comment.rows[0]
    })
    .catch((err) => {
      next(err)
    })
}

exports.updateArticleById = (articleId, inc_votes) => {
  const articleIdNum = Number(articleId)
  const regex = new RegExp(/[^\d]/g)
  if (regex.test(articleIdNum)) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  if (!inc_votes) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  return db.query(
    `UPDATE articles 
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`, 
    [inc_votes, articleId])
    .then((article) => {
      if (article.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" })
      }
      return article.rows[0]
    })
}