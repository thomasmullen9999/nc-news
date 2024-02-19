const db = require ('../db/connection.js')

exports.selectAllTopics = () => {
  try {
    return db.query(`SELECT * FROM topics;`);
  } 
  catch(err) {
    return err
  }
}