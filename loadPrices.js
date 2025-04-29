document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("game");

  if (!gameId) return;

  try {
    const res = await fetch("games.json");
    const games = await res.json();
    const game = games.find(g => g.id === gameId);

    if (!game) {
      document.getElementById("diamond-list").innerHTML = "<p>Game tidak ditemukan.</p>";
      return;
    }

    const diamondListContainer = document.getElementById("diamond-list");
    const paymentMethodsContainer = document.getElementById("payment-methods");
    diamondListContainer.innerHTML = "";
    paymentMethodsContainer.innerHTML = "";

    let selectedDiamond = null;
    let selectedPayment = null;

    // Load Diamond Prices
    game.prices.forEach(price => {
      const diamondItem = document.createElement("div");
      diamondItem.className = "diamond-item";
      diamondItem.textContent = `${price.amount} Diamonds - Rp ${price.price.toLocaleString("id-ID")}`;
      diamondItem.addEventListener("click", () => {
        document.querySelectorAll(".diamond-item").forEach(item => item.classList.remove("selected"));
        diamondItem.classList.add("selected");
        selectedDiamond = price;
      });
      diamondListContainer.appendChild(diamondItem);
    });

    // Load Payment Methods
    const paymentMethods = ["Voucher UVOSHOP", "QRIS", "BANK", "CASH"];
    paymentMethods.forEach(method => {
      const paymentItem = document.createElement("div");
      paymentItem.className = "payment-item";
      paymentItem.textContent = method;
      paymentItem.addEventListener("click", () => {
        document.querySelectorAll(".payment-item").forEach(item => item.classList.remove("selected"));
        paymentItem.classList.add("selected");
        selectedPayment = method;
      });
      paymentMethodsContainer.appendChild(paymentItem);
    });

    // Button action to buy
    document.getElementById("buy-button").addEventListener("click", () => {
      const playerId = document.getElementById("player-id").value.trim();
      const serverId = document.getElementById("server-id").value.trim();

      if (!playerId || !selectedDiamond || !selectedPayment) {
        alert("Harap isi ID, pilih diamond dan pilih metode pembayaran.");
        return;
      }

      const message = `
Halo Admin, saya ingin top-up:

Game: ${game.name}
ID: ${playerId}
Server: ${serverId || '-'}
Jumlah: ${selectedDiamond.amount} Diamonds
Harga: Rp ${selectedDiamond.price.toLocaleString("id-ID")}
Metode Pembayaran: ${selectedPayment}
      `.trim();

      const waUrl = `https://wa.me/6285648211278?text=${encodeURIComponent(message)}`;
      window.location.href = waUrl;
    });

  } catch (error) {
    console.error("Gagal memuat data harga:", error);
    document.getElementById("diamond-list").innerHTML = "<p>Gagal memuat harga.</p>";
  }
});
