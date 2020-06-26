// Strongly inspired by the Thermometer example

// Standard Node module to work with UDP
const dgram = require('dgram');

// Import protocol
const protocol = require('./protocol.js');

var net = require('net');

var moment = require('moment'); //Pour coparer les temps facilement

var musicians = new Map(); // Contient les musiciens actifs

// Creating a datagram socket
const serverUDP = dgram.createSocket('udp4');
serverUDP.bind(protocol.udp_port, function() {
    console.log("Joining multicast group");
    serverUDP.addMembership(protocol.multicast_address);
});


// s.on dans une fonction car je sais pas comment timer sinon...
function checkMusicians() {
    serverUDP.on('message', function(msg) {
        message = JSON.parse(msg);
        checkUUID(message);
    });
}

// If UUID already exists, update the lastHeard timestamp, create an entry otherwise
function checkUUID(message) {
    var musician;
    
    if(musicians.has(message.uuid)) {
        musician = musicians.get(message.uuid);
        musician.lastHeard = new Date();
    } else {
        musician = {
            uuid: message.uuid,
            instrument: getKeyByValue(protocol.instruments, message.sound.toString()),
            activeSince: new Date(),
            lastHeard: new Date()
        };
    }

    musicians.set(message.uuid, musician);
}

// Check if lastHeard was less than 5 seconds ago, removes the musician from the map otherwise
function checkAliveMusicians() {
    musicians.forEach(element => {
        if(moment().diff(element.lastHeard, "milliseconds") > protocol.deathTimer) {
            musicians.delete(element.uuid);
        }
    });
}

// FROM: https://stackoverflow.com/a/28191966/5119024
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

// let's create a TCP server
var serverTCP = net.createServer();

// we are ready, so let's ask the server to start listening on port 2205
serverTCP.listen(protocol.tcp_port);

// Listent for TCP connections
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

setInterval(checkMusicians, protocol.playTimer);
setInterval(checkAliveMusicians, protocol.deathTimer);