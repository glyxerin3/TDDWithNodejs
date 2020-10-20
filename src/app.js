const express = require('express');
const UserRouter = require('./user/UserRouter');

const app = express();

app.use(express.json());

app.use(UserRouter);

const config = require('config');

console.log(config)

console.log('env: ' + process.env.NODE_ENV);

module.exports = app;
