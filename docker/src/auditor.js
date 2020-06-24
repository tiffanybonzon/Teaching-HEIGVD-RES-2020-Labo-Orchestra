// Strongly inspired by the Thermometer example

// Standard Node module to work with UDP
const dgram = require('dgram');

// Import protocol
const protocol = require('./protocol.js');

var net = require('net');

var moment = require('moment'); //Pour coparer les temps facilement

var musicians = new Map(); // COntient les musiciens actifs

// Creating a datagram socket
const serverUDP = dgram.createSocket('udp4');
serverUDP.bind(protocol.udp_port, function() {
    console.log("Joining multicast group");
    serverUDP.addMembership(protocol.multicast_address);
});


// s.on dans une fonction car je sias pas comment timer sinon...
function checkMusicians() {
    serverUDP.on('message', function(msg) {
        message = JSON.parse(msg);
        checkUUID(message);
    });
}

function checkUUID(message) {
    //Surement qu'il serait mieux d'update lastHeard plutot que de tej et recréer à chaque fois...
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

setInterval(checkMusicians, protocol.playTimer);
setInterval(checkAliveMusicians, protocol.deathTimer);