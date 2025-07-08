require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

async function uploadFileToPinata(filePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const data = new FormData();
  data.append('file', fs.createReadStream(filePath));

  try {
    const res = await axios.post(url, data, {
      maxBodyLength: 'Infinity', // this is needed to prevent axios from erroring out with large files
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });
    return res.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error.response?.data || error.message);
    throw error;
  }
}

async function uploadJSONToPinata(json) {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  try {
    const res = await axios.post(url, json, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
        'Content-Type': 'application/json',
      },
    });
    return res.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  try {
    // Upload image file first
    const imagePath = path.join(__dirname, 'metadata', 'quest_badge.png');
    const imageHash = await uploadFileToPinata(imagePath);
    console.log('✅ Image uploaded with IPFS hash:', imageHash);

    // Prepare metadata JSON with updated IPFS image link
    const metadata = {
      name: "Ender Hunter",
      description: "Awarded for defeating a Enderman",
      image: `ipfs://${imageHash}`
    };

    // Upload metadata JSON
    const metadataHash = await uploadJSONToPinata(metadata);
    console.log('✅ Metadata uploaded with IPFS hash:', metadataHash);

    // Final token URI you can use in your smart contract:
    const tokenURI = `ipfs://${metadataHash}`;
    console.log('🔗 Token URI:', tokenURI);

  } catch (error) {
    console.error('Failed to upload to Pinata:', error);
  }
}

main();
