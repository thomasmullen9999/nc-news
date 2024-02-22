const db = require ('../db/connection.js')
const fs = require("fs/promises");

function getListOfTopics() {
  return db.query(`SELECT slug FROM topics;`)
  .then((result) => {
    const topics = result.rows.map((row) => row.slug)
    return topics
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

exports.selectAllUsers = async () => {
  try {
    return db.query(`SELECT * FROM users;`)
    .then((users) => {
      return users.rows
    })
  } 
  catch(err) {
    return err
  }
}

exports.selectAllArticles = async (topic) => {
  const queryStr = 
  `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
  COUNT(comments.body) AS comment_count 
  FROM articles 
  LEFT OUTER JOIN comments 
  ON articles.article_id = comments.article_id` 
  const queryStr2 =
  `GROUP BY articles.article_id 
  ORDER BY created_at DESC;`
  let topicStr = ''

  // if the topic is not in the database
  const topics = await getListOfTopics()
  if (topic) {
    console.log(topics, 'topics')
    console.log(topic, 'topic')
    if (!topics.includes(topic)) {
      return Promise.reject({status: 404, msg: 'Not found'})
    }
    topicStr += `WHERE articles.topic = '${topic}'`;
  }
  console.log(`${queryStr} ${topicStr} ${queryStr2}`, '<<<< string')



  // return db.query(`$1 $2 $3`, [queryStr, topicStr, queryStr2])
  return db.query(`${queryStr} ${topicStr} ${queryStr2}`)
  .then((articles) => {
    return articles.rows
  })
  .catch((err) => {
    console.log(err)
  })
}

exports.selectArticleById = async (articleId) => {
  return db.query(
    `SELECT * FROM articles 
    WHERE article_id = $1;`, [articleId])
  .then((article) => {
    if (article.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found" })
    }
    return article.rows[0]
  })
}

exports.selectCommentsByArticleId = (articleId) => {
  return db.query(
    `SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;`, [articleId])
  .then((comments) => {
    if (comments.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found" })
    }
    return comments.rows
  })
}

exports.insertCommentByArticleId = (articleId, newComment) => {
  const { username, body } = newComment;
  if (!username || !body) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  return db.query(
    `INSERT INTO comments 
      (author, body, article_id)
    VALUES
      ($1, $2, $3)
    RETURNING *;`, 
    [username, body, articleId])
    .then((comment) => {
      return comment.rows[0]
    })
}

exports.updateArticleById = (articleId, inc_votes) => {
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

exports.removeCommentById = (commentId) => {
  return db.query(
    `DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *;`, 
    [commentId])
    .then((comment) => {
      if (comment.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" })
      }
    })
}