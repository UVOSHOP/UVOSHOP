document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get('game'); // Misalnya ?game=mobile-legends-bang-bang

  if (!gameId) return;

  fetch('games.json')
    .then(response => response.json())
    .then(games => {
      const game = games.find(g => g.id === gameId);
      if (!game || !game.prices) return;

      const container = document.getElementById('price-list');

      game.prices.forEach(item => {
        const p = document.createElement('p');
        p.textContent = `${item.amount} Diamonds - Rp ${item.price.toLocaleString('id-ID')}`;
        container.appendChild(p);
      });
    })
    .catch(error => {
      console.error('Gagal memuat data harga:', error);
    });
});
