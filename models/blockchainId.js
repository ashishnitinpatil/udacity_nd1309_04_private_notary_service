const bitcoin = require('../utility/bitcoin');
const levelDB = require('../utility/level');
const time = require('../utility/time');


const INTERVAL = 300;


function getMessage(address, timestamp) {
    return `${address}:${timestamp}:starRegistry`;
}


function errIfInvalid(address) {
    if (!bitcoin.validateAddress(address)) {
        throw new Error('Invalid wallet address');
    }
}


// DRY for use outside of this model
async function fetch(address) {
    errIfInvalid(address);

    return JSON.parse(await levelDB.getAddressStatus(address));
}


async function register(address) {
    // topmost so that we always have correct timestamp
    const requestTimeStamp = time.now();
    // address validation in all cases
    errIfInvalid(address);

    let status;
    // see if address is already whitelisted / requested registration
    try {
        status = JSON.parse(await levelDB.getAddressStatus(address));
        if (status.isWhitelisted) {
            return status;
        }
        else {
            const expiration = time.checkExpiration(status.requestTimeStamp, INTERVAL);
            if (expiration.isExpired) {
                status.requestTimeStamp = requestTimeStamp; // update timestamp (reregister)
            }
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
    errIfInvalid(address);

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


async function remove(address) {
    errIfInvalid(address);

    await levelDB.removeAddressStatus(address);
}


module.exports = {
    INTERVAL,
    getMessage,
    errIfInvalid,
    fetch,
    register,
    validate,
    remove,
}
