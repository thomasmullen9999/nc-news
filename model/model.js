const db = require ('../db/connection.js')
const fs = require("fs/promises");

function getCommentCount(articleId) {
  return new Promise((resolve, reject) => {
    return db.query(`
    SELECT COUNT(*)
    FROM comments
    WHERE article_id = $1;`, [articleId])
      .then((result) => {
        resolve(result.rows[0].count)
      })
      .catch((err) => {
        next(err)
      })
  })
}

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
  return db.query(`SELECT * FROM articles ORDER BY created_at DESC;`)
  .then((articles) => {
    return Promise.all(articles.rows.map((row) => {
      return new Promise((resolve, reject) => {
        getCommentCount(row.article_id)
          .then((commentCount) => {
            row.comment_count = Number(commentCount);
            delete row.body;
            resolve(row);
          })
      })
    }))
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