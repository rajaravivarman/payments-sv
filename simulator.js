const { exec } = require("child_process");

const yargs = require('yargs');

const endpoints = require('./config')

const argv = yargs
    .command('endpoint name', 'Starts a simulator with endpoint as configured in config.json', {
        ip: {
            description: 'Host/IP Address to listen for incoming tcp traffic.',
            alias: 'i',
            type: 'string',
        },
        port: {
            description: 'Port to listen for incoming tcp traffic.',
            alias: 'p',
            type: 'number',
        }
    })
    .option('time', {
        alias: 't',
        description: 'Tell the present Time',
        type: 'boolean',
    })
    .help()
    .alias('help', 'h')
    .argv;

if (argv.time) {
    console.log('The current time is: ', new Date().toLocaleTimeString());
}

console.log(endpoints[argv._[0]]);

// Include Nodejs' net module.
const Net = require('net');

// Parser
const parser = require('./parsers/' + argv._[0])

// Logger
const logger = require('./helpers/logger');

// Host IP and Port
const port = endpoints[argv._[0]].port;
console.log(port)
const host = endpoints[argv._[0]].host;
console.log(host)

// Protocol Specification in JSON
if (endpoints[argv._[0]].spec.req != null) {
    spec = {};
    spec.req = require(endpoints[argv._[0]].spec.req);
    spec.res = require(endpoints[argv._[0]].spec.res);
} else {
    spec = require(endpoints[argv._[0]].spec);
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