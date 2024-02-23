const { getAllUsers, getUserByUsername } = require('../controller/controller');

const userRouter = require('express').Router();

userRouter.get('', getAllUsers)

userRouter.get('/:username', getUserByUsername)

module.exports = userRouter;