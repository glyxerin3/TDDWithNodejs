const app = require('./src/app');
const sequelize = require('./src/config/database');
require('dotenv').config();
const {connect, disconnect} = require('./src/utils/Mongoose');

sequelize.sync();

const db = async () => {
  try {
    const success = await connect(process.env.MONGODB_DEVELOPMENT_DATABASE_URL);
    console.log('MONGODB Connected');
  } catch (error) {
    console.log('DB Coonncetion Error', error);
  }
};

// execute database connection
db();

app.listen(process.env.PORT, () => {
  console.log('app is running');
});
