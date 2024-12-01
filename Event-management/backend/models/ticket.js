const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', 
    required: true,
  },
  
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
