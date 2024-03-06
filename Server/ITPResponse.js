module.exports = {
  header: "",
  payload: "",
  header_size: 12,

  init: function (version, res_type, seq_num, time, image) {
    this.header = new Buffer.alloc(this.header_size);

    storeBitPacket(this.header, version, 0, 4);
    storeBitPacket(this.header, res_type, 4, 8);
    storeBitPacket(this.header, seq_num, 12, 16);
    storeBitPacket(this.header, time, 32, 32);
    storeBitPacket(this.header, image.length, 64, 32);

    this.payload = new Buffer.alloc(image.length + 4);

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