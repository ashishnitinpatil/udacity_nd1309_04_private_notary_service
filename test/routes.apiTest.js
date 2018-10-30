const supertest = require('supertest');
const assert = require('assert');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

const time = require('../utility/time');


let server = supertest.agent("http://localhost:8000");

const KEYPAIR = bitcoin.ECPair.makeRandom();
const ADDRESS = bitcoin.payments.p2pkh({pubkey: KEYPAIR.publicKey}).address;
function getSignature(message) {
    return bitcoinMessage.sign(message, KEYPAIR.privateKey, KEYPAIR.compressed).toString('base64');
}
let TIMESTAMP = null;
const STAR = {
    "dec": "-26° 29' 24.9",
    "ra": "16h 29m 1.0s",
    "story": "Found star using https://www.google.com/sky/",
};
let LATEST_BLOCK = 1;

const INVALID_ADDRESS = 'INVALIDSGbXjWKaAnYXbMpZ6sbrSAo3DpZ';


// copied so as to not import levelDB again (errs due to locked DB)
function getMessage(address, timestamp) {
    return `${address}:${timestamp}:starRegistry`;
}

/**
 * Testing requestValidation endpoint
 */
describe('POST /requestValidation', function() {
    it('Requesting for valid bitcoin address should work', function(done) {
        server
        .post('/requestValidation')
        .send({'address': ADDRESS})
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.address === ADDRESS);
            assert(res.body.message.startsWith(ADDRESS) &&
                   res.body.message.endsWith('starRegistry'));
            assert(res.body.timestamp <= time.now());
            TIMESTAMP = res.body.timestamp;
            assert(res.body.validationWindow > 0);
            done();
        });
    });
});

describe('POST /requestValidation', function() {
    it('Requesting for invalid bitcoin address should err', function(done) {
        server
        .post('/requestValidation')
        .send({'address': INVALID_ADDRESS})
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.error);
            done();
        });
    });
});

describe('POST /requestValidation', function() {
    it('Throw error for missing address key in POST', function(done) {
        server
        .post('/requestValidation')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.error);
            done();
        });
    });
});

/**
 * Testing validateSignature endpoint
 */
describe('POST /message-signature/validate', function() {
    it('Validating with invalid signature should err', function(done) {
        const address = ADDRESS;
        const timestamp = TIMESTAMP;
        const message = getMessage(address, timestamp);
        const signature = 'invalid';
        server
        .post('/message-signature/validate')
        .send({address, signature})
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.registerStar === false);
            assert(res.body.status.address === address);
            assert(res.body.status.requestTimeStamp === timestamp);
            assert(res.body.status.message === message);
            assert(res.body.status.validationWindow > 0);
            assert(res.body.status.messageSignature === 'invalid');
            done();
        });
    });
});

describe('POST /message-signature/validate', function() {
    it('Correct signature should work', function(done) {
        const address = ADDRESS;
        const timestamp = TIMESTAMP;
        const message = getMessage(address, timestamp);
        const signature = getSignature(message);
        server
        .post('/message-signature/validate')
        .send({address, signature})
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.registerStar === true);
            assert(res.body.status.address === address);
            assert(res.body.status.requestTimeStamp === timestamp);
            assert(res.body.status.message === message);
            assert(res.body.status.validationWindow > 0);
            assert(res.body.status.messageSignature === 'valid');
            done();
        });
    });
});

describe('POST /message-signature/validate', function() {
    it('Validating for invalid address should err', function(done) {
        const address = INVALID_ADDRESS;
        const signature = 'invalid';
        server
        .post('/message-signature/validate')
        .send({address, signature})
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.error);
            done();
        });
    });
});

describe('POST /message-signature/validate', function() {
    it('Throw error for missing keys in POST', function(done) {
        server
        .post('/message-signature/validate')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.error);
            done();
        });
    });
});

/**
 * Testing get a block (genesis block should always be there)
 */
describe('GET /block/:height', function() {
    it('GET genesis block (0) should work', function(done) {
        server
        .get('/block/0')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
            // console.log(res.body);
            assert.strictEqual(res.body.height, 0);
            assert.strictEqual(res.body.previousBlockHash, "");
            done();
        });
    });
});

describe('GET /block/:height', function() {
    it('Throw error for invalid height', function(done) {
        server
        .get('/block/9999')
        .expect('Content-Type', /json/)
        .expect(404)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.error);
            done();
        });
    });
});

/**
 * Testing block creation / star registration endpoint
 */
describe('POST /block', function() {
    it('Valid star registration should return newly created block', function(done) {
        const data = {
            "address": ADDRESS,
            "star": STAR,
        };
        server
        .post('/block')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.hash);
            assert(res.body.time >= TIMESTAMP);
            LATEST_BLOCK = res.body.height;
            assert(res.body.height >= 1);
            assert(res.body.body.address === data.address);
            assert(res.body.body.star.ra === data.star.ra);
            assert(res.body.body.star.dec === data.star.dec);
            assert(res.body.body.star.story === new Buffer(data.star.story).toString('hex'));
            assert(res.body.previousBlockHash);
            done();
        });
    });
});

describe('POST /block', function() {
    it('Invalid star should throw error', function(done) {
        const data = {
            "address": ADDRESS,
            "star": {
                "invalid": "This shouldn't work due to bad star object",
            }
        };
        server
        .post('/block')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.error);
            done();
        });
    });
});

describe('POST /block', function() {
    it('Unregistered address should throw error', function(done) {
        const data = {
            "address": bitcoin.payments.p2pkh({pubkey: bitcoin.ECPair.makeRandom().publicKey}).address,
            "star": STAR,
        };
        server
        .post('/block')
        .send(data)
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.error);
            done();
        });
    });
});

describe('POST /block', function() {
    it('Throw error for missing data in POST', function(done) {
        server
        .post('/block')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.error);
            done();
        });
    });
});

/**
 * Testing star lookup endpoints
 */
describe('GET /block/:height', function() {
    it('GET latest block should now work', function(done) {
        server
        .get(`/block/${LATEST_BLOCK}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
            // console.log(res.body);
            assert.strictEqual(res.body.height, LATEST_BLOCK);
            assert.strictEqual(res.body.body.address, ADDRESS);
            assert.strictEqual(res.body.body.star.dec, STAR.dec);
            assert.strictEqual(res.body.body.star.ra, STAR.ra);
            assert.strictEqual(res.body.body.star.storyDecoded, STAR.story);
            assert.strictEqual(res.body.body.star.story, new Buffer(STAR.story).toString('hex'));
            assert(res.body.previousBlockHash);
            done();
        });
    });
});

describe('GET /stars/address:address', function() {
    it('GET stars by address should work', function(done) {
        server
        .get(`/stars/address:${ADDRESS}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
            // console.log(res.body);
            assert(Array.isArray(res.body));
            assert(res.body.length >= 1);
            assert.strictEqual(res.body[0].body.address, ADDRESS);
            done();
        });
    });
});

describe('GET /stars/address:address', function() {
    it('GET stars by address should return empty for invalid address', function(done) {
        server
        .get(`/stars/address:${INVALID_ADDRESS}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
            // console.log(res.body);
            assert(Array.isArray(res.body));
            assert.strictEqual(res.body.length, 0);
            done();
        });
    });
});
