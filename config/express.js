var express = require('express');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);
//var logger = require('morgan');
var logger = require('log4js'); 
var config = require('./env/app.json')


module.exports = function(db) {
    // Express Setup
    var log = logger.getLogger('config');
    var app = express();
    // view engine setup
    app.set('views', config.express.templates);
    app.set('view engine', config.express.viewengine);

    // uncomment after placing your favicon in /public
    //app.use(favicon(config.express.publicDir + '/favicon.ico'));
    // logging setup
    //app.use(logger('dev'));
    app.use(logger.connectLogger(logger.getLogger('http'), { level: 'auto', format: ':protocol :method :http-version :url :status :response-time :referrer' }));
    // Parsers
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    // Static and public assets
    app.use(express.static(config.express.publicDir));
    // Sessions and Passport
    app.use(session({secret: config.express.session.secret, saveUninitialized: true, resave: true, cookie: {maxAge: config.express.session.cookie.maxAge}, store: new MongoStore({mongooseConnection: db.connection, ttl: config.express.session.store.ttl})}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    log.info('Express Initialised');
    return app;
};
