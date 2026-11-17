// KOJO PAY Backend - Render Web Service
// Env Vars are set in Render Dashboard, NOT in code
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 10000;
const FLW_SECRET = process.env.FLW_SECRET_KEY;
const FLW_PUBLIC = process.env.FLW_PUBLIC_KEY;
const FLW_ENCRYPTION = process.env.FLW_ENCRYPTION_KEY;
const FRONTEND_URL = process.env.KOJO_FRONTEND_URL || "https://kojopay-frontend.onrender.com";

// CORS - Allow only your frontend
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5500", "http://127.0.0.1:5500"],
  methods: ["GET","POST"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.use(express.json());

// Health check for Render
app.get('/', (req,res)=> res.json({ status: "KOJO PAY Backend Running", app: "KOJO PAY" }));

// IMPORTANT: Frontend calls this to get PUBLIC key from Env Var
// Secret key is NEVER sent here
app.get('/api/config', (req,res)=>{
  res.json({
    publicKey: FLW_PUBLIC || "",
    appName: "KOJO PAY",
    currency: "NGN"
  });
});

app.get('/api/balance', async (req,res)=>{
  res.json({ balance: "0.00", transactions: [] });
});

app.post('/api/send', async (req,res)=>{
  const { amount, account, bankCode } = req.body;
  if(!FLW_SECRET) return res.status(500).json({ error: "FLW_SECRET_KEY not set in Render Env Vars" });
  try {
    const response = await axios.post('https://api.flutterwave.com/v3/transfers', {
      account_bank: bankCode,
      account_number: account,
      amount: amount,
      currency: "NGN",
      reference: "kojopay-" + Date.now(),
      narration: "KOJO PAY Transfer"
    }, { headers: { Authorization: `Bearer ${FLW_SECRET}` } });
    res.json(response.data);
  } catch(e){ res.status(400).json(e.response?.data || { error: e.message }); }
});

app.post('/api/verify-payment', async (req,res)=>{
  const { id } = req.body;
  try {
    const verify = await axios.get(`https://api.flutterwave.com/v3/transactions/${id}/verify`,
      { headers: { Authorization: `Bearer ${FLW_SECRET}` } });
    res.json(verify.data);
  } catch(e){ res.status(400).json(e.response?.data || { error: e.message }); }
});

// Flutterwave Webhook - set KOJO_WEBHOOK_SECRET in Render
app.post('/api/webhook', (req,res)=>{
  // Verify signature in production using secret hash
  console.log("Webhook received:", req.body);
  res.sendStatus(200);
});

app.listen(PORT, ()=> console.log(`KOJO PAY backend running on port ${PORT}`));
