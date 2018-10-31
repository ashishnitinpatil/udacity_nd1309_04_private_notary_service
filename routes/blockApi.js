const Block = require('../models/block');
const Star = require('../models/star');
const Blockchain = require('../models/simpleChain');
const blockchainId = require('../models/blockchainId');


function addStoryDecoded(block) {
    if (block.height > 0) { // ignore genesis block
        block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
    }
    return block;
}


async function getBlock(req, res) {
    try {
        const block = await Blockchain.getBlock(req.params.height);
        res.status(200).json(addStoryDecoded(block));
    } catch(err) {
        res.status(404).json({
            'error': `Could not get block #${req.params.height}: ${err}`
        });
    }
}


async function createBlock(req, res) {
    const address = req.body.address;
    let star, block;
    try {
        const status = await blockchainId.fetch(address);
        if (!status.isWhitelisted) {
            throw new Error('Address has not been validated');
        }
        star = new Star(req.body.star);
    } catch(error) {
        res.status(400).json({error});
        return;
    }
    block = new Block({address, star});

    try {
        const newBlock = await Blockchain.addBlock(block);
        // require revalidation (SINGLE star registration each time)
        await blockchainId.remove(address);
        res.status(201).json(block);
    } catch (err) {
        res.status(500).json({'error': `Could not add block: ${err}`});
    }
}


async function getStarsByAddress(req, res) {
    const address = req.params.address;

    let isValid = true;
    try {
        blockchainId.errIfInvalid(address);
    } catch(error) {
        isValid = false;
    }

    const addrStars = [];
    if (isValid) {
        const allStars = await Blockchain.getChain(from=1);
        allStars.forEach(star => {
            if (star.body.address === address) {
                addrStars.push(addStoryDecoded(star));
            }
        });
    }

    res.status(200).json(addrStars);
}


async function getStarByHash(req, res) {
    const hash = req.params.hash;

    if (typeof hash !== 'string' || !hash || hash.length != 64) {
        const error = 'Invalid hash value';
        res.status(400).json({error});
        return;
    }

    let star;
    const allStars = await Blockchain.getChain(from=1);
    allStars.forEach(block => {
        if (block.hash === hash) {
            star = addStoryDecoded(block);
        }
    });

    if (star) {
        res.status(200).json(star);
    }
    else {
        const error = 'Star with given hash value not found';
        res.status(404).json({error});
    }
}


module.exports = {
    getBlock,
    createBlock,
    getStarsByAddress,
    getStarByHash,
}
