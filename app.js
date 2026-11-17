// ONLY PUBLIC KEY HERE - From Flutterwave Dashboard > Settings > API Keys > Test Mode
const FLW_PUBLIC_KEY = "FLWPUBK_TEST-xxxxxxxx-X";

async function loadDashboard(){
  // Production: const res = await fetch('/api/balance'); const data = await res.json();
  // Demo data for preview:
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

function depositWithFlutterwave(){
  // Opens Flutterwave SECURE checkout - you NEVER collect card numbers
  FlutterwaveCheckout({
    public_key: FLW_PUBLIC_KEY,
    tx_ref: "kojopay-" + Date.now(),
    amount: 5000,
    currency: "NGN",
    payment_options: "card,banktransfer,ussd",
    customer: { email: "user@example.com", name: "Kojo Pay User" },
    callback: function(data){
      fetch('/api/verify-payment', { method:'POST', body: JSON.stringify({id: data.transaction_id}) })
      loadDashboard();
      alert("Payment verified");
    },
    customizations: {
      title: "KOJO PAY",
      description: "Wallet Funding",
      logo: "https://yourdomain.com/logo-gold.png"
    }
  });
}

function openSend(){
  const amount = prompt("Amount to send (NGN)?");
  const account = prompt("Recipient Account Number?");
  const bankCode = prompt("Bank Code? e.g 044 for Access, 058 for GTB");
  if(!amount || !account) return;
  fetch('/api/send', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({amount, account, bankCode})
  }).then(()=> loadDashboard());
}

loadDashboard();
