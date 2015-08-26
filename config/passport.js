var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy
var TwitterStrategy = require('passport-twitter').Strategy
var GoogleStrategy = require('passport-google').Strategy
var JwtStrategy = require('passport-jwt').Strategy;
var UserProfile = require('../models/userprofile');
var config = require('./env/app.json');
var log = require('log4js').getLogger('passport');

// session serialization
passport.serializeUser(function(user, next) {
    log.trace('serializeUser %s', user);
    // convert user object to session-storing id
    next(null, user._id);
});

passport.deserializeUser(function(id, next) {
    log.trace('deserializeUser %s', id);
    // convert session-stored id into user object
    UserProfile.findById(id, function(err, user) {
	log.debug('ID:%s equates to User:%s', id, user);
	next(err, user);
    });
});

// Strategies:
// Local Strategy
var localOpts = {};
localOpts.usernameField =  config.passport.local.usernameField;
localOpts.passwordField = config.passport.local.passwordField;
localOpts.session = config.passport.local.session;
localOpts.passReqToCallback = true;

var localLoginStrategy = new LocalStrategy(localOpts, function(req, username, password, next) {
    log.trace('LocalStrategy Login callback for User:%s Passwd:%s', username, password);
    process.nextTick(function() {
	UserProfile.findOne({'local.username': username}, function(err, user) {
	    // if error return to middleware
	    if(err) return next(err);
	    // if no user indicate false to local strategy
	    if(!user) return next(null, false, req.flash('loginMessage', 'No User Found'));
	    // A matched user
	    user.comparePassword(password, function(err, isMatch) {
		if(err) next(err);		
		if(isMatch) {
		    return next(null, user);
		} else {
		    return next(null, false, req.flash('loginMessage', 'Invalid Password'));
		}
	    });
	});
    });
});

var localSignUpStrategy = new LocalStrategy(localOpts, function(req, username, password, next) {
    log.trace('LocalStrategy SignUp callback for User:%s Password:%s', username, password);
    // async: needed to make User.findOne fire
    process.nextTick(function() {
	UserProfile.findOne({'local.username': username}, function(err, user) {
	    // if error return to middleware
	    if(err) {
		log.debug('Error %s', err.message);
		return next(err);
	    }
	    // username exists so indicate false to local strategy
	    if(user) {
		log.debug('User %s exists in datastore', username);
		return next(null, false, req.flash('signupMessage', 'User name not available'));
	    }
	    if(!req.user) {
		// User not logged in
		var newUser = new UserProfile();
		newUser.local.username = username;
		newUser.local.password = newUser.hashPassword(password);
		newUser.save(newUser, function(err) {
		    if(err) return next(err);
		    log.debug('Creating New User %s', username);		    
		    next(null, newUser)
		});
	    } else {
		// Update existing user
		// ********* needs review
		var user = req.user;
		user.local.username = username;
		user.local.password = user.hashPassword(password);
		user.save(user, function(err) {
		    if(err) return next(err);
		    log.debug('Updating User %s', username);		    
		    next(null, user)		    
		});
	    }
	});
    });
});

// Token Strategy
var tokenOpts = {};
tokenOpts.secretOrKey = config.passport.token.secretOrKey;
tokenOpts.issuer = config.passport.token.issuer;
tokenOpts.audience = config.passport.token.audience;
//tokenOpts.passReqToCallback = config.passport.token.passReqToCallback;
tokenOpts.passReqToCallback = true;
var tokenStrategy = new JwtStrategy(tokenOpts, function(req, payload, next) { 
    log.trace('JwtStrategy callback for payload ' + payload); 
    process.nextTick(function() {	
	UserProfile.findOne({'local.username': payload.user.username}, function(err, user) {
            if (err) return next(err);
            if (user) {
		next(null, user);
            } else {
		next(null, false);
		// or you could create a new account
            }
	});
    });
});

//Facebook Strategy
var facebookOpts = {};
facebookOpts.clientID = config.passport.facebook.clientId;
facebookOpts.clientSecret = config.passport.facebook.clientSecret;
facebookOpts.callbackURL = config.passport.facebook.callbackURL;
facebookOpts.passReqToCallback = true;
var facebookStrategy = new FacebookStrategy(facebookOpts, function(req, accessToken, refreshToken, profile, next) {
    log.trace('FacebookStrategy callback %s %s', accessToken, profile.toString());
    process.nextTick(function() {
	if(!req.user) {
	    // User not logged in
	    UserProfile.findOne({'facebook.id': profile.id}, function(err, user) {
		if(err) return next(err);
		if(user) {
		    if (!user.facebook.token) {
			// Token invalidated but user exists so refresh details
			user.facebook.token = accessToken;
			user.facebook.displayName = profile.displayName;
			user.facebook.email = profile.emails[0].value;		   
			user.save(function(err) {
			    if(err)
				return next(err);
			});
		    }
		    // user was found, allow access
		    next(null, user);
		} else {
		    // user not found, save and allow access
		    var newUser = new UserProfile();
		    newUser.facebook.id = profile.id;
		    newUser.facebook.displayName = profile.displayName;
		    newUser.facebook.token = accessToken;
		    newUser.facebook.email = profile.emails[0].value;		    
		    newUser.save(function(err) {
			if(err) return next(err);
			log.debug('Creating New User %s', newUser.facebook.displayName);
			next(null, newUser)
		    });
		}	    	
	    });
	} else {
	    // User logged in but update Social details
	    var user = req.user;
	    user.facebook.id = profile.id;
            user.facebook.token = accessToken;
            user.facebook.displayName = profile.displayName;
            user.facebook.email = profile.emails[0].value;
            user.save(function(err) {
                if(err)
                    return next(err);
		// user socials were updated, allow access
                next(null, user);		
            });
	}
    });
});

