const express = require('express');
const User = require('./user/User');
const bcrypt = require('bcrypt');

// MongoDB
const UserModel = require('./model/user.model');

require('dotenv').config();

const app = express();

app.use(express.json());

app.post('/api/1.0/users', (req, res) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {

    // const user = {...req.body, password: hash};
    const user  = Object.assign({}, req.body, {password: hash});
    // const user = {
    //   username: req.body.username,
    //   email: req.body.email,
    //   password: hash
    // };

    User.create(user).then(() => {
      return res.send(
        {
          message: 'User created'
        }
      );
    });
  });
});

app.post('/api/1.0/mongodb/users', (req, res) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: hash
    };

    UserModel.create(user).then((response) => {
      return res.send(
        {
          message: 'User created'
        }
      );
    });
  });

});

module.exports = app;
