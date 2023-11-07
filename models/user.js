const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String, 
  password: String, 
  email: String,    
  name: String,   

});

userSchema.plugin(passportLocalMongoose); // Adds username and password fields

module.exports = mongoose.model('User', userSchema);