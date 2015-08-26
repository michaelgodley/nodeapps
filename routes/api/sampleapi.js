
var log = require('log4js').getLogger('apiroute');

module.exports = function(router) {
    
    // Token Test Routes
    router.get('/sampleapi', function(req, res) {
	log.trace('%s %s route handler', req.method, req.url);    
	var resp = {token : 'Get resp', date: Date.now()};
	res.json(resp);
    });

    // Token Test Routes
    router.post('/sampleapi', function(req, res) {
	log.trace('%s %s route handler', req.method, req.url);    
	var resp = {token : 'Post resp', date: Date.now(), body : req.body};
	res.json(resp);
    });

};
