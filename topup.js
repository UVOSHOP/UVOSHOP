// Initialization same as script.js
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let games;
fetch('games.json')
  .then(res => res.json())
  .then(data => {
    games = data;
    const select = document.getElementById('gameSelect');
    data.forEach(g => select.add(new Option(g.name, g.id)));
    updatePrices(data[0].id);
    select.onchange = e => updatePrices(e.target.value);
  });

function updatePrices(gameId) {
  const priceGrid = document.getElementById('priceGrid');
  priceGrid.innerHTML = '';
  const game = games.find(g => g.id === gameId);
  game.prices.forEach(p => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `<p>${p.amount}</p><p>Rp ${p.price.toLocaleString()}</p>`;
    card.onclick = () => {
      document.getElementById('userId').dataset.amount = p.amount;
      document.getElementById('userId').dataset.price = p.price;
    };
    priceGrid.appendChild(card);
  });
}

document.getElementById('buyBtn').onclick = () => {
  const gameId = document.getElementById('gameSelect').value;
  const userId = document.getElementById('userId').value;
  const amount = document.getElementById('userId').dataset.amount;
  const price = document.getElementById('userId').dataset.price;
  const uid = firebase.auth().currentUser.uid;
  const txRef = db.ref('transactions').push();
  const txData = { uid, gameId, userId, amount, price, status: 'pending', timestamp: Date.now() };
  txRef.set(txData).then(() => {
    fetch(`https://api.telegram.org/bot7961343490:AAGKb3JPPVBj1egmQU0hq2VfZTFmlx1zpi8/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: -4935978960, text: `New topup: ${uid} ${gameId} ${amount} = Rp ${price}` })
    });
    alert('Transaksi terkirim!');
  });
};