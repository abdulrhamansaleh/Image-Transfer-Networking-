module.exports = {
  // initial vars
  header: "",
  payload: "",
  header_size: 12,

  init: function (version, image_name, time_stamp) {
    this.header = new Buffer.alloc(this.header_size); // initial header

    const extensions = { BMP: 1, JPEG: 2, GIF: 3, PNG: 4, TIFF: 5, RAW: 15 }; // map to decode file extension by number

    // get image 
    image = stringToBytes(image_name.split(".")[0]);
    // get extenstion
    image_extension = extensions[image_name.split(".")[1].toUpperCase()]

    // build packet 
    storeBitPacket(this.header, version * 1, 0, 4);
    storeBitPacket(this.header, 0, 24, 8);
    storeBitPacket(this.header, time_stamp, 32, 32);
    storeBitPacket(this.header, image_extension, 64, 4);
    storeBitPacket(this.header, image.length, 68, 28);

    // update payload based on image
    this.payload = new Buffer.alloc(image.length);

    for (j = 0; j < image.length; j++) {
      this.payload[j] = image[j];
    }
  },
  
  /* getPacket: returns packet including payload and header information  */
  getPacket: function () {
    const packet = new Buffer.alloc(this.payload.length + this.header_size);

    for (var i = 0; i < this.header_size; i++) {
      packet[i] = this.header[i];
    }

    for (var i = 0; i < this.payload.length; i++)
      packet[i + this.header_size] = this.payload[i];

    return packet;
  },
};

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.
// Convert a given string to byte array
function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
  // let us get the actual byte position of the offset
  let lastBitPosition = offset + length - 1;
  let number = value.toString(2);
  let j = number.length - 1;
  for (var i = 0; i < number.length; i++) {
    let bytePosition = Math.floor(lastBitPosition / 8);
    let bitPosition = 7 - (lastBitPosition % 8);
    if (number.charAt(j--) == "0") {
      packet[bytePosition] &= ~(1 << bitPosition);
    } else {
      packet[bytePosition] |= 1 << bitPosition;
    }
    lastBitPosition--;
  }
}
