/* ===== Persist data with LevelDB ===============================
|  Learn more: level: https://github.com/Level/level              |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);


const BLOCK_PREFIX = '_BLOCK_';
const ADDRESS_PREFIX = '_ADDRESS_';


function getKey(key) {
    return new Promise((resolve, reject) => {
        db.get(key, function(err, value) {
            if (err)
                reject(err);
            else
                resolve(value);
        });
    });
}


function addData(key, data) {
    return db.put(key, data);
}


function deleteKey(key) {
    return db.del(key);
}


// Get block from levelDB with given height
function getBlock(height) {
    return getKey(BLOCK_PREFIX + height);
}


// Add block data to levelDB at given height
function addBlock(height, data) {
    return addData(BLOCK_PREFIX + height, data);
}


// Get length of the blockChain from levelDB
function getChainLength() {
    return new Promise((resolve, reject) => {
        let chainLength = 0;

        db.createKeyStream().on('data', function(data) {
            if (typeof data === 'string' && data.startsWith(BLOCK_PREFIX)) {
                chainLength++;
            }
        }).on('error', function(err) {
            console.log('Unable to read key stream!', err);
            reject(err);
        }).on('close', function() {
            resolve(chainLength);
        });
    });
}


// Store the request status for a wallet address
function addAddressStatus(address, status) {
    return addData(ADDRESS_PREFIX + address, status);
}


// Get the request status for a wallet address
function getAddressStatus(address) {
    return getKey(ADDRESS_PREFIX + address);
}


// Forget the wallet address
function removeAddressStatus(address) {
    return deleteKey(ADDRESS_PREFIX + address);
}


module.exports = {
    getBlock,
    addBlock,
    getChainLength,
    addAddressStatus,
    getAddressStatus,
    removeAddressStatus,
}
