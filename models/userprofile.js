var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var log = require('log4js').getLogger('model');

var userSchema = mongoose.Schema({
    local : {
	username: String,
	email: String,
	password: {
	    type: String
	    // required: true,
	}
    },
    facebook : {
	id: String,
	token : String,
	email: String,
	displayName : String,
	username : String
    },
    twitter : {
	id: String,
	token: String,
	displayName: String,
	username: String
    },
    google : {
	id: String,
	token: String,
	email: String,
	name: String
    }
});

/*
userSchema.pre('save', function(next) {
    log.trace('userSchema.pre save');
    // Check if modified
    //if(!this.local.isModified('password')) {
    //	log.debug('Password Not Modified');
    //	return next();
    //}
    
    //init encryption
    var self = this;
    log.debug('Password: %s', self.local.password);
    bcrypt.genSalt(10, function(err, salt) {
	if(err) { 
	    log.debug('Error generating salt: %s', err.message);
	    return next(err);
	}
	// hash the password
	bcrypt.hash(self.local.password, salt, function(err, hash) {
	    if(err) {
		log.debug('Error hashing password: %s', err.message);
		return next(err);
	    }
	    log.debug('password: %s; hash: %s ', self.local.password, hash); 
	    //override cleartest with hash
	    self.local.password = hash;
	    next();
	});
    });
});
*/

userSchema.methods.hashPassword = function(password, next) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userSchema.methods.comparePassword = function(candidatePassword, next) {
    log.trace('userSchema.comparePassword %s', candidatePassword);
    // Compare user entered password with encrypted one
    bcrypt.compare(candidatePassword, this.local.password, function(err, isMatch) {
	if(err) return next(err);
	next(null, isMatch);
    });
};

userSchema.methods.createToken = function() {
    return jwt.sign({ user: this.toJSON()}, 'lazydog', {algorithm: 'HS256' , expiresInMinutes: 5, issuer: 'example.com', audience: 'example.com', ignoreExpiration: false})
};

var User = mongoose.model('userprofile', userSchema);
module.exports = User;
