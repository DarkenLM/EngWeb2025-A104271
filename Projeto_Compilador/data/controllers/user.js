const User = require("../models/user");

//region ----- Read (Retrieve) -----
module.exports.findAllUsers = async () => {
    return User.find().exec();
}

module.exports.findAllUsersSpec = async () => {
    return User.find({}, {_id: 1, username: 1, fname: 1, lname: 1, email: 1, type: 1}).exec();
}

module.exports.findByUsername = async (username) => {
    return User.findOne({ username }).exec();
}

module.exports.findByEmail = async (email) => {
    return User.findOne({ email }).exec();
}

module.exports.findAllProdutores = async () => {
    return User.find({ type: "produtor" }).exec()
}
//endregion ----- Read (Retrieve) -----

//region ----- Update (Put) -----
module.exports.findByUsernameAndUpdate = async (username, user) => {
    return User.findOneAndUpdate(
        { username },    
        { $set: user },   
        { new: true }       
    ).exec();
}

module.exports.findByUsernameAndUpdateAvatar = async (username, checksum) => {
    return User.findOneAndUpdate(
        { username },
        { $set: { avatar: checksum } },
        { new: true }
    ).exec();
};
//endregion ----- Update (Put) -----

async function _existsByUsername(id) {
    const user = await User.findOne({username: id}).exec();
    return !!user;
}

module.exports.save = async (user) => {
    if (!_existsByUsername(user.username)) {
        const newUser = new User(user);
        return newUser.exec();
    } else {
        console.log(`User ${user} already exists.`);
        return;
        // error, user already exists
    }
}

module.exports.delete = async (id) => {
    return User.findByIdAndDelete(id).exec();
}