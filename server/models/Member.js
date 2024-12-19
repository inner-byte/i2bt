const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  uid: String,
  name: String,
  email: String,
  role: String,
  avatar: String,
  bio: String,
  skills: [String],
  projects: [{
    id: String,
    title: String,
    description: String,
    link: String
  }],
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String
  }
});

module.exports = mongoose.model('Member', memberSchema);