const supertest = require('supertest');
const assert = require('assert');


let server = supertest.agent("http://localhost:8000");

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
 * Testing block creation endpoint
 */
describe('POST /block', function() {
    it('POST valid block should return newly created block', function(done) {
        server
        .post('/block')
        .send({'body': 'New test block'})
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
            // console.log(res.body);
            assert(res.body.height >= 1);
            assert(res.body.body === 'New test block');
            assert(res.body.previousBlockHash);
            done();
        });
    });
});

describe('POST /block', function() {
    it('Throw error for empty body key in POST', function(done) {
        server
        .post('/block')
        .send({'body': ''})
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
    it('Throw error for missing body key in POST', function(done) {
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
