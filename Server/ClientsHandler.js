const ITPpacket = require('./ITPResponse');
const singleton = require('./Singleton');
const fs = require("fs");

// hash maps to differentiate client details 
var client_names = {}, addresses = {}, time_stamps = {};

/* client_name: function to assign client name for each client connection */
function client_name(socket, client_names) {
  socket.id = socket.remoteAddress + ":" + socket.remotePort; // socket id (identifier for client) based on connection address and port 
  time_stamps[socket.id] = singleton.getTimestamp(); // set the time stamp for the current client
  var name = "Client-" + time_stamps[socket.id]; // build CLI display name 
  client_names[socket.id] = name; // store name in hashmap for current client
  addresses[socket.id] = socket.remoteAddress; // store address in hash map for current client
}


module.exports = {
  /* handleClientJoining: server controller for client requests and event handling*/
  handleClientJoining: function (socket) {
    socket.on("data", function (packet) {
      on_request(packet, socket); 
    });
    
    socket.on("close", function () {
      console.log(client_names[socket.id] + " closed the connection");
    });

    client_name(socket, client_names);
    console.log("\n" + client_names[socket.id] + " is connected at timestamp: " + time_stamps[socket.id]);
  },
};

function on_request(data, socket) {
  console.log("\nITP packet received:");
  printPacketBit(data);

  // parse packet data
  let version = parseBitPacket(data, 0, 4);
  let request_type = parseBitPacket(data, 24, 8);
  let name_length = parseBitPacket(data, 68, 28);
  let image_type = parseBitPacket(data, 64, 4);
  let time = parseBitPacket(data, 32, 32);

  // hashmap to decode request type and image extension
  const types = { 0: "Query", 1: "Found", 2: "Not found", 3: "Busy" };
  const extensions = { 1: "BMP", 2: "JPEG", 3: "GIF", 4: "PNG", 5: "TIFF", 15: "RAW" };
  image_type = extensions[image_type];

  let image = bytesToString(data.slice(12, 13 + name_length));
 
  // CLI display
  console.log("\n" + client_names[socket.id] + " requests:" +
      "\n    --ITP version: " +
      version +
      "\n    --Timestamp: " +
      time +
      "\n    --Request type: " +
      types[request_type] +
      "\n    --Image file extension(s): " +
      image_type +
      "\n    --Image file name: " +
      image +
      "\n"
  );

  // version check to ignore requests that are not being considered 
  if (version == 9 && request_type == "") { 
    let image_name = "images/" + image + "." + image_type;
    let imageData = fs.readFileSync(image_name);   

    ITPpacket.init(version, 1, singleton.getSequenceNumber(), singleton.getTimestamp(), imageData ); // build packet
    socket.write(ITPpacket.getPacket()); // send data to client for display 

    socket.end();
  } else {
    console.log("Protocol Version Must be 9 - Requirement"); // let client know why the request was ignored 

    socket.end();
  }
}

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

// Converts byte array to string
function bytesToString(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}