const BlockchainId = require('../models/blockchainId');
const time = require('../utility/time');


async function requestValidation(req, res) {
    const address = req.body.address;
    try {
        const request = await BlockchainId.register(address);
        const expiration = time.checkTimestampExpiration(request.timestamp, BlockchainId.INTERVAL);
        res.status(200).json({
            'address': request.address,
            'message': request.message,
            'timestamp': request.timestamp,
            'validationWindow': expiration.remaining,
        });
    } catch(err) {
        res.status(400).json({'error': `Could not register request: ${err}`});
    }
}


async function validateSignature(req, res) {
    const address = req.body.address;
    const signature = req.body.signature;
    try {
        const request = await BlockchainId.validate(address, signature);
        const expiration = time.checkTimestampExpiration(request.timestamp, BlockchainId.INTERVAL);
        // TODO: whitelist address on successful validation
        res.status(200).json({
            'registerStar': request.isValid,
            'status': {
                'address': request.address,
                'requestTimeStamp': request.timestamp,
                'message': request.message,
                'validationWindow': expiration.remaining,
                'messageSignature': request.isValid ? 'valid' : 'invalid',
            },
        });
    } catch(err) {
        res.status(400).json({'error': `Could not validate signature: ${err}`});
    }
}


module.exports = {
    requestValidation,
    validateSignature,
}
