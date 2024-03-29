// third party packages
const net = require("net");
const fs = require("fs");
const open = require("open");

// module imports 
const request_packet = require("./ITPRequest");
const singleton = require("./Singleton");

// initial data: includes image name , client port and client host address
const data = [];
const response_type = {0: "Query", 1: "Found", 2: "Not found", 3: "Busy" };
const [host, port] = process.argv[3].split(":");
const image_name = process.argv[5];

// initializing modules : building packet 
singleton.init();
request_packet.init(process.argv[7], image_name, singleton.getTimestamp());

// connecting to client
let client = new net.Socket();
client.connect(port, host, function () {
  console.log("Connected to ImageDB server on: " + host + ":" + port);
  client.write(request_packet.getPacket());
});

/* Reading From Server */
client.on("data", (bits) => {
  data.push(bits);
});

// on connection termination
client.on("end", async () => {
  // get server sent packet 
  const response_packet = Buffer.concat(data);
  let header = response_packet.slice(0, 12);
  let payload = response_packet.slice(12);

  // display packet information
  console.log("\nITP packet header received:");
  printPacketBit(header);

  // get image file data
  fs.writeFileSync(image_name, payload);

  // display recieved data (open image)
  (async () => {
      await open(image_name, { wait: true });
      process.exit(1);
     
  })( );

  // CLI display request results
  console.log("\nServer sent:");
  console.log("    --ITP version = " + parseBitPacket(header, 0, 4));
  console.log("    --Response Type = " + response_type[parseBitPacket(header, 4, 8)]);
  console.log("    --Sequence Number = " + parseBitPacket(header, 12, 16));
  console.log("    --Timestamp = " + parseBitPacket(header, 32, 32));
  console.log();

  // finaly terminate the connection (next event)
  client.end();  
});
client.on("end", () => {
  console.log("Disconnected from the server");
});
client.on("close", function () {
  console.log("Connection closed");
});

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.
// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
    let number = "";
    for (var i = 0; i < length; i++) {
      // let us get the actual byte position of the offset
      let bytePosition = Math.floor((offset + i) / 8);
      let bitPosition = 7 - ((offset + i) % 8);
      let bit = (packet[bytePosition] >> bitPosition) % 2;
      number = (number << 1) | bit;
    }
    return number;
  }
  
// Prints the entire packet in bits format
function printPacketBit(packet) {
  var bitString = "";

  for (var i = 0; i < packet.length; i++) {
    // To add leading zeros
    var b = "00000000" + packet[i].toString(2);
    // To print 4 bytes per line
    if (i > 0 && i % 4 == 0) bitString += "\n";
    bitString += " " + b.substr(b.length - 8);
  }
  console.log(bitString);
}


  
