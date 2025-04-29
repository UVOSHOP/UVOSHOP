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

    // Update nama game di bar atas
    document.getElementById("game-name").textContent = game.name;

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

      // Menambahkan logo diamond di atas harga
      const diamondLogo = document.createElement("img");
      diamondLogo.src = "https://cdn.unipin.com/images/default_denom/denom.png";
      diamondLogo.alt = "Diamond Logo";
      diamondLogo.className = "diamond-logo";

      // Menambahkan teks harga diamond
      const diamondText = document.createElement("div");
      diamondText.textContent = `${price.amount} Diamonds - Rp ${price.price.toLocaleString("id-ID")}`;

      // Menambahkan event listener untuk memilih diamond
      diamondItem.addEventListener("click", () => {
        document.querySelectorAll(".diamond-item").forEach(item => item.classList.remove("selected"));
        diamondItem.classList.add("selected");
        selectedDiamond = price;
      });

      // Menambahkan logo dan harga ke diamond item
      diamondItem.appendChild(diamondLogo);
      diamondItem.appendChild(diamondText);

      diamondListContainer.appendChild(diamondItem);
    });

    // Load Payment Methods
    const paymentMethods = ["Voucher UVOSHOP", "QRIS", "BANK", "CASH"];
    paymentMethods.forEach(method => {
      const paymentItem = document.createElement("div");
      paymentItem.className = "payment-item";

      // Menambahkan logo pembayaran sesuai dengan metode
      const paymentLogo = document.createElement("img");
      if (method === "Voucher UVOSHOP") {
        paymentLogo.src = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhJgi_FQ8hkVYenTlDZFEsBav5kxIUrYouQ_TrK798jscAghpTfh9mk2e2N5Rcrj4JKNI1iJZdMVUJPecR-LDxoXPCG__qJZEBLcDIoDHPL4z-39Cdwlxwed7PiUn8RATMpeIIiLbW0cTuo48kd3HqaYsM7Yy3OAmFh3SjcvjKPo2kATv_5Wa_8PFQxq2fz/s1600/1.png";
      } else if (method === "QRIS") {
        paymentLogo.src = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhtF5j3JZj2uAnabC7I8HY79qOXGaiyqzjS28VAyITpc3HQhkU0J5yvW-5ZjzSycsJRW8bQqZIVRm6-c_Uh_DZkiw1Soc1hoMOlUs-nxC-BUq1pnHAON2k5Vkqfka4FuMumjElXCAtgdzfwWK8Xe2azbBHmqLdReSIkfLkhYgwJOVN4kFRt5oGDU6Nv7EYg/s1600/2.png";
      } else if (method === "BANK") {
        paymentLogo.src = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgGwk-3V-wNUpV_dKuUg9B37KjtHuWDjBL-dT2eY3sSv2U4l1nH4kuspGrY3RmssCtuiRps5wXGa4NOeOLeewvbVPAQNXD_QwtkBpTUvehE7d-UHS_YsSnJxZax1eLr6FsAwNdPMuCBmVft3RduM2MSVpih78CPCT7oDeckRajHm0H5jvEECEPJqLea2623/s1600/3.png";
      } else if (method === "CASH") {
        paymentLogo.src = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhjNMZOpO_kKi4MFkxph4NxFpQILgw6kBFN0rKMPifa1m1FZHKKBT1iQ2xs-2Dbto6pM3DGbv3f1uZr-UjQq-tIJCwlJycBHrZ7vIvPhNg2bAnAmUDBTl9r7utSZrbDqjPuKNliQJkJdyLI-avKiHBZS_IuuYC3Oz8_qyHe7IpnDKFWlevFUDCxNgCZnxaB/s1600/4.png";
      }

      // Menambahkan logo pembayaran ke payment item
      paymentItem.appendChild(paymentLogo);

      // Menambahkan teks untuk metode pembayaran
      const paymentText = document.createElement("div");
      paymentText.textContent = method;
      paymentItem.appendChild(paymentText);

      // Menambahkan event listener untuk memilih pembayaran
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
