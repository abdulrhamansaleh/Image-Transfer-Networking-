/* timerRun: increments a timer that resets at 2^32 */
function conn_timer() {
    timer ++;
    if (timer == 4294967295) {
        timer = Math.floor(Math.random() * 999) + 1;
    }
}

module.exports = {
    init: function() {
        timer = Math.floor(Math.random() * 999) + 1;
        setInterval(conn_timer, 10);
        sequenceNumber = Math.floor(1000 * Math.random()); 
    },

    /* getSequenceNumber: return sequence number*/
    getSequenceNumber: function() {
        sequenceNumber ++;
        return sequenceNumber;
    },

    /* getSequenceNumber: return timestamp */
    getTimestamp: function() {
        return timer;
    },
};