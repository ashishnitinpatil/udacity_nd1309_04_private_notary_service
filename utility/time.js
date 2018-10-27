// returns seconds since epoch
function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000);
}


// check if given time interval has passed since timestamp
function checkTimestampExpiration(timestamp, interval) {
    now = getCurrentTimestamp();
    remaining = (timestamp + interval) - now;
    isExpired = remaining <= 0 ? true : false;
    return {remaining, isExpired};
}


module.exports = {
    getCurrentTimestamp,
    checkTimestampExpiration,
}