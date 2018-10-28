// returns seconds since epoch
function now() {
    return Math.floor(Date.now() / 1000);
}


// check if given time interval has passed since timestamp
function checkExpiration(timestamp, interval) {
    const remaining = (timestamp + interval) - now();
    const isExpired = remaining <= 0 ? true : false;

    return {
        remaining,
        isExpired
    };
}


module.exports = {
    now,
    checkExpiration,
}
