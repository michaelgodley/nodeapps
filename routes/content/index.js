var express = require('express');
var router = express.Router();
var log = require('log4js').getLogger('authroute');

/* GET home page. */
router.get('/', function(req, res, next) {
    log.trace('%s %s route handler for User %s', req.method, req.url, req.user);    
    res.render('index.ejs', { title: 'Express', user: req.user, password: req.password, cookieAge: req.session.cookie.maxAge });
});

module.exports = router;
