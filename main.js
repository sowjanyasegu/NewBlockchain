const { BlockChain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const mykey = ec.keyFromPrivate('52706b331670df5b0594411172b94a20b214e6cafc6327448960335445513c5e');
const myWalletAddress = mykey.getPublic('hex');

let myBlockChain = new BlockChain();
const tx1 = new Transaction(myWalletAddress, 'B-address', 30);
tx1.signTransaction(mykey);

myBlockChain.addTransaction(tx1);
console.log("mining block....")
myBlockChain.minePendingTransactions(myWalletAddress);

console.log(JSON.stringify(myBlockChain, null, 4));
console.log(myBlockChain.getBalance(myWalletAddress));
//'https://www.youtube.com/watch?v=kWQ84S13-hw'