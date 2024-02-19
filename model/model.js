const db = require ('../db/connection.js')
const fs = require("fs/promises");


function getListOfArticleIds() {
  return db.query(`SELECT DISTINCT article_id FROM articles;`)
  .then((result) => {
    const articleIdList = result.rows.map((row) => row.article_id)
    return articleIdList
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

exports.selectArticleById = async (articleId) => {
  articleId = Number(articleId)
  const articleIdList = await getListOfArticleIds()
  const regex = new RegExp(/[^\d]/g)
  if (regex.test(articleId)) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  if (!articleIdList.includes(articleId)) {
    return Promise.reject({status: 404, msg: 'Not found'})
  }
  return db.query(
    `SELECT * FROM articles 
    WHERE article_id = $1;`, [articleId])
  .then((article) => {
    return article.rows[0]
  })
}