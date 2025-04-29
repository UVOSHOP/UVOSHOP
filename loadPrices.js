document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("game");
  const container = document.getElementById("price-list");

  if (!gameId) {
    container.innerHTML = "<p>Game tidak ditemukan di URL.</p>";
    return;
  }

  fetch("games.json")
    .then(res => res.json())
    .then(games => {
      const game = games.find(g => g.id === gameId);
      if (!game) {
        container.innerHTML = "<p>Game tidak ditemukan dalam data.</p>";
        return;
      }

      game.prices.forEach(item => {
        const card = document.createElement("div");
        card.className = "game-item";

        card.innerHTML = `
          <h2>${item.amount} Diamonds</h2>
          <p class="price">Rp ${item.price.toLocaleString("id-ID")}</p>
          <button>Top-up</button>
        `;

        container.appendChild(card);
      });
    })
    .catch(err => {
      container.innerHTML = "<p>Gagal memuat data harga.</p>";
      console.error(err);
    });
});
