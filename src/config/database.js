const Sequelize = require('sequelize');

// const config = require('config');
// const dbConfig = config.get('database');

let dbConfig;

if (process.env.NODE_ENV === 'development') {
  console.log('process.env.NODE_ENV === \'development\'');
  dbConfig = {
    "database": "hoaxify",
    "username": "my-db-user",
    "password": "db-pass",
    "dialect": "sqlite",
    "storage": "./database.sqlite",
    "logging": false
  }
}

if (process.env.NODE_ENV === 'test') {
  console.log('process.env.NODE_ENV === \'test\'');
  dbConfig = {
    "database": "hoaxify",
    "username": "my-db-user",
    "password": "db-pass",
    "dialect": "sqlite",
    "storage": ":memory:",
    "logging": false
  }
}

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  dialect: dbConfig.dialect,
  storage: dbConfig.storage,
  logging: dbConfig.logging
});

//sequelize.query("PRAGMA journal_mode=OFF;");

module.exports = sequelize;
