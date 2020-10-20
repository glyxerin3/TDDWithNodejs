const express = require('express');
const UserService = require('./UserService');
require('dotenv').config();
const router = express.Router();

router.post('/api/1.0/users', async (req, res) => {
  await UserService.save(req.body);

  return res.send(
    {
      message: 'User created'
    }
  );
});





router.post('/api/1.0/mongodb/users', async (req, res) => {
  await UserService.saveMongoDB(req.body);

  return res.send(
    {
      message: 'User created'
    }
  );

});

module.exports = router;
