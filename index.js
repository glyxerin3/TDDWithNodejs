const app = require('./src/app');
const sequelize = require('./src/config/database');
const mongodb = require('./src/config/databaseMongoDB');
require('dotenv').config();

sequelize.sync({force: true});

mongodb();

app.listen(process.env.PORT, () => {
  console.log('app is running');
});
