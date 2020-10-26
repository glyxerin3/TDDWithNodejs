const express = require('express');
const UserService = require('./UserService');
require('dotenv').config();
const router = express.Router();
const {check, validationResult} = require('express-validator');

router.post('/api/1.0/users',
  check('username')
    .notEmpty().withMessage('Username cannot be null').bail()
    .isLength({min: 4, max: 32}).withMessage('Must have min 4 and max 32 characters'),
  check('email').notEmpty().withMessage('Email cannot be null'),
  check('password').notEmpty().withMessage('Password cannot be null'),
  async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors = {};
    errors.array().forEach(error => validationErrors[error.param] = error.msg);
    return res.status(400).send({validationErrors});
  }

  await UserService.save(req.body);

  return res.send(
    {
      message: 'User created'
    }
  );
});

router.post('/api/1.0/mongodb/users',
  check('username')
    .notEmpty().withMessage('Username cannot be null').bail()
    .isLength({min: 4}).withMessage('Must have min 4 and max 32 characters'),
  check('email').notEmpty().withMessage('Email cannot be null'),
  check('password').notEmpty().withMessage('Password cannot be null'),
  async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach(error => validationErrors[error.param] = error.msg);
      return res.status(400).send({validationErrors});
    }

  await UserService.saveMongoDB(req.body);

  return res.send(
    {
      message: 'User created'
    }
  );

});

module.exports = router;
