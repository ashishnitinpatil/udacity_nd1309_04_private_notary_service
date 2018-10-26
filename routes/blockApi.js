const Block = require('../models/block');
const Blockchain = require('../models/simpleChain');


async function getBlock(req, res) {
    try {
        const block = await Blockchain.getBlock(req.params.height);
        res.status(200).json(block);
    } catch(err) {
        res.status(404).json({
            'error': `Could not get block #${req.params.height}: ${err}`
        });
    }
}


async function createBlock(req, res) {
    data = req.body.body;
    if (!data) {
        res.status(400).json({'error': 'invalid "body" key in request body'});
        return;
    }
    block = new Block(data);

    try {
        const newBlock = await Blockchain.addBlock(block);
        res.status(201).json(block);
    } catch (err) {
        res.status(500).json({'error': 'Could not add block: ${err}'});
    }
}


module.exports = {
    getBlock,
    createBlock,
}
