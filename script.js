// DARK / LIGHT MODE TOGGLE
const toggle = document.getElementById("theme-toggle");
toggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
});

// DATA PRODUK DUMMY (Game, APK, Voucher)
const products = [
  {
    name: "Mobile Legends: Bang Bang",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/MLBB-2025-tiles-178x178.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Mobile%20Legends%20Bang%20Bang"
  },
  {
    name: "Free Fire",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/free-fire-tile-codacash-new.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Free%20Fire"
  },
  {
    name: "Genshin Impact",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/genshinimpact_tile.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Genshin%20Impact"
  },
  {
    name: "Chamet",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles-plain/Chamet-tile_178x178.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Chamet"
  },
  {
    name: "Zenless Zone Zero",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/ZZZ_Zenless-Zone-Zero-Tile.png",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Zenless%20Zone%20Zero"
  },
  {
    name: "Honor of Kings",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/HonorofKings_Codacash178x178.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Honor%20of%20Kings"
  },
  {
    name: "PUBG Mobile",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/pubgm_tile_aug2024.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20PUBG%20Mobile"
  },
  {
    name: "VALORANT",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/valorant_tile.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20VALORANT"
  },
  // Tambah game lainnya jika diperlukan
];

// RENDER PRODUK KE HALAMAN
const container = document.getElementById("product-list");

products.forEach((product) => {
  const card = document.createElement("div");
  card.className = "bg-white dark:bg-gray-800 p-3 rounded shadow hover:shadow-lg transition duration-300";

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" class="w-full h-28 object-cover rounded mb-2 cursor-pointer" onclick="window.location.href='${product.whatsapp}'">
    <h3 class="text-sm text-center font-semibold">${product.name}</h3>
  `;

  container.appendChild(card);
});
