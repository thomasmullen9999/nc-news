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
    return db.query(`SELECT * FROM topics;`);
  } 
  catch(err) {
    return err
  }
}