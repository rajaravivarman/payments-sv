// Include Nodejs' net module.
const Net = require('net');

// Parser
const parser = require('../parsers/hiso_india')

// Logger
const logger = require('../helpers/logger');

// Host IP and Port
const port = 42320;
const host = '10.77.49.232';

// Protocol Specification in JSON
const spec = require('../specs/hiso_india');

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