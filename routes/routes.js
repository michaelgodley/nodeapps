var passport = require('passport');
var express = require('express');

module.exports = function(app) {
    // API Token Routes
    var sampleapi = express.Router();
    require('./api/sampleapi')(sampleapi) 
    app.use('/api/v2', sampleapi); 

    var api = express.Router();
    require('./api/api')(api, passport) 
    app.use('/api/v1', api); 

    // Authentication Routes
    var auth = express.Router();
    require('./authenticate/auth')(auth, passport);
    app.use('/auth', auth);

    // Normal Routes
    var content = express.Router();
    require('./content/appcontent')(content);
    app.use('/', content);

    // Email Sample Routes
    var email = express.Router();
    require('./samples/emailer')(email);
    app.use('/sample', email);

    // Secured Routes
    var secureContent = express.Router(); 
    require('./content/appcontentsecure')(secureContent);
    app.use('/content', secureContent);
}
