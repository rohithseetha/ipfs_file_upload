const express = require('express')
const app = express()

const fs =require('fs');

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

const Web3 = require('web3');

// console.log(Web3);

const web3 = new Web3("https://ropsten.infura.io/v3/37ce477e00c14a8390548738542dd9aa");
                        // wss://ropsten.infura.io/ws/v3/37ce477e00c14a8390548738542dd9aa
// console.log(web3);
const account = "0xfc6448AA384E6ca33e64023C2a0b18f6a69423ad";//metmask account(ethereum Compatible public key;
var pkey ="a20ab37c47fb882b45231be038e2f57f48a21e133cddaa9db260319658a3b283"//privatekey of your account;

const contractAddress = "0x56E82a2B9Feaf4eD4834a2c104e42D3E362A4662";

const abi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_word",
				"type": "string"
			}
		],
		"name": "setWord",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "newstate",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "changer",
				"type": "address"
			}
		],
		"name": "wordEvent",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "getWord",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];//abi of the contract from remix

var myContract = new web3.eth.Contract(abi, contractAddress);

console.log(myContract);
console.log('app is runing')


 
app.get('/', function (req, res) {
//   res.send('Hello World')
    res.sendFile(__dirname+'/public/index.html');
})

app.post('/profile', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    console.log(req.file);
    var data = new Buffer(fs.readFileSync(req.file.path));
    ipfs.add(data, function (err,file){
        if(err){
            console.log(err);
        }
        console.log(file);
        uploadFileHash(file[0].hash);

        res.send(file[0].hash);
    })

  })

  app.get('/download/:ID',function(req,res){
      console.log(req.params.ID);
      console.log(downloadhash());
    //   res.redirect('https://ipfs.io/ipfs/'+req.params.ID);
    downloadhash((result)=>{
        res.redirect('https://ipfs.io/ipfs/'+result);
    })
     
  })
 


function downloadhash(callback){
    console.log("Inside Download")
    myContract.methods.getWord().call({from:account})
    .then(function(result){
        console.log(result);
        return callback(result);
    })
    console.log('****************')
}
function uploadFileHash(hashfile){
    var encodedData = myContract.methods.setWord(hashfile).encodeABI();
    console.log(encodedData);
  let transactionObject = {
    gas: "470000",
    data: encodedData,
    from: account,
    to: contractAddress
  };

  web3.eth.accounts.signTransaction(transactionObject, pkey, function(
    err,
    trans
  ) {
    if (err) {
      console.log(err);
    }
    console.log(trans);
    web3.eth
      .sendSignedTransaction(trans.rawTransaction)
      .on("receipt",function(result){
          console.log(result);
        //   res.send(result.blockHash);
      });
  });
}

app.listen(3000)