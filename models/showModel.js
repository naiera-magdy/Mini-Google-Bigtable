const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  show_id: {
    type: Number,
    required: [true, `The show must have id`],
    unique: [true, 'The show id must be unique']
  },
  type: String,
  title: String,
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
