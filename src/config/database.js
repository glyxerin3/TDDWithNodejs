const Sequelize = require('sequelize');

const sequelize = new Sequelize("hoaxify", "my-db-user", "db-pass", {
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false,
  journal: false
});

//sequelize.query("PRAGMA journal_mode=OFF;");

sequelize.afterConnect(async (connection, config) => {
  console.log('HOOK CALLED');
  connection.query('PRAGMA journal_mode=WAL;');
});

module.exports = sequelize;
