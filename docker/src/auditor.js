// Strongly inspired by the Thermometer example

// Standard Node module to work with UDP
const dgram = require('dgram');

// Import protocol
const protocol = require('./protocol.js');

var net = require('net');

// Creating a datagram socket
const serverUDP = dgram.createSocket('udp4');
serverUDP.bind(protocol.udp_port, function() {
    console.log("Joining multicast group");
    serverUDP.addMembership(protocol.multicast_address);
});

var uuids = new Map();
var musicians = [];

function checkMusicians() {
    serverUDP.on('message', function(msg) {
        message = JSON.parse(msg);
        if(firstTimeSeeingUUID(message.uuid)) {
            var musician = {
                uuid: message.uuid,
                instrument: getKeyByValue(protocol.instruments, message.sound.toString()),
                activeSince: new Date()
            };
        
            musicians.push(musician);
        }
        
    });
}

setInterval(checkMusicians, protocol.playTimer);

function firstTimeSeeingUUID(uuid) {
    var lastSeen = new Date();
    if(uuids.has(uuid)) {
        uuids[uuid] = lastSeen;
        return false;
    }

    uuids.set(uuid, lastSeen);
    return true;
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
    check_alive_musicians();

    socket.write(JSON.stringify(musicians));

    socket.end();
});

function check_alive_musicians() {
    return true;
}