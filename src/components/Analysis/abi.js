 export const  ABIWINERY = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "winery",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "ebool",
          "name": "isOrganic",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "publicData",
          "type": "string"
        }
      ],
      "name": "WineAdded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "winery",
          "type": "string"
        },
        {
          "internalType": "einput",
          "name": "copperEncrypted",
          "type": "bytes32"
        },
        {
          "internalType": "einput",
          "name": "leadEncrypted",
          "type": "bytes32"
        },
        {
          "internalType": "einput",
          "name": "cadmiumEncrypted",
          "type": "bytes32"
        },
        {
          "internalType": "einput",
          "name": "arsenicEncrypted",
          "type": "bytes32"
        },
        {
          "internalType": "einput",
          "name": "zincEncrypted",
          "type": "bytes32"
        },
        {
          "internalType": "einput",
          "name": "volatileAcidityEncrypted",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "publicData",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "addWine",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint64",
          "name": "decryptedInput",
          "type": "uint64"
        }
      ],
      "name": "callbackCounter",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "desencryptedIsOrganicValue",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getDecryptedIsOrganic",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "getWine",
      "outputs": [
        {
          "internalType": "string",
          "name": "winery",
          "type": "string"
        },
        {
          "internalType": "euint128",
          "name": "copper",
          "type": "uint256"
        },
        {
          "internalType": "euint128",
          "name": "lead",
          "type": "uint256"
        },
        {
          "internalType": "euint128",
          "name": "cadmium",
          "type": "uint256"
        },
        {
          "internalType": "euint128",
          "name": "arsenic",
          "type": "uint256"
        },
        {
          "internalType": "euint128",
          "name": "zinc",
          "type": "uint256"
        },
        {
          "internalType": "ebool",
          "name": "isOrganic",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "publicData",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "requestDecryption",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]

  export default ABIWINERY