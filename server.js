// npm install express axios dotenv
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const FLW_SECRET = process.env.FLW_SECRET_KEY; // FLWSECK_TEST-xxx - Set in Render > Environment Variables

app.get('/api/balance', async (req,res)=>{
  res.json({ balance: "0.00", transactions: [] });
});

app.post('/api/send', async (req,res)=>{
  const { amount, account, bankCode } = req.body;
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
  } catch(e){ res.status(400).json(e.response.data); }
});

app.post('/api/verify-payment', async (req,res)=>{
  const { id } = req.body;
  const verify = await axios.get(`https://api.flutterwave.com/v3/transactions/${id}/verify`,
    { headers: { Authorization: `Bearer ${FLW_SECRET}` } });
  res.json(verify.data);
});

app.listen(3000, ()=> console.log("KOJO PAY backend running"));
