require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ExpensesRouter = require('./routes/expenses');
const cors = require('cors'); 

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(cors(corsOptions));
app.use(express.json());

async function connectToDatabase() {
  try {
    const uri = `${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}`;
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB Atlas", err);
    process.exit(1);
  }
}

(async () => {
  await connectToDatabase();
  console.log('Database connection established');

  app.use('/expenses', ExpensesRouter);

  app.use(express.static(path.join(__dirname, '../myapp/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../myapp/dist', 'index.html'));
  });

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
})();
