// Strongly inspired by the Thermometer example

// Standard Node module to work with UDP
const dgram = require('dgram');

// To create RFC4122 compliant UUIDs
// FROM: https://github.com/uuidjs/uuid
const uuid = require('uuid');
const uuidv4 = uuid.v4();

//Creating a datagram socket
const server = dgram.createSocket('udp4');

var instruments = new Map();
instruments.set("piano", "ti-ta-ti");
instruments.set("trumpet", "pouet");
instruments.set("flute", "trulu");
instruments.set("violin", "gzi-gzi");
instruments.set("drum", "boum-boum");

console.log("Starting musician...")
var instrument = process.argv[2];

if(instruments.has(instrument)) {
    setInterval(play, 1000);
} else {
    console.log("Unknown instrument!")
}

function play() {
    var musician = {
        uuid: uuidv4,
        sound: instruments.get(instrument)
    };

    const payload = JSON.stringify(musician);

    message = new Buffer.from(payload);
    server.send(message, 2112, "239.255.22.5", function() {
        console.log(payload);
    });
}