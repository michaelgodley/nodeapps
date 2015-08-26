var logger = require('log4js');
var config = require('./config/env/app.json')

//  Setup up log4js
logger.configure('./config/env/log.json', {reloadSecs: 30});
var appLog = logger.getLogger();
appLog.info('Application starting ...');

// Initialise Passport Middleware Strategies
var ps = require('./config/passport');
// Initialise Mongo DB
var db = require('./config/db')();
// Initialise Express
var app = require('./config/express')(db);
// Setup up route handlers
require('./routes/routes')(app);

// Start listening
app.listen(config.webserver.http.port);
appLog.info('Listening on port %d', config.webserver.http.port);

