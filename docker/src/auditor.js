// Strongly inspired by the Thermometer example

// Standard Node module to work with UDP
const dgram = require('dgram');

// Import protocol
const protocol = require('./protocol.js');

var net = require('net');

var moment = require('moment');

// Creating a datagram socket
const serverUDP = dgram.createSocket('udp4');
serverUDP.bind(protocol.udp_port, function() {
    console.log("Joining multicast group");
    serverUDP.addMembership(protocol.multicast_address);
});

var musicians = new Map();

function checkMusicians() {
    serverUDP.on('message', function(msg) {
        message = JSON.parse(msg);

        checkUUID(message);

        
        
    });
}

setInterval(checkMusicians, protocol.playTimer);
setInterval(checkAliveMusicians, protocol.deathTimer);

function checkUUID(message) {
    if(musicians.has(message.uuid)) {
        musicians.delete(message.uuid);
    }

    var musician = {
        uuid: message.uuid,
        instrument: getKeyByValue(protocol.instruments, message.sound.toString()),
        activeSince: new Date(),
        lastHeard: new Date()
    };

    musicians.set(message.uuid, musician);
}

// FROM: https://stackoverflow.com/a/28191966/5119024
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

// let's create a TCP server
var serverTCP = net.createServer();

// we are ready, so let's ask the server to start listening on port 9907
serverTCP.listen(protocol.tcp_port);

serverTCP.on('connection', function(socket) {
    checkAliveMusicians();
    var msg = [];

    musicians.forEach(element => {
        msg.push({
            uuid: element.uuid,
            instrument: element.instrument,
            activeSince: element.activeSince
        });
    });

    socket.write(JSON.stringify(msg));

    socket.end();
});

function checkAliveMusicians() {
    musicians.forEach(element => {
        
        if(moment().diff(element.lastHeard, "milliseconds") > protocol.deathTimer) {
            musicians.delete(element.uuid);
        }

    });
}