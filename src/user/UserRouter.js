const express = require('express');
const UserService = require('./UserService');
require('dotenv').config();
const router = express.Router();
const { check, validationResult } = require('express-validator');
const i18next = require('i18next');

router.post('/api/1.0/users',
  check('username')
    .notEmpty().withMessage('username_null').bail()
    .isLength({ min: 4, max: 32 }).withMessage('username_size'),
  check('email')
    .notEmpty().withMessage('email_null').bail()
    .isEmail().withMessage(`email_invalid`).bail()
    .custom(async (email) => {
      const user = await UserService.findByEmail(email);
      if (user) {
        throw new Error('email_inuse');
      }
    }),
  check('password')
    .notEmpty().withMessage('password_null').bail()
    .isLength({ min: 6 }).withMessage('password_size').bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage(`password_pattern`),
  async (req, res) => {

    const errors = validationResult(req);

    console.log(errors);
    if (!errors.isEmpty()) {
      const validationErrors = {};

      errors.array().forEach(error => validationErrors[error.param] = req.t(error.msg));
      return res.status(400).send({ validationErrors });
    }

    await UserService.save(req.body);

    return res.send(
      {
        message: req.t('user_create_success')
      }
    );

  });

router.post('/api/1.0/mongodb/users',
  check('username')
    .notEmpty().withMessage('Username cannot be null').bail()
    .isLength({ min: 4, max: 32 }).withMessage('Must have min 4 and max 32 characters'),
  check('email')
    .notEmpty().withMessage('Email cannot be null').bail()
    .isEmail().withMessage('Email is not valid').bail()
    .custom(async (email) => {
      const user = await UserService.findByEmailMongoDB(email);
      if (user) {
        throw new Error('E-mail in use');
      }
    }),
  check('password')
    .notEmpty().withMessage('Password cannot be null').bail()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters').bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/).withMessage('Password must have at least 1 uppercase, 1 lowercase letter and 1 number'),
  async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach(error => validationErrors[error.param] = error.msg);
      return res.status(400).send({ validationErrors });
    }

    try {
      await UserService.saveMongoDB(req.body);

      return res.send(
        {
          message: 'User created'
        }
      );
    } catch (err) {
      return res.status(400).send({ validationErrors: { email: 'E-mail in use' } });
    }
  });

module.exports = router;
