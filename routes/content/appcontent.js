var log = require('log4js').getLogger('contentroute');

module.exports = function(router) {
    /* GET home page. */
    router.get('/', function(req, res) {
	log.trace('%s %s route handler for User %s', req.method, req.url, req.user);    
	res.render('index.ejs', { title: 'Express', user: req.user, password: req.password, cookieAge: req.session.cookie.maxAge });
    });
};

