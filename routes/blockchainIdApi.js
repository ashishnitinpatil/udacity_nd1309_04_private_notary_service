const blockchainId = require('../models/blockchainId');
const time = require('../utility/time');


async function requestValidation(req, res) {
    const address = req.body.address;
    try {
        const request = await blockchainId.register(address);
        const expiration = time.checkExpiration(request.requestTimeStamp, blockchainId.INTERVAL);
        res.status(200).json({
            'address': request.address,
            'message': request.message,
            'timestamp': request.requestTimeStamp,
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
        const request = await blockchainId.validate(address, signature);
        const expiration = time.checkExpiration(request.requestTimeStamp, blockchainId.INTERVAL);
        // TODO: whitelist address on successful validation
        res.status(200).json({
            'registerStar': Boolean(request.isWhitelisted),
            'status': {
                'address': request.address,
                'requestTimeStamp': request.requestTimeStamp,
                'message': request.message,
                'validationWindow': expiration.remaining,
                'messageSignature': request.isWhitelisted ? 'valid' : 'invalid',
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
