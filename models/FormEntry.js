const mongoose = require('mongoose');

const formEntrySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
});

module.exports = mongoose.model('FormEntry', formEntrySchema);