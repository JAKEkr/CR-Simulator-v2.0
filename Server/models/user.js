"use strict";

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_WORK_FACTOR = 10;

// Define user schema
const UserSchema = mongoose.Schema({
        student_id: { type: Number, required: true, unique: true },
        password: { type: String, trim: true, required: true },
        name: { type: String, trim: true, required: true },
        phone: { type: String, trim: true, required: true, unique: true },
        email: { type: String, trim: true, required: true, unique: true }
});

// Create new user document
UserSchema.statics.create = function(payload) {
        // this === Model
        const user = new this(payload);
        // return Promise
        return user.save();
};

UserSchema.pre('save', function(next) {
        const user = this;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                if (err) return next(err);

                // hash the password using our new salt
                bcrypt.hash(user.password, salt, function(err, hash) {
                        if (err) return next(err);

                        // override the cleartext password with the hashed one
                        user.password = hash;
                        next();
                });
        });
});

UserSchema.methods.comparePassword = function(candidatePassword, callback) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
                if (err) return callback(err);
                callback(null, isMatch);
        });
};

// Create Model & Export
module.exports = mongoose.model('User', UserSchema);