const express = require('express'); 
const app = express();
const uuid = require('uuid')
const Blockchain = require('./blockchain');
const kaymoney = new Blockchain();
const nodeAddress = uuid.v1().split("-").join("")
const port = process.argv[2] || 3000
console.log(a=process.argv)
const bodyParser = require('body-parser');
const rp = require('request-promise');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.use(express.static('public')); // Ensure this line is present


// GET /blockchain

app.get("/", function (req, res) {
    res.render('index');       
});
app.get("/blockchain", function (req, res) {
    res.render("blockchain", { blockchain: kaymoney })
})

// POST /transaction
app.post('/transaction', function(req, res) {
  const blockIndex = JSON.stringify(kaymoney.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient))
    //   res.json({note:`Transaction will be added in block ${blockIndex}`})
    res.redirect("/blockchain")
});

// GET /mine
app.get('/mine', function(req, res) {
    const lastBlock = kaymoney.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: kaymoney.pendingTransactions,
        index: lastBlock['index'] + 1
    };
    const nonce = kaymoney.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = kaymoney.hashBlock(previousBlockHash, currentBlockData, nonce);
    const newBlock = kaymoney.createNewBlock(nonce, previousBlockHash, blockHash);
    kaymoney.createNewTransaction(12.5, "00", nodeAddress);
    // res.json({
    //     note: "New block mined successfully",
    //     block: newBlock
    // });
    res.render('mine', { block: newBlock });
});

app.get('/register', (req, res) => {
    res.render('register');
});


// // register a node and broadcast it to the network
// app.post('/register-and-broadcast',function(req,res){
//     const newNodeUrl =req.body.newNodeUrl;
//     if(kaymoney.networkNodes.indexOf(newNodeUrl)==-1){
//         kaymoney.networkNodes.push(newNodeUrl)
//     }
//     const regNodesPromises = [];
//     kaymoney.networkNodes.forEach(networkNodeUrl =>{
//         const requestOptions = {
//             url: networkNodeUrl + '/register-node',
//             method: 'POST',
//             body: {newNodeUrl:newNodeUrl},
//             json: true
//         };
//         regNodesPromises.push(rp(requestOptions))
//     });
//     Promise.all(regNodesPromises).then(data=>{
//         const bulkRegisterOptions = {
//             url: newNodeUrl + '/register-nodes-bulk',
//             method: 'POST',
//             body: {allNetworkNodes: [kaymoney.networkNodes, kaymoney.currentNodeUrl]},
//             json: true
//         };
//         return rp(bulkRegisterOptions);
//     })
//     .then(data=>{
//         res.json({note: 'new node registered with network successfully'});
//     });
// });




app.post('/register-and-broadcast', function (req, res) {
    const newNodeUrl = req.body.newNodeUrl;

    // Check if the node is already in the list of registered nodes
    if (kaymoney.networkNodes.indexOf(newNodeUrl) === -1) {
        kaymoney.networkNodes.push(newNodeUrl);  // Add the new node to the list
    }

    // Prepare the request promises to register this node with other nodes in the network
    const regNodesPromises = kaymoney.networkNodes.map(networkNodeUrl => {
        const requestOptions = {
            url: `${networkNodeUrl}/register-node`,
            method: 'POST',
            body: { newNodeUrl: newNodeUrl },
            json: true
        };
        return rp(requestOptions);
    });
    console.log(kaymoney.networkNodes)
    console.log(newNodeUrl);
    
    // Execute all promises
    Promise.all(regNodesPromises)
        .then(() => {
            // Now that other nodes are registered, broadcast all nodes
            console.log("hello");
            
            const bulkRegisterOptions = {
                url: `${newNodeUrl}/register-nodes-bulk`,
                method: 'POST',                
                body: { allNetworkNodes: [...kaymoney.networkNodes, kaymoney.currentNodeUrl] },
                json: true
            };
            console.log(kaymoney.currentNodeUrl);
            
            return rp(bulkRegisterOptions);   
            
        })
        .then(() => {
            // Respond once the registration is complete
            // res.json({ note: 'New node registered with network successfully' });
            res.redirect("/blockchain")
        })
        .catch((error) => {
            // Handle any error that occurs during registration
            console.error(error);
            res.status(500).json({ error: 'There was an error registering the node' });
        });
});


// register a node with the network
app.post('/register-node', function(req,res){
    const newNodeUrl = req.body.newNodeUrl;
    const broadcast = req.body.broadcast;

    
    const nodeNotAlreadyPresent = kaymoney.networkNodes.indexOf(newNodeUrl) == -1
    const notCurrentNode = kaymoney.currentNodeUrl !== newNodeUrl;
    if(nodeNotAlreadyPresent && notCurrentNode){
        kaymoney.networkNodes.push(newNodeUrl);
    };
    // res.json({note:'New node registered successfully'})
    if (broadcast) {
        res.redirect("/blockchain")  
    } else {
        res.status(200).json({ message: 'Node registered successfully' });
    }
    
    
});
// register multiple nodes at once
app.post('/register-nodes-bulk', function (req, res) {    
    let allNetworkNodes = req.body.allNetworkNodes;
    const broadcast = req.body.broadcast;
    if (!Array.isArray(allNetworkNodes)) {
        if (typeof allNetworkNodes === 'string') {
            // Split by comma and trim whitespace
            allNetworkNodes = allNetworkNodes.split(',').map(url => url.trim());
        } else {
            return res.status(400).json({ error: 'Invalid data format. Expected an array or comma-separated string of network nodes.' });
        }
    }   
    allNetworkNodes.forEach(networkNodeUrl=>{
        const nodeNotAlreadyPresent= kaymoney.networkNodes.indexOf(networkNodeUrl)==-1;
        const notCurrentNode = kaymoney.currentNodeUrl !== networkNodeUrl;
        if(nodeNotAlreadyPresent && notCurrentNode) kaymoney.networkNodes.push(networkNodeUrl);
        console.log("registering");
        
    });
    // res.json({note: 'Bulk registration successful'})
    if (broadcast) {
        res.redirect("/blockchain")
    } else {
        res.status(200).json({ message: 'Node registered successfully' });
    }
});

// Start the server on port 3000
app.listen(port, function() {
    console.log(`Listening on port ${port}...`);
});
