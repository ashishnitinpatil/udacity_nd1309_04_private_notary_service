const bitcoin = require('../utility/bitcoin');
const levelDB = require('../utility/level');
const time = require('../utility/time');


const INTERVAL = 300;


function getMessage(address, timestamp) {
    return `${address}:${timestamp}:starRegistry`;
}


async function register(address) {
    const timestamp = time.getCurrentTimestamp();
    if (!bitcoin.validateAddress(address)) {
        throw new Error('Invalid wallet address');
    }
    await levelDB.addAddressTimestamp(address, timestamp);
    const message = getMessage(address, timestamp);
    return {
        address,
        timestamp,
        message,
    };
}


async function validate(address, signature) {
    if (!bitcoin.validateAddress(address)) {
        throw new Error('Invalid wallet address');
    }
    let timestamp = null;
    try {
        timestamp = parseInt(await levelDB.getAddressTimestamp(address));
        if (time.checkTimestampExpiration(timestamp, INTERVAL).isExpired) {
            await levelDB.removeAddressTimestamp(address);
            throw new Error('Validation request has expired');
        }
    } catch(err) {
        throw new Error(`Validation request not found / expired: ${err}`);
    }

    const message = getMessage(address, timestamp);
    isValid = bitcoin.verifySignature(message, address, signature);

    return {
        isValid,
        address,
        timestamp,
        message,
        signature,
    };
}


module.exports = {
    INTERVAL,
    getMessage,
    register,
    validate,
}
