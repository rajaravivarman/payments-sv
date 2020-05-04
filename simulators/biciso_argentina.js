// Include Nodejs' net module.
const Net = require('net');

//Parser By Raja
const parser = require('../parsers/biciso_argentina')

//Logger
const logger = require('../helpers/logger');

// The port number and hostname of the server.
const port = 42332;
const host = '10.77.49.232';

// Protocol Specification in JSON
const spec = require('../specs/biciso_argentina');

 
const client = new Net.Socket();

client.setEncoding('hex');


client.connect({
    port: port,
    host: host
}, function () {


    console.log('TCP connection established with the server.');


});



client.on('data', function (chunk) {

    logger.notifytraffic('Message Recieved');

    var {req, res, response_message} = parser.parse(chunk, spec);

    client.write(Buffer.from(response_message, 'hex'), function (err) {
        if (err) {
            return console.log('Error on write: ', err.message);
        }
        logger.notifytraffic('Message Sent');
    });

    logger.logtraffic(req, res, spec);

});