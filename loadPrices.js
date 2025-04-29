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

    let selectedPrice = null;

    game.prices.forEach(price => {
      const item = document.createElement("div");
      item.className = "price-item";
      item.textContent = `${price.amount} Diamonds - Rp ${price.price.toLocaleString("id-ID")}`;
      item.addEventListener("click", () => {
        document.querySelectorAll(".price-item").forEach(el => el.classList.remove("selected"));
        item.classList.add("selected");
        selectedPrice = price;
      });
      priceListContainer.appendChild(item);
    });

    document.getElementById("buy-button").addEventListener("click", () => {
      const playerId = document.getElementById("player-id").value.trim();
      const serverId = document.getElementById("server-id").value.trim();
      const paymentMethod = document.getElementById("payment-method").value;

      if (!playerId || !selectedPrice) {
        alert("Harap isi ID dan pilih nominal diamond.");
        return;
      }

      const message = `
Halo Admin, saya ingin top-up:

Game: ${game.name}
ID: ${playerId}
Server: ${serverId || '-'}
Jumlah: ${selectedPrice.amount} Diamonds
Harga: Rp ${selectedPrice.price.toLocaleString("id-ID")}
Metode Pembayaran: ${paymentMethod}
      `.trim();

      const waUrl = `https://wa.me/6285648211278?text=${encodeURIComponent(message)}`;
      window.location.href = waUrl;
    });

  } catch (error) {
    console.error("Gagal memuat data harga:", error);
    document.getElementById("price-list").innerHTML = "<p>Gagal memuat harga.</p>";
  }
});
