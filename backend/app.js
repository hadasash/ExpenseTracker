require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const ExpensesRouter = require('./routes/expenses');
const cors = require('cors'); 

const app = express();
app.use(cors()); 

const port = 3000;

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
  }
}
(async () => {
  await connectToDatabase();
  console.log('Database connection established');

  app.use(express.json());
  app.use('/expenses', ExpensesRouter);

  app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}); 
})();
