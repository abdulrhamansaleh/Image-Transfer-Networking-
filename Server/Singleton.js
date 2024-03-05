let sequenceNumber;
let timerInterval = 10;
let timer;

function timerRun() {
    timer ++;
    if (timer == 4294967295) {
        timer = Math.floor(1000 * Math.random());
    }
}

module.exports = {
    init: function() {
        timer = Math.floor(1000 * Math.random());
        setInterval(timerRun, timerInterval);
        sequenceNumber = Math.floor(1000 * Math.random()); 
    },

    getSequenceNumber: function() {
        sequenceNumber ++;
        return sequenceNumber;
    },

    getTimestamp: function() {
        return timer;
    },
};