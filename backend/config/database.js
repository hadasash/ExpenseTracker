require('dotenv').config();

const dbConfig = {
  uri: `${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}`,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
};

module.exports = dbConfig;
