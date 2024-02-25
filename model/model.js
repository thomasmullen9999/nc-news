const db = require ('../db/connection.js')
const fs = require("fs/promises");

function getListOfTopics() {
  return db.query(`SELECT slug FROM topics;`)
  .then((result) => {
    const topics = result.rows.map((row) => row.slug)
    return topics
  })
}

function getListOfUsers() {
  return db.query(`SELECT username FROM users;`)
  .then((result) => {
    const users = result.rows.map((row) => row.username)
    return users
  })
}

function getNewestArticle() {
  return db.query(`
    SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, articles.body, COUNT(comments.body) AS comment_count 
    FROM articles 
    LEFT OUTER JOIN comments 
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id 
    ORDER BY articles.created_at DESC 
    LIMIT 1;
  `)
  .then((result) => {
    return result.rows[0]
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

exports.selectAllArticles = async (topic, order = 'desc', sortBy = 'created_at') => {
  const queryStr = 
  `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, 
  COUNT(comments.body) AS comment_count 
  FROM articles 
  LEFT OUTER JOIN comments 
  ON articles.article_id = comments.article_id` 
  const queryStr2 =
  `GROUP BY articles.article_id`

  let topicStr = ''
  const topics = await getListOfTopics()
  if (topic) {
    // if the topic is not in the topics table
    if (!topics.includes(topic)) {
      return Promise.reject({status: 404, msg: 'Not found'})
    }
    topicStr += `WHERE articles.topic = '${topic}'`;
  }

  const validSortBys = ['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count']
  if (!validSortBys.includes(sortBy)) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  if (!['asc', 'desc'].includes(order)) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  const orderStr = `ORDER BY ${sortBy} ${order.toUpperCase()};`

  return db.query(`${queryStr} ${topicStr} ${queryStr2} ${orderStr}`)
  .then((articles) => {
    if (articles.rows.length === 0 && topicStr) {
      return Promise.reject({ status: 404, msg: "No articles found with this topic" })
    }
    return articles.rows
  })
}

exports.selectArticleById = async (articleId) => {
  return db.query(
    `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, articles.body
    FROM articles 
    LEFT OUTER JOIN comments 
    ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1;`, [articleId])
  .then((article) => {
    if (article.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found" })
    }
    article.rows[0].comment_count = article.rowCount;
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

exports.selectUserByUsername = async (username) => {
  return db.query(
    `SELECT username, name, avatar_url
    FROM users
    WHERE username = $1;`, [username])
  .then((user) => {
    if (user.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found" })
    }
    return user.rows[0]
  })
}

exports.updateCommentById = (commentId, inc_votes) => {
  if (!inc_votes) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }
  return db.query(
    `UPDATE comments 
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *;`, 
    [inc_votes, commentId])
    .then((comment) => {
      if (comment.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" })
      }
      return comment.rows[0]
    })
}

exports.insertNewArticle = async (newArticle) => {
  const { author, title, body, topic, article_img_url } = newArticle;

  if (!author || !title || !body || !topic) {
    return Promise.reject({status: 400, msg: 'Bad request'})
  }

  // check that user exists in database
  const users = await getListOfUsers()
  if (!users.includes(author)) {
    return Promise.reject({status: 404, msg: 'Author not found'})
  }

  // check that topic exists in database
  const topics = await getListOfTopics()
  if (!topics.includes(topic)) {
    return Promise.reject({status: 404, msg: 'Topic not found'})
  }

  // if article_img_url is passed in, insert it. Otherwise, don't include it and let SQL add it as its default value
  if (article_img_url) {
    return db.query(
      `INSERT INTO articles 
        (author, title, body, topic, article_img_url)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING *;`, 
      [author, title, body, topic, article_img_url])
      .then((article) => {
        return article.rows[0]
      })
  }
  else {
    return db.query(
      `INSERT INTO articles 
        (author, title, body, topic)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *;`, 
      [author, title, body, topic])
      .then((article) => {
        return article.rows[0]
      })
  }
}