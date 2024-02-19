const {
  selectAllTopics,
  selectAllEndpoints
} = require("../model/model.js");

exports.getAllEndpoints = (req, res, next) => {
  selectAllEndpoints().then((endpoints) => {
    res.status(200).send(endpoints);
  })
}

exports.getAllTopics = (req, res, next) => {
  selectAllTopics().then((topics) => {
    res.status(200).send(topics.rows);
  })
  .catch(next);
}