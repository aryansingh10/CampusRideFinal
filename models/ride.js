const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Reference to the User model
  },
  source: String,        
  destination: String,   
  date: Date,           
  availableSeats: Number, 
  status:String

});

module.exports = mongoose.model('Ride', rideSchema);
