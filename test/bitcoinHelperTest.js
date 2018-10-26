const supertest = require('supertest');
const assert = require('assert');
const bitcoin = require('../bitcoinHelper');


describe('Test validateAddress', function() {
    it('Return correct boolean for "is valid bitcoin address"', function() {
        assert(bitcoin.validateAddress('142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ'));
        assert(!bitcoin.validateAddress('invalid wallet address'));
    });
});


describe('Test verifySignature', function() {
    it('Return correct boolean for message signature verification', function() {
        assert(bitcoin.verifySignature(
            '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532330740:starRegistry',
            '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ',
            'IJtpSFiOJrw/xYeucFxsHvIRFJ85YSGP8S1AEZxM4/obS3xr9iz7H0ffD7aM2vugrRaCi/zxaPtkflNzt5ykbc0='
        ));
        assert(!bitcoin.verifySignature(
            '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532330740:starRegistry',
            '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ',
            'INVALIDOJrw/xYeucFxsHvIRFJ85YSGP8S1AEZxM4/obS3xr9iz7H0ffD7aM2vugrRaCi/zxaPtkflNzt5ykbc0='
        ));
        assert(!bitcoin.verifySignature(
            'INVALIDSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532330740:starRegistry',
            '142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ',
            'IJtpSFiOJrw/xYeucFxsHvIRFJ85YSGP8S1AEZxM4/obS3xr9iz7H0ffD7aM2vugrRaCi/zxaPtkflNzt5ykbc0='
        ));
        assert(!bitcoin.verifySignature(
            'Bad Message',
            'Bad Wallet Addr',
            'INVALID Sig'
        ));
    });
});
