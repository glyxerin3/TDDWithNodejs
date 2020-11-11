const bcrypt = require('bcrypt');
const crypto = require('crypto');
// Sequelize
const User = require('./User');

// MongoDB
const UserModel = require('../model/user.model');

const generateToken = (length) => {
  const token = crypto.randomBytes(length).toString('hex').substring(0, length);
  return token;
};

const save = async (body) => {
  const {username, email, password} = body;

  const hash = await bcrypt.hash(password, 10);

  // const user = {...req.body, password: hash};
  // const user  = Object.assign({},
  //   {username: username, email: email, actvationToken: generateToken(16)},
  //   {password: hash});
  const user = {
    username: username,
    email: email,
    activationToken: generateToken(16),
    password: hash
  };
  await User.create(user);
};

const findByEmail = async (email) => {
  return await User.findOne({ where: { email: email } });
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

const findByEmailMongoDB = async (email) => {
  return await UserModel.findOne( { email: email });
};

module.exports = {save, findByEmail, saveMongoDB, findByEmailMongoDB};
