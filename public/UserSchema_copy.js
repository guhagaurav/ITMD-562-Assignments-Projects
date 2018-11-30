
    'use strict';
    var mongoose = require('mongoose');
    var UserSchema = new mongoose.Schema({
      inputEmail: { type: String, required: true, index: { unique: true } },
      inputPassword: { type: String, required: true }
      //inputName: { type: String, required: true }
    });
  module.exports = mongoose.model('UserSchema', UserSchema);


  