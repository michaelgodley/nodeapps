var nodemailer = require('nodemailer');

var smtpTransport = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
	user: '@gmail.com',
	pass: 'abc'
    }
});

smtpTransport.sendMail({
    from: 'm@gmail.com',
    to: 't@gmail.com',
    subject: 'Test',
    text: 'This is a test'
}, function(err, res) {
    if(err) {
	console.log(err);
    } else {
	console.log('Message Sent ' + res.message); 
    }
});
