// Strongly inspired by the Thermometer example

// Standard Node module to work with UDP
const dgram = require('dgram');

// Import protocol
const protocol = require('./protocol.js');

// To create RFC4122 compliant UUIDs
// FROM: https://github.com/uuidjs/uuid
const uuid = require('uuid');
const uuidv4 = uuid.v4();

// Creating a datagram socket
const server = dgram.createSocket('udp4');


console.log("Starting musician...")
var instrument = process.argv[2];

if(protocol.instruments[instrument]) {
    setInterval(play, protocol.playTimer);
} else {
    console.log("Unknown instrument!")
}

function play() {
    var musician = {
        uuid: uuidv4,
        sound: protocol.instruments[instrument]
    };

    const payload = JSON.stringify(musician);

    message = new Buffer.from(payload);
    server.send(message, protocol.udp_port, protocol.multicast_address, function() {
        console.log(payload);
    });
}