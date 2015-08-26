
var log = require('log4js').getLogger('apiroute');

module.exports = function(router, passport) {
    
    router.use(passport.authenticate('token', {session: false}));

    router.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
    });
    
    // Token Test Routes
    router.get('/sample', function(req, res) {
	log.trace('%s %s route handler', req.method, req.url);    
	var resp = {token : 'Get valid', date: Date.now()};
	res.json(resp);
    });

    // Token Test Routes
    router.post('/sample', function(req, res) {
	log.trace('%s %s route handler', req.method, req.url);    
	var resp = {token : 'Post valid', date: Date.now()};
	res.json(resp);
    });

};
