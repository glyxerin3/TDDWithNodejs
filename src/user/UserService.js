const bcrypt = require('bcrypt');

// Sequelize
const User = require('./User');

// MongoDB
const UserModel = require('../model/user.model');

const save = async (body) => {
  const hash = await bcrypt.hash(body.password, 10);

  // const user = {...req.body, password: hash};
  const user  = Object.assign({}, body, {password: hash});
  // const user = {
  //   username: req.body.username,
  //   email: req.body.email,
  //   password: hash
  // };
  await User.create(user);
};


const saveMongoDB = async (body) => {
  const hash = await bcrypt.hash(body.password, 10);

  const user = {
    username: body.username,
    email: body.email,
    password: hash
  };

  await UserModel.create(user);
};

module.exports = {save, saveMongoDB};
