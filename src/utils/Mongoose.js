const mongoose = require('mongoose');

exports.connect = (url) => mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

exports.disconnect = () => mongoose.connection.close();
