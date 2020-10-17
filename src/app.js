const express = require('express');
const User = require('./user/User');

// MongoDB
const UserModel = require('./model/user.model');

require('dotenv').config();

const app = express();

app.use(express.json());

app.post('/api/1.0/users', (req, res) => {
  User.create(req.body).then(() => {
    return res.send(
      {
        message: 'User created'
      }
    );
  });
});

app.post('/api/1.0/mongodb/users', (req, res) => {
  UserModel.create(req.body).then((response) => {
    return res.send(
      {
        message: 'User created'
      }
    );
  });
});

module.exports = app;
