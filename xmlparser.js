var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');

var parser = new xml2js.Parser();

fs.watch('./xml', function(event, filename) {
    console.log('Event: ' + event);
    if(filename) {
	console.log('Filename: %s', filename);
	fs.readFile(__dirname + '/xml/' + filename, function(err, data) {
	    if(err) {
		console.log('File Error %s', err.message);
		return;
	    }
	    //console.log(data)
	    parser.parseString(data, function(err, result) {
		if(err) {
		    console.log('Parse Error %s', err.message);
		    return;
		}
		//console.log(result);
		console.log(JSON.stringify(result, null, 2));
		//console.log(JSON.parse(JSON.stringify(result, null, 2)));
		
		console.log('Result %s', result.root.Race[0].Code[0])
		//console.log('Bib %d', result.root.Race[0].Heat[0].Athlete[0].Bib[0])
		//console.log('Bib %d', result.root.Race[0].Heat[0].Athlete[1].Bib[0])
		//console.dir(util.inspect(result, {depth: null}));
		console.dir(result, {showHidden: true, depth: null, colors: true});
	    });
	});
    } else { 
	console.log('No filename');
    }
});
