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
            assert(res.body.timestamp <= time.getCurrentTimestamp());
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
        .send({'address': 'INVALIDSGbXjWKaAnYXbMpZ6sbrSAo3DpZ'})
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
    it('Correct validation should work', function(done) {
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
    it('Requesting for invalid bitcoin address should err', function(done) {
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
    it('Validating for invalid bitcoin address should err', function(done) {
        const address = 'INVALIDSGbXjWKaAnYXbMpZ6sbrSAo3DpZ';
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
