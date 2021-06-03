const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Show = require('./../models/showModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'))
  .catch(err => console.log(err));

// READ JSON FILE
const shows = [];

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    fs.createReadStream('./dev-data/netflix_titles.csv')
      .pipe(csv())
      .on('data', row => {
        shows.push(row);
      })
      .on('end', async () => {
        console.log('CSV file successfully processed');
        await Show.create(shows);
        console.log('Data successfully loaded!');
        process.exit();
      });
  } catch (err) {
    console.log(err);
  }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Show.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
