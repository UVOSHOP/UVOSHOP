document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("game");

  if (!gameId) return;

  try {
    const res = await fetch("games.json");
    const games = await res.json();
    const game = games.find(g => g.id === gameId);

    if (!game) {
      document.getElementById("price-list").innerHTML = "<p>Game tidak ditemukan.</p>";
      return;
    }

    const priceListContainer = document.getElementById("price-list");
    priceListContainer.innerHTML = "";

    game.prices.forEach(price => {
      const p = document.createElement("p");
      p.textContent = `${price.amount} Diamonds - Rp ${price.price.toLocaleString("id-ID")}`;
      priceListContainer.appendChild(p);
    });
  } catch (error) {
    console.error("Gagal memuat data harga:", error);
    document.getElementById("price-list").innerHTML = "<p>Gagal memuat harga.</p>";
  }
});
