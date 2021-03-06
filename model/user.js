var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/nodeauth', {useNewUrlParser: true});
var db = mongoose.connection;

var UserSchema = mongoose.Schema({
    name: {
        type: String,
        index: true
    },
    email: {
        type: String
    }, 
    username: {
        type: String
    },
    password: {
        type: String
    },
    profileImage: {
        type: String
    }

});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
    var query = {username : username};
    User.findOne(query, callback);
}

module.exports.checkEmail = function(email){
    var query = {email : email};
    User.findOne(query);
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        callback(null, isMatch);
    });
}

module.exports.createUser = function(newUser, callback){
        bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
    });
});
    
}