//Google Strategy
var googleOpts = {};
googleOpts.clientID = config.passport.google.clientId;
googleOpts.clientSecret = config.passport.google.clientSecret;
googleOpts.callbackURL = config.passport.google.callbackURL;
googleOpts.passReqToCallback = true;
/*
var googleStrategy = new GoogleStrategy(googleOpts, function(req, token, refreshToken, profile, next) {
    log.trace('GoogleStrategy callback %s %s', token, profile.toString());
    process.nextTick(function() {
	if(!req.user) {
	    // User not logged in
	    UserProfile.findOne({'google.id': profile.id}, function(err, user) {
		if(err) return next(err);
		if(user) {
		    if (!user.google.token) {
			// Token invalidated but user exists so refresh details
			user.google.token = token;
			user.google.displayName = profile.displayName;
			user.google.email = profile.emails[0].value;		   
			user.save(function(err) {
			    if(err)
				return next(err);
			});
		    }
		    // user was found, allow access
		    next(null, user);
		} else {
		    // user not found, save and allow access
		    var newUser = new UserProfile();
		    newUser.google.id = profile.id;
		    newUser.google.displayName = profile.displayName;
		    newUser.google.token = token;
		    newUser.google.email = profile.emails[0].value;		    
		    newUser.save(function(err) {
			if(err) return next(err);
			log.debug('Creating New User %s', newUser.facebook.displayName);
			next(null, newUser)
		    });
		}	    	
	    });
	} else {
	    // User logged but update Social details
	    var user = req.user;
	    user.google.id = profile.id;
            user.google.token = token;
            user.google.displayName = profile.displayName;
            user.google.email = profile.emails[0].value;
            user.save(function(err) {
                if(err)
                    return next(err);
		// user socials were updated, allow access
                next(null, user);		
            });
	}
    });
});
*/

//Twitter Strategy
var twitterOpts = {};
twitterOpts.consumerKey = config.passport.twitter.consumerKey;
twitterOpts.consumerSecret = config.passport.twitter.consumerSecret;
twitterOpts.callbackURL = config.passport.twitter.callbackURL;
twitterOpts.passReqToCallback = true;
var twitterStrategy = new TwitterStrategy(twitterOpts, function(req, accessToken, tokenSecret, profile, next) {
    log.trace('TwitterStrategy callback %s %s', accessToken, profile.toString());
    process.nextTick(function() {
	if(!req.user) {
	    // User not logged in
	    UserProfile.findOne({'twitter.id': profile.id}, function(err, user) {
		if(err) return next(err);
		console.log('Profile: ' + profile.toString());
		if(user) {
		    if (!user.twitter.token) {
			// Token invalidated but user exists so refresh details
			user.twitter.token = accessToken;
			user.twitter.displayName = profile.displayName;
			user.save(function(err) {
			    if(err)
				return next(err);
			});
		    }
		    // user was found, allow access
		    next(null, user);
		} else {
		    // user not found, save and allow access
		    var newUser = new UserProfile();
		    newUser.twitter.id = profile.id;
		    newUser.twitter.displayName = profile.displayName;
		    newUser.twitter.token = accessToken;
		    newUser.save(function(err) {
			if(err) return next(err);
			log.debug('Creating New User %s', newUser.twitter.displayName);
			next(null, newUser)
		    });
		}	    
	    });
	} else {
	    // User logged but update Social details
	    var user = req.user;
	    user.twitter.id = profile.id;
            user.twitter.token = accessToken;
            user.twitter.displayName = profile.displayName;
            user.save(function(err) {
                if(err)
                    return next(err);
		// user socials were updated, allow access
                next(null, user);		
            });
	}
    });
});

// Register Strategies with Passport
passport.use('local-signup', localSignUpStrategy);
passport.use('local-login', localLoginStrategy);
passport.use('token', tokenStrategy);
passport.use('facebook', facebookStrategy);
passport.use('twitter', twitterStrategy);
log.info('Passport Initialised');
