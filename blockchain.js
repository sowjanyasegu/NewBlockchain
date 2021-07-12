const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }
    signTransaction(signingKey) {
        console.log(signingKey.getPublic('hex'));
        console.log(this.fromAddress);
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets');
        }
        console.log('address valid');
        const hashTx = this.calculateHash();
        console.log('Txn hash calculated2', hashTx);
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
        //const sig = signingKey.sign(hashTx);
        //this.signature = sig.toDER('hex');
        console.log('signature generated');


    }
    isValid() {
        if (this.fromAddress === null) return true;
        if (!this.signature || this.signature.length === 0) {
            throw new Error('There is no signature in this transaction');
        }
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(timestamp, transactions, previousHash) {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }
    calculateHash() {
        return SHA256(this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce).toString();
    }
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined " + this.hash);
    }
    hasValidTransactions() {
        for (const tx of this.pendingTransactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
}

class BlockChain {
    constructor() {
        this.difficulty = 1;
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    createGenesisBlock() {
        return new Block("10/Jul/2021", "Genesis Block", "0");
    }
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    minePendingTransactions(miningRewardAddress) {
        let miningRewardTransaction = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(miningRewardTransaction);
        console.log(this.pendingTransactions);
        let previousHash = this.chain[this.chain.length - 1].hash;
        let block = new Block(Date.now(), this.pendingTransactions, previousHash);
        block.mineBlock(this.difficulty);
        console.log('block successfully mined');
        this.chain.push(block);
        this.pendingTransactions = [];
    }
    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }
        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transactions to chain');
        }
        this.pendingTransactions.push(transaction);
    }

    getBalance(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;

    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if (currentBlock.hash != currentBlock.calculateHash()) {
                return false;
            }
            if (currentBlock.previousHash != previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;