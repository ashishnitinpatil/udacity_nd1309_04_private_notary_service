/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const levelDB = require('../utility/level');
const Block = require('./block');


/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
	constructor() {
		var self = this;
		// Add a genesis block if blockChain is empty (height = -1)
		self.getBlockHeight().then(function(height) {
			if (height == -1) {
				self.addBlock(new Block("Genesis block")).then(
					() => console.log('Genesis block added'));
			}
		});
	}

	// Add new block
	async addBlock(newBlock) {
		const chainHeight = await this.getBlockHeight();
		// Block height
		newBlock.height = chainHeight + 1;
		// UTC timestamp
		newBlock.time = new Date().getTime().toString();
		// previous block hash
		if (chainHeight > -1) { // non genesis block
			const previousBlock = await this.getBlock(chainHeight);
			newBlock.previousBlockHash = previousBlock.hash;
		}
		// Block hash with SHA256 using newBlock and converting to a string
		newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
		// Adding block object to chain
		return await levelDB.addBlock(newBlock.height, JSON.stringify(newBlock));
	}

	// get latest block's height
	async getBlockHeight() {
		const chainLength = await levelDB.getChainLength();
		return chainLength - 1;
	}

	// get block at height
	async getBlock(blockHeight) {
		// return object as a single string
		return JSON.parse(await levelDB.getBlock(blockHeight));
	}

	// get chain (sorted blocks) from block height `from` to `upto`.
	async getChain(from=0, upto=null) {
		from = parseInt(from);
		upto = parseInt(upto);
		let chainHeight = await this.getBlockHeight();
		if (isNaN(from) || from < 0 || from > chainHeight) {
			from = chainHeight;
		}
		if (isNaN(upto) || upto < 0) {
			upto = chainHeight;
		} else if (upto > chainHeight) {
			upto = chainHeight;
		}

		const chain = [];
		for (let i = from; i <= upto; i++) {
			chain.push(await this.getBlock(i));
		}
		return chain;
	}

	// validate block
	async validateBlock(blockHeight) {
		// get block object
		let block = await this.getBlock(blockHeight);
		// get block hash
		let blockHash = block.hash;
		// remove block hash to test block integrity
		block.hash = '';
		// generate block hash
		let validBlockHash = SHA256(JSON.stringify(block)).toString();
		// Compare
		if (blockHash === validBlockHash) {
			return true;
		} else {
			console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash +
				'<>' +
				validBlockHash);
			return false;
		}
	}

	// Validate blockchain
	async validateChain() {
		let errorLog = [];
		let previousBlock, currentBlock;
		const chainLength = await levelDB.getChainLength();

		for (let i = 0; i < chainLength; i++) {
			// validate block
			if (!await this.validateBlock(i)) errorLog.push(i);
			// compare blocks hash link
			currentBlock = await this.getBlock(i);
			console.log(currentBlock);
			if (i > 0) {
				if (currentBlock.previousBlockHash !== previousBlock.hash) {
					errorLog.push(i);
				}
			}
			previousBlock = currentBlock;
		}
		if (errorLog.length > 0) {
			console.log('\nBlock errors = ' + errorLog.length);
			console.log('\tBlocks: ' + errorLog);
		} else {
			console.log('\nChain validated. No errors detected.');
		}
	}
}


module.exports = new Blockchain();


/* ===== Testing ===========================================
|  Instantiate a new chain, add blocks to it, then validate |
|  ========================================================*/

function testSimpleChain() {
	let testchain = new Blockchain();

	testchain.getBlockHeight().then(function(h) {
		console.log(`\nExisting block height ${h}\n`);
		testchain.addBlock(new Block(`Test block #${h+1}`))
			.then(() => testchain.addBlock(new Block(`Test block #${h+2}`)))
			.then(() => testchain.addBlock(new Block(`Test block #${h+3}`)))
			.then(() => testchain.addBlock(new Block(`Test block #${h+4}`)))
			.then(() => testchain.addBlock(new Block(`Test block #${h+5}`)))
			.then(() => testchain.addBlock(new Block(`Test block #${h+6}`)))
			.then(() => testchain.addBlock(new Block(`Test block #${h+7}`)))
			.then(() => testchain.addBlock(new Block(`Test block #${h+8}`)))
			.then(() => testchain.validateChain())
			.then(() => testchain.getBlockHeight().then(h => console.log(
				`\nNew block height ${h}\n`)));
	});
}

// testSimpleChain();
