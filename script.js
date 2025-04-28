// DARK / LIGHT MODE TOGGLE
const toggle = document.getElementById("theme-toggle");
toggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
});

// DATA PRODUK DUMMY (Game, APK, Voucher)
const products = [
  {
    name: "Mobile Legends",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/MLBB-2025-tiles-178x178.jpg"
  },
  {
    name: "Free Fire",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/free-fire-tile-codacash-new.jpg"
  },
  {
    name: "Genshin Impact",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/genshinimpact_tile.jpg"
  },
  {
    name: "Chamet",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles-plain/Chamet-tile_178x178.jpg"
  },
  {
    name: "Zenless Zone Zero",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/ZZZ_Zenless-Zone-Zero-Tile.png"
  },
  {
    name: "PUBG Mobile",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/pubgm_tile_aug2024.jpg"
  },
  {
    name: "Steam Wallet Code",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/steam-tile-codacash-new.jpg"
  },
  {
    name: "Valorant",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/valorant_tile.jpg"
  }
];

// RENDER PRODUK KE HALAMAN
const container = document.getElementById("product-list");

products.forEach((product) => {
  const card = document.createElement("div");
  card.className = "bg-white dark:bg-gray-800 p-3 rounded shadow hover:shadow-lg transition duration-300";

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="w-full h-28 object-cover rounded mb-2">
    <h3 class="text-sm text-center font-semibold">${product.name}</h3>
  `;

  container.appendChild(card);
});
