var jwt = require('jsonwebtoken');
var log = require('log4js').getLogger('authroute');
var config = require('../../config/env/app.json');

module.exports = function(router, passport) {
    // Local Strategy Routes
    // Login Routes
    router.get('/login', function(req, res) {
	log.trace('%s %s route handler', req.method, req.url);
	res.render('login.ejs', {message: req.flash('loginMessage')});
    });

    router.post('/login', function(req, res, next) {
	log.trace('%s %s route handler', req.method, req.url);    
	passport.authenticate('local-login', function(err, user, info) {
	    log.trace('passport.authenticate callback for user %s', user);
	    // If error pass back to middleware
	    if(err) return next(err);
	    // If no user redirect to login
	    if(!user) return res.redirect('/auth/login');

	    // user successfully authenticated
	    req.login(user, function(err) {
		log.trace('req.login callback');
		// Any errors pass back to middleware
		if(err) return next(err);
		// user has logged in
		return res.redirect('/content/profile');
	    });
	})(req, res, next);
    });

    // Signup Routes
    router.get('/signup', function(req, res) {
	log.trace('%s %s route handler', req.method, req.url);
	res.render('signup.ejs', {message: req.flash('signupMessage')});
    });

    router.post('/signup', function(req, res, next) {
	log.trace('%s %s route handler', req.method, req.url);    
	passport.authenticate('local-signup', function(err, user, info) {
	    log.trace('local-signup passport.authenticate callback for User:%s Info:%s', user, info);
	    // If error pass back to middleware
	    if(err) return next(err);

	    // If no user redirect to login
	    if(!user) return res.redirect('/auth/signup');

	    // user successfully authenticated
	    req.login(user, function(err) {
		// Any errors pass back to middleware
		if(err) return next(err);
		// user has logged in
		return res.redirect('/content/profile');
	    });
	})(req, res, next);
    });

    // Local Connect and Unlink Routes
    router.get('/connect/local', function(req, res) {
	res.render('connect-local.ejs', {message: req.flash('signupMessage')});
    });

    
    router.post('/connect/local', passport.authenticate('local-signup', {
	successRedirect : '/content/profile', 
	failureRedirect: '/auth/connect/local', 
	failureFlash : true
    }));


    router.post('/connect/locals', function(req, res, next) {
	log.trace('%s %s route handler', req.method, req.url);    
	passport.authenticate('local-signup', function(err, user, info) {
	    log.trace('local-signup passport.authenticate callback for User:%s Info:%s', user, info);
	    // If error pass back to middleware
	    if(err) return next(err);

	    // If no user redirect to login
	    if(!user) return res.redirect('/auth/signup');

	    // user successfully authenticated
	    req.login(user, function(err) {
		// Any errors pass back to middleware
		if(err) return next(err);
		// user has logged in
		return res.redirect('/content/profile');
	    });
	})(req, res, next);
    });

    router.get('/unlink/local', function(req, res) { 
	var user = req.user;
	if(user) {
	    user.local.username = null;
	    user.local.password = null;
	    user.save(function(err) {
		if(err)
		    throw err;
		res.redirect('/content/profile');
	    });
	} else{
	    req.logout();
	    res.redirect('/');
	}
    });

    // Facebook Routes
    router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));

    router.get('/facebook/callback', passport.authenticate('facebook', {failureRedirect: 'auth'}), function(req, res) {
	log.trace('%s %s route handler callback', req.method, req.url);
	// if authenticated, this route will fire
	res.redirect('/content/profile');
    });

    router.get('/connect/facebook', passport.authorize('facebook', {scope: ['email']}), function(req, res) {
	log.trace('Account: ' + req.account);
    });
    
    router.get('/unlink/facebook', function(req, res) {
	var user = req.user;
	if(user) {	    
	    user.facebook.token = null;
	    user.save(function(err) {
		if(err)
		    throw err;
		res.redirect('/content/profile');
	    });
	} else {
	    req.logout();
	    res.redirect('/');	    
	}
    });
	       
    // Google Routes
    router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

    router.get('/google/callback', passport.authenticate('google', {failureRedirect: 'auth'}), function(req, res) {
	log.trace('%s %s route handler callback', req.method, req.url);
	// if authenticated, this route will fire
	res.redirect('/content/profile');
    });

    router.get('/connect/google', passport.authorize('google', {scope: ['profile', 'email']}), function(req, res) {
	log.trace('Account: ' + req.account);
    });
    
    router.get('/unlink/google', function(req, res) {
	var user = req.user;
	if(user) {
	    user.twitter.token = null;
	    user.save(function(err) {
		if(err)
		    throw err;
		res.redirect('/content/profile');
	    });
	} else {
	    req.logout();
	    res.redirect('/');	    
	}
    });

    // Twitter Routes
    router.get('/twitter', passport.authenticate('twitter'));

    router.get('/twitter/callback', passport.authenticate('twitter', {failureRedirect: 'auth'}), function(req, res) {
	log.trace('%s %s route handler callback', req.method, req.url);
	// if authenticated, this route will fire
	res.redirect('/content/profile');
    });
    
    router.get('/connect/twitter', passport.authorize('twitter'), function(req, res) {
	log.trace('Account: ' + req.account);
    });
    
    router.get('/unlink/twitter', function(req, res) {
	if(user) {
	    var user = req.user;
	    user.twitter.token = null;
	    user.save(function(err) {
		if(err)
		    throw err;
		res.redirect('/content/profile');
	    });
	} else {
	    req.logout();
	    res.redirect('/');
	}
    });
	       
    // Logout
    router.get('/logout', function(req, res) {
	log.trace('%s %s route handler', req.method, req.url);    
	req.logout();
	res.redirect('/');
    });

    router.post('/token', function(req, res, next) {
	log.trace('%s %s route handler', req.method, req.url);    
	passport.authenticate('local-login', function(err, user, info) {
	    log.trace('passport.authenticate callback for user %s', user);
	    // If error pass back to middleware
	    if(err) return res.json({error: err.message});
	    // If no user indicate error
	    if(!user) return res.json({auth_error: 'No User'});

	    // user successfully authenticated
	    var token = jwt.sign({user: user.local.toJSON()}, 
				 config.express.jwttoken.secret, 
				 {
				     algorithm: config.express.jwttoken.algorithm , 
				     expiresInMinutes: config.express.jwttoken.expiresInMinutes, 
				     issuer: config.express.jwttoken.issuer, 
				     audience: config.express.jwttoken.audience, 
				     ignoreExpiration: false
				 });	  
	    res.json({success: 'Auth OK', token : token});
	})(req, res, next);
    });
};

