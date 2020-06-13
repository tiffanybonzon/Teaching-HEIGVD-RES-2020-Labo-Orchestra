// Strongly inspired by the Thermometer example

// Standard Node module to work with UDP
const dgram = require('dgram');

// Import protocol
const protocol = require('./protocol.js');

var net = require('net');

// Creating a datagram socket
const serverUDP = dgram.createSocket('udp4');
serverUDP.bind(protocol.port, function() {
    console.log("Joining multicast group");
    serverUDP.addMembership(protocol.multicast_address);
});

var uuids = [];

function checkMusicians() {
    serverUDP.on('message', function(msg) {
        message = JSON.parse(msg);
        if(firstTimeSeeingUUID(message.uuid)) {
            console.log(message.uuid);
            console.log(getKeyByValue(protocol.instruments, message.sound.toString()))
            console.log(new Date());
        }
        
    });
}

setInterval(checkMusicians, protocol.playTimer);

function firstTimeSeeingUUID(uuid) {
    if(uuids.includes(uuid)) {
        return false;
    }


    uuids.push(uuid);
    return true;
}

// FROM: https://stackoverflow.com/a/28191966/5119024
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

// let's create a TCP server
var serverTCP = net.createServer();

// we are ready, so let's ask the server to start listening on port 9907
serverTCP.listen(2205);

serverTCP.on('connection', function(socket) {
    socket.write("test");
    socket.end();
});

