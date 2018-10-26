/* ===== Helper functions for bitcoin related stuff ==============
|  Learn more: https://github.com/bitcoinjs/bitcoinjs-message     |
|  =============================================================*/

const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');


// Validate bitcoin wallet address
// https://github.com/bitcoinjs/bitcoinjs-lib/issues/890#issuecomment-329371169
function validateAddress(address) {
    try {
        bitcoin.address.toOutputScript(address);
        return true;
    } catch (e) {
        return false;
    }
}


// Verify message signature for given wallet address
function verifySignature(message, address, signature) {
    try {
        // try-catch for allowing invalid signature lengths, etc.
        return bitcoinMessage.verify(message, address, signature);
    } catch (e) {
        return false;
    }
}


module.exports = {
    validateAddress,
    verifySignature,
}
