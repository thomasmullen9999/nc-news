const db = require ('../db/connection.js')

exports.selectAllTopics = async () => {
  try {

    /* if (!colours.includes(colour)) {
      return Promise.reject({status: 404, msg: 'Not found'})
    } */
    return db.query(`SELECT * FROM topics;`);
  } 
  catch(err) {
    return err
  }
}