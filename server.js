const express = require('express');
const bodyParser = require('body-parser');

const blockApi = require('./routes/blockApi');


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

// Block API Routes
app.get('/block/:height', blockApi.getBlock);
app.post('/block', blockApi.createBlock);


app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));

module.exports = app;
