const express = require('express');
const uuid = require('uuid')
const nodeAddress = uuid.v1().split(".").join(" ")
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.get('/blockchain', function (req, res) {
});
app.post('/transaction', function (req, res) {
});
app.get('/mine', function (req, res) {
    const lastBlock = kachi.getLastBlock()
    const previousBlockHash = lastBlock(hash)
    const currentBlockData = {
        transaction: kachi
    }
});
app.post('/transaction', function (req, res) {
    const blockIndex =
        veroin.createNewTransaction(req.body.amount,
            req.body.sender, req.body.recipient)
    res.json({
        note: `Transaction will be added in block
${blockIndex}.`
    });
});

app.listen(3000, function (res, req) {
    console.log("listening on port 3000… ");
});