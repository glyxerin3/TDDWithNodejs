const {connect, disconnect} = require('../utils/Mongoose');

const mongodb = async () => {
  try {
    const success = await connect(process.env.MONGODB_DEVELOPMENT_DATABASE_URL);
    console.log('MONGODB Connected');
  } catch (error) {
    console.log('DB Coonncetion Error', error);
  }
};

module.exports = mongodb;
