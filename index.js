const Blockchain= require("./blockchain");
const kaymoney = new Blockchain();
const uuid=require('uuid');
const nodeAddress=uuid.v1().split('-').join('');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
/* app.use(express.json()); */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
let transactions=[];


app.get('/', (req, res) => {
    res.send("Welcome to lab 7")
})
app.get('/blockchain', function (req, res) {
   res.send(kaymoney);
});

app.post('/transaction', function(req, res) {
    console.log(req.body);
    res.send(`The amount of the transaction is ${req.body.amount} kaymoney.`);
    const blockIndex = kaymoney.createNewTransaction(req.body.amount,
        req.body.sender, req.body.recipient);
    transactions.push(blockIndex);
    res.json({ note:`Transaction will be added in block ${blockIndex}.`});    
     /* res.status(201).send({
        message: 'Transaction added successfully',
        transaction: newTransaction,
    });  */
});
 app.get('/transaction', function(req, res) {
    res.send(transactions);
});
//Lab 6
app.get('/mine', function(req, res) {
    
    const lastBlock=kaymoney.getLastBlock();
    const previousBlockHash=lastBlock['hash'];
    const currentBlockData={
        transactions:kaymoney.pendingTransaction,
        index:lastBlock['index'] +1
    };
    const nonce=kaymoney.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash=kaymoney.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock=kaymoney.createNewBlock(nonce, previousBlockHash,blockHash);
    res.json({note:"New Block mined successfully",
        block: newBlock
    });
    kaymoney.createNewTransaction(12.5, "0,0", nodeAddress)
});

app.listen(3000, function(res, req){
console.log("listening on port 3000…");
});