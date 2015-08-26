var log = require('log4js').getLogger('config');
var mongoose = require('mongoose');
var config = require('./env/app.json');

module.exports = function() {
    // Connect to Mongo DB
    var connUrl = config.db.dbProtocol + '://' + config.db.dbHost + ':' + config.db.dbPort + '/' + config.db.dbName;
    log.debug('MongoDB Connection %s', connUrl);
    var db = mongoose.connect(connUrl, function(err) {
	if (err) { 
	    log.error('Failed to connect to MongoDB on %s', err.message);
	} else {
	    log.info('Successfully connected to MongoDB on %s', connUrl);
	}
    });
	
    mongoose.connection.on('error', function(err) {
	log.error('Failed to connect to MongoDB on %s', err.message);
	process.exit(-1);
    });
    return db;
}
