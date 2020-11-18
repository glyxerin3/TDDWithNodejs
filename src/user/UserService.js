const bcrypt = require('bcrypt');
const crypto = require('crypto');
const EmailService = require('../email/EmailService');
const EmailException = require('../email/EmailException');

// Sequelize
const User = require('./User');
const sequelize = require('../config/database');

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
  const transaction = await sequelize.transaction();

  await User.create(user);

  try {
    await EmailService.sendAcoountActivation(email, user.activationToken);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw new EmailException();
  }
};

const findByEmail = async (email) => {
  return await User.findOne({ where: { email: email } });
};

const saveMongoDB = async (body) => {
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

  await UserModel.create(user);

  await EmailService.sendAcoountActivation(email, user.activationToken);
};

const findByEmailMongoDB = async (email) => {
  return await UserModel.findOne( { email: email });
};

module.exports = {save, findByEmail, saveMongoDB, findByEmailMongoDB};
