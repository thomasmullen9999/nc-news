const {
  selectAllTopics
} = require("../model/model.js");

exports.getAllTopics = (req, res, next) => {
  selectAllTopics().then((topics) => {
    res.status(200).send(topics.rows);
  })
  .catch(next);
}