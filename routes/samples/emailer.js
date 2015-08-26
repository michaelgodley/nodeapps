var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var log = require('log4js').getLogger('emailroute');
var config = require('../../config/env/app.json');


module.exports = function(router) {
    /* GET home page. */
    router.get('/email', function(req, res) {
	log.trace('%s %s route handler for User %s', req.method, req.url, req.user);    
	res.render('email.ejs', { message: ''});
    });

    router.post('/email', function(req, res) {
	log.trace('%s %s route handler for User %s', req.method, req.url, req.user);    

	var prog = {
	    email: req.body.email,
	    progId: req.body.progId
	};

	// user successfully authenticated
	var token = jwt.sign(prog, 
			     config.express.jwttoken.secret, 
			     {
				 algorithm: config.express.jwttoken.algorithm , 
				 expiresInMinutes: config.express.jwttoken.expiresInMinutes, 
				 issuer: config.express.jwttoken.issuer, 
				 audience: config.express.jwttoken.audience, 
				 ignoreExpiration: false
			     });
	  
	var link =  'http://192.168.56.100:3000/sample/prog/' + token

	var smtpTransport = nodemailer.createTransport('SMTP', {
	    service: 'Gmail',
	    auth: {
		user: '@gmail.com',
		pass: ''
	    }
	});

	smtpTransport.sendMail({
	    from: 'michaelgodley@gmail.com',
	    to: req.body.email,
	    subject: 'Link test',
	    text: 'http://192.168.56.100:3000/sample/prog/' + token
	}, function(err, res) {
	    if(err) {
		console.log(err);
	    } else {
		console.log('Message Sent ' + res.message); 
	    }
	});
	
	res.render('email.ejs', { message: link });
    });

    router.get('/prog/:id', function(req, res) {
	log.trace('%s %s route handler for User %s', req.method, req.url, req.user);    
	// verify a token symmetric 
	var token = req.params.id;
	jwt.verify(token, config.express.jwttoken.secret, function(err, decoded) {
	    if(err) {
		return res.json({error: err.name, message: err.message});
	    }
	    console.log(decoded) 
	    res.json({email: decoded.email, progId: decoded.progId});
	});

	//res.render('email.ejs', { title: 'Express', user: req.user, password: req.password, cookieAge: req.session.cookie.maxAge });
    });

};
