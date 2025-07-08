const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const questAbi = require('../abi/QuestBadge.json').abi;


const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, questAbi, wallet);

router.post('/mint', async (req, res) => {
  const { playerWallet, tokenURI } = req.body;

  try {
    const tx = await contract.mintBadge(playerWallet, tokenURI);
    await tx.wait();
    res.status(200).json({ message: "Badge minted!", txHash: tx.hash });
  } catch (err) {
    console.error("Error minting:", err);
    res.status(500).json({ error: "Minting failed", details: err.message });
  }
});

module.exports = router;
