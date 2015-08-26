var log = require('log4js').getLogger('appcontentsecure');

module.exports = function(router) {
    // Check if session is authenticated 
    router.use(function(req, res, next) {
	log.trace('Authenticating Url:%s User:%s', req.url, req.user);
	if(req.isAuthenticated()) {
	    log.debug('User Authenticated %s', req.user);
	    return next();
	}
	log.debug('User not authenticated');
	res.redirect('/');
    });	

    // GET profile page
    router.get('/profile', function(req, res) {
	log.trace('%s %s route handler for User %s', req.method, req.url, req.user);    
	res.render('profile.ejs', { user: req.user });
    });

    // All other routes
    router.get('/*', function(req, res) {
	res.redirect('/content/profile');
    });
};

