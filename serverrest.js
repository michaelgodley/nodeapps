var express = require('express');
var path = require('path');
var logger = require('log4js');
//var logger = require('morgan');
var mongoose = require('mongoose');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');

var config = require('./config/app.json')

var restroutes = require('./routes/restapi/restroutes');
var validateRequest = require('./controllers/validateRequest')

//  Setup up log4js
logger.configure('./config/log.json', {reloadSecs: 30});
var appLog = logger.getLogger();
appLog.info('Application starting ...');

// Connect to Mongo DB
//var connStr = 'mongodb://localhost/node-passport-local';
var connStr = config.db.dbProtocol + '://' + config.db.dbHost + ':' + config.db.dbPort + '/' + config.db.dbName;
appLog.debug('MongoDB Connection String %s', connStr);
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    appLog.info('Successfully connected to MongoDB on %s', connStr);

    // Express Setup
    var app = express();
    // view engine setup
    //app.set('views', path.join(__dirname, config.express.templates));
    //app.set('view engine', config.express.viewengine);
    // uncomment after placing your favicon in /public
    //app.use(favicon(__dirname + '/public/favicon.ico'));
    //app.use(logger('dev'));
    app.use(logger.connectLogger(logger.getLogger('http'), { level: 'auto', format: ':protocol :method :http-version :url :status :response-time :referrer' }));
    app.use(bodyParser.json());
    //app.use(bodyParser.urlencoded({ extended: false }));
    //app.use(cookieParser());
    //app.use(express.static(path.join(__dirname, config.express.publicDir)));
    //app.use(session({secret: config.express.sessionSecret, saveUninitialized: true, resave: true}));
    //app.use(passport.initialize());
    //app.use(passport.session());

    app.all('/*', function(req, res, next) {
	// CORS headers
	res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	// Set custom headers for CORS
	res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
	if (req.method == 'OPTIONS') {
	    res.status(200).end();
	} else {
	    next();
	}
    });

    // Auth Middleware - This will check if the token is valid
    // Only the requests that start with /api/v1/* will be checked for the token.
    // Any URL's that do not follow the below pattern should be avoided unless you 
    // are sure that authentication is not needed
    app.all('/api/v1/*', validateRequest);    
    app.use('/', restroutes);
    

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
    });

    app.listen(config.webserver.http.port, function() {
	appLog.info('Listening on port %d', config.webserver.http.port);
    });
});
