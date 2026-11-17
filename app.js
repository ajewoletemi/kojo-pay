// KOJO PAY - Frontend
// Gets FLW_PUBLIC_KEY from backend /api/config (which reads Render Env Var)
// Never hardcode secret keys here.

let FLW_PUBLIC_KEY = "";
let BACKEND_URL = ""; // Leave empty if frontend + backend on same domain, or set to your backend URL

// Auto-detect backend URL on Render
// If you deploy frontend and backend separately, set this:
if (window.location.hostname.includes('onrender.com')) {
  // CHANGE THIS to your real backend URL after deploy
  BACKEND_URL = "https://kojopay-backend.onrender.com";
}

async function getConfig() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/config`);
    const data = await res.json();
    FLW_PUBLIC_KEY = data.publicKey;
    console.log("KOJO PAY config loaded");
  } catch(e) {
    console.warn("Using fallback - set BACKEND_URL in app.js");
    FLW_PUBLIC_KEY = "FLWPUBK_TEST-xxxxxxxx-X"; // fallback for local test only
  }
}

async function loadDashboard(){
  const data = {
    balance: "262,000.12",
    transactions: [
      { narration: "Transfer from John D.", amount: "+ ₦50,000.00", type: "plus", date: "Today • 10:24 AM" },
      { narration: "Airtime - MTN", amount: "- ₦5,000.00", type: "minus", date: "Yesterday • 6:10 PM" },
      { narration: "Deposit via Flutterwave", amount: "+ ₦100,000.00", type: "plus", date: "Nov 15 • 2:00 PM" },
    ]
  };
  document.getElementById('balance').innerText = data.balance;
  document.getElementById('history').innerHTML = data.transactions.map(t => `
    <div class="txn">
      <div><b>${t.narration}</b><br><span>${t.date}</span></div>
      <div class="${t.type === 'plus' ? 'amt-plus' : 'amt-minus'}">${t.amount}</div>
    </div>
  `).join('');
}

async function depositWithFlutterwave(){
  if(!FLW_PUBLIC_KEY) await getConfig();
  FlutterwaveCheckout({
    public_key: FLW_PUBLIC_KEY,
    tx_ref: "kojopay-" + Date.now(),
    amount: 5000,
    currency: "NGN",
    payment_options: "card,banktransfer,ussd",
    customer: { email: "user@example.com", name: "Kojo Pay User" },
    callback: function(data){
      fetch(`${BACKEND_URL}/api/verify-payment`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id: data.transaction_id}) })
      loadDashboard();
      alert("Payment verified");
    },
    customizations: { title: "KOJO PAY", description: "Wallet Funding", logo: "https://yourdomain.com/logo-gold.png" }
  });
}

function openSend(){
  const amount = prompt("Amount to send (NGN)?");
  const account = prompt("Recipient Account Number?");
  const bankCode = prompt("Bank Code? e.g 044 for Access, 058 for GTB");
  if(!amount || !account) return;
  fetch(`${BACKEND_URL}/api/send`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({amount, account, bankCode})
  }).then(()=> loadDashboard());
}

// Init
getConfig().then(()=> loadDashboard());
