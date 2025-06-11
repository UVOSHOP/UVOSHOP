// Firebase Initialization
const firebaseConfig = {
  apiKey: "AIzaSyCYLbIFVfaO487KN2z4ABDPTx1j0mBHF-o",
  authDomain: "uvologin-1.firebaseapp.com",
  projectId: "uvologin-1",
  storageBucket: "uvologin-1.firebasestorage.app",
  messagingSenderId: "243117010932",
  appId: "1:243117010932:web:b98e90504c99e46f7d93a1",
  measurementId: "G-25JPXF6HP3",
  databaseURL: "https://uvologin-1-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Load games
fetch('games.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('gameList');
    data.forEach(game => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.innerHTML = `<img src="${game.icon}" alt="${game.name}"><p>${game.name}</p>`;
      card.onclick = () => location.href = 'topup.html?game=' + game.id;
      container.appendChild(card);
    });
  });