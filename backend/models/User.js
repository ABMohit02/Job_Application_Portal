const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'employer', 'admin'],
    default: 'user',
  },
  company: {
    type: String,
    required: function() {
      return this.role === 'employer';
    },
  },
  bio: String,
  avatar: String,
  skills: [String],
  resume: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
