// Strongly inspired by the Thermometer example

// Standard Node module to work with UDP
const dgram = require('dgram');

// Import protocol
const protocol = require('./protocol.js');

// Creating a datagram socket
const server = dgram.createSocket('udp4');
server.bind(protocol.port, function() {
    console.log("Joining multicast group");
    server.addMembership(protocol.multicast_address);
});

var uuids = [];

function checkMusicians() {
    server.on('message', function(msg) {
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