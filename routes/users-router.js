const { getAllUsers } = require('../controller/controller');

const userRouter = require('express').Router();

userRouter.get('', getAllUsers)

module.exports = userRouter;