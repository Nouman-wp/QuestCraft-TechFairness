require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const { ethers } = require('ethers');
const questAbi = require('./abi/QuestBadge.json').abi;
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const questBadgeContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, questAbi, wallet);
const mintRoute = require('./routes/mint');
app.use(cors());
app.use(express.json());
app.use('/api', mintRoute);
const PORT = process.env.PORT || 3000;
// Test route
app.get('/', (req, res) => {
  res.send('Minecraft Quest Backend API is running!');
});
// POST /generate-quest
app.post('/generate-quest', async (req, res) => {
  try {
    const prompt = `
Generate a [Only 1] Minecraft quest in **valid JSON** format only. No explanation, no markdown. Output ONLY the JSON object.

Format:
{
  "title": "string",
  "description": "string",
  "objective": [
    { "type": "collect" | "craft" | "defeat", "item": "string", "amount": number }
  ]
}

Example:
{
  "title": "Diamond Collector",
  "description": "Collect 10 diamonds to complete this quest.",
  "objective": [
    { "type": "collect", "item": "diamond", "amount": 10 }
  ]
}

Now generate a creative Real In-Game Minecraft quest [kill 1 enderman].
`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3-haiku',
        messages: [
          { role: 'system', content: 'You are a Minecraft quest generator.' },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://localhost',
          'Content-Type': 'application/json'
        }
      }
    );
    const questText = response.data.choices[0].message.content;

// Extract JSON block using regex
const jsonMatch = questText.match(/{[\s\S]*}/);

let questJSON;
try {
  if (!jsonMatch) throw new Error('No JSON block found in response');
  questJSON = JSON.parse(jsonMatch[0]);
} catch (parseError) {
  console.error('Failed to parse quest JSON:', parseError);
  return res.status(500).json({ error: 'Failed to parse quest JSON' });
}

    res.json(questJSON);
  } catch (error) {
    console.error('OpenRouter error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate quest' });
  }

});

// POST /submit-quest
app.post('/submit-quest', async (req, res) => {
  console.log("Received quest submission:", req.body);
  const { playerName, playerWallet, questTitle, completedAt } = req.body;

  console.log(`[✔] ${playerName} completed '${questTitle}' at ${completedAt}`);

  const tokenURI = `ipfs://Qma3CL3McKuGFVD6hooov9AYhqbSnYWzUaziRhr5scGjGA`; // You can later dynamically assign this

  try {
    const tx = await questBadgeContract.mintBadge(playerWallet, tokenURI);
    await tx.wait();

    res.status(200).json({ message: "Quest completion recorded and SBT minted!", txHash: tx.hash });
  } catch (err) {
    console.error("Minting failed:", err);
    res.status(500).json({ error: "Minting failed", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
