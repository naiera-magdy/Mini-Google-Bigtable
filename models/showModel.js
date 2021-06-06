const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  title: {
    type: String,
    requried: [true, 'title must be provided'],
    unique: [true, 'title must be unique']
  },
  show_id: String,
  type: String,
  director: String,
  cast: String,
  country: String,
  date_added: String,
  release_year: String,
  rating: String,
  duration: String,
  listed_in: String,
  description: String
});

const Show = mongoose.model('Show', showSchema);
module.exports = Show;
