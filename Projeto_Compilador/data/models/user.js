const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    fname: String,
    lname: String,
    email: String,
    avatar: String,
    password: String,
    type: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema);