const Net = require('net');

// Parser
const parser = require('../parsers/apacs_aibms.js');

// Logger
const logger = require('../helpers/logger.js');

// Host IP and Port
const port = 42322;
const host = '10.77.49.232';

// Protocol Specification in JSON
const spec = {
 req: require('./../specs/apacs_request'),
 res: require('./../specs/apacs_response')
}

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