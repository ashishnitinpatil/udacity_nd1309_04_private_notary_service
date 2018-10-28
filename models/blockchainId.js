const bitcoin = require('../utility/bitcoin');
const levelDB = require('../utility/level');
const time = require('../utility/time');


const INTERVAL = 300;


function getMessage(address, timestamp) {
    return `${address}:${timestamp}:starRegistry`;
}


async function register(address) {
    // topmost so that we always have correct timestamp
    const requestTimeStamp = time.now();
    // address validation in all cases
    if (!bitcoin.validateAddress(address)) {
        throw new Error('Invalid wallet address');
    }

    let status;
    // see if address is already whitelisted / requested registration
    try {
        status = JSON.parse(await levelDB.getAddressStatus(address));
        if (status.isWhitelisted) {
            return status;
        }
        else {
            status.requestTimeStamp = requestTimeStamp; // update timestamp (reregister)
        }
    } catch(err) {
        // not already whitelisted
        const message = getMessage(address, requestTimeStamp);
        const isWhitelisted = false;
        status = {
            address,
            requestTimeStamp,
            message,
            isWhitelisted,
        };
    }

    // store the entire status object against the address
    await levelDB.addAddressStatus(address, JSON.stringify(status));
    return status;
}


async function validate(address, signature) {
    // topmost so that we always have correct timestamp
    const timestamp = time.now();
    // address validation in all cases
    if (!bitcoin.validateAddress(address)) {
        throw new Error('Invalid wallet address');
    }

    let status;
    // see if address is already whitelisted / requested registration
    try {
        status = JSON.parse(await levelDB.getAddressStatus(address));
        if (status.isWhitelisted) {
            throw new Error('Address already validated');
        }
        else if (time.checkExpiration(status.timestamp, INTERVAL).isExpired) {
            await levelDB.removeAddressTimestamp(address);
            throw new Error('Validation request has expired');
        }
    } catch(err) {
        throw new Error(`Validation request not found / expired: ${err}`);
    }

    // not already whitelisted
    // verify message signature
    if (bitcoin.verifySignature(status.message, address, signature)) {
        // save status with timestamp of validation request
        status.isWhitelisted = timestamp;
        await levelDB.addAddressStatus(address, JSON.stringify(status));
    }

    return status;
}


module.exports = {
    INTERVAL,
    getMessage,
    register,
    validate,
}
