const express = require('express');
const bodyParser = require('body-parser');

const Block = require('./block');
const Blockchain = require('./simpleChain');


const app = express();
const PORT = 8000;

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true }));

// index
app.get('/', function(req, res) {
    res.status(404).json({
        'error': `Valid Endpoints - 1. GET: /block/<height> & 2. POST: /block`
    });
});

// get block
app.get('/block/:height', async function(req, res) {
    try {
        const block = await Blockchain.getBlock(req.params.height);
        res.status(200).json(block);
    } catch(err) {
        res.status(404).json({
            'error': `Could not get block #${req.params.height}: ${err}`
        });
    }
});

// create block
app.post('/block', async function(req, res) {
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
});


app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));

module.exports = app;
