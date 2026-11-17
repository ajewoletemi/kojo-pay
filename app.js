// KOJO PAY - Frontend
let FLW_PUBLIC_KEY = "";
let BACKEND_URL = "https://kojopay-backend.onrender.com";

async function getConfig() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/config`);
    const data = await res.json();
    FLW_PUBLIC_KEY = data.publicKey || "";
    console.log("KOJO PAY key loaded:", FLW_PUBLIC_KEY ? "YES" : "EMPTY - Check Render Env Vars");
  } catch(e) {
    const errEl = document.getElementById('deposit-error');
    if(errEl) errEl.innerText = "Cannot connect to backend. Check Render backend is live.";
    console.error(e);
  }
}

function closeAll(){
  document.querySelectorAll('.modal').forEach(m=> m.style.display='none');
}
function openTab(name){
  closeAll();
  const el = document.getElementById('modal-'+name);
  if(el) el.style.display='flex';
  const errEl = document.getElementById('deposit-error');
  if(errEl) errEl.innerText = "";
}

async function doDeposit(){
  if(!FLW_PUBLIC_KEY) await getConfig();
  if(!FLW_PUBLIC_KEY || FLW_PUBLIC_KEY.includes("xxxx")){
    document.getElementById('deposit-error').innerText = "Flutterwave Public Key not set in Render Backend Environment. Go to Render > kojopay-backend > Environment > FLW_PUBLIC_KEY";
    return;
  }
  const amount = document.getElementById('deposit-amount').value || 5000;
  FlutterwaveCheckout({
    public_key: FLW_PUBLIC_KEY,
    tx_ref: "kojopay-" + Date.now(),
    amount: Number(amount),
    currency: "NGN",
    payment_options: "card,banktransfer,ussd",
    customer: { email: "user@example.com", name: "Kojo Pay User" },
    callback: function(data){
      closeAll();
      alert("Payment successful! Verifying...");
      fetch(`${BACKEND_URL}/api/verify-payment`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id: data.transaction_id}) }).then(()=> loadDashboard());
    },
    onclose: function(){},
    customizations: { title: "KOJO PAY", description: "Wallet Funding" }
  });
}

async function doSend(){
  const amount = document.getElementById('send-amount').value;
  const account = document.getElementById('send-account').value;
  const bankCode = document.getElementById('send-bank').value;
  if(!amount || !account) return alert("Fill amount and account");
  try{
    const res = await fetch(`${BACKEND_URL}/api/send`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({amount, account, bankCode}) });
    const data = await res.json();
    closeAll();
    alert(data.message || "Transfer request sent - check Flutterwave dashboard");
    loadDashboard();
  }catch(e){ alert("Cannot connect to backend. Is kojopay-backend live on Render?"); }
}

async function doAirtime(){
  const phone = document.getElementById('airtime-phone').value;
  const amount = document.getElementById('airtime-amount').value;
  const network = document.getElementById('airtime-network').value;
  if(!phone || !amount) return alert("Fill phone and amount");
  alert(`Airtime order: ${network} - ${amount} to ${phone}\n\nConnect Flutterwave Bill Payment in backend to make this real.`);
  closeAll();
}

async function loadDashboard(){
  const data = { balance: "262,000.12", transactions: [
    { narration: "Transfer from John D.", amount: "+ ₦50,000.00", type: "plus", date: "Today • 10:24 AM" },
    { narration: "Airtime - MTN", amount: "- ₦5,000.00", type: "minus", date: "Yesterday • 6:10 PM" },
    { narration: "Deposit via Flutterwave", amount: "+ ₦100,000.00", type: "plus", date: "Nov 15 • 2:00 PM" },
  ]};
  const bal = document.getElementById('balance');
  if(bal) bal.innerText = data.balance;
  const hist = document.getElementById('history');
  if(hist) hist.innerHTML = data.transactions.map(t => `<div class="txn"><div><b>${t.narration}</b><br><span>${t.date}</span></div><div class="${t.type==='plus'?'amt-plus':'amt-minus'}">${t.amount}</div></div>`).join('');
}

function depositWithFlutterwave(){ openTab('deposit'); }
function openSend(){ openTab('send'); }

getConfig().then(()=> loadDashboard());
