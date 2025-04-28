// DARK / LIGHT MODE TOGGLE
const toggle = document.getElementById("theme-toggle");
toggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
});

// DATA PRODUK DUMMY (Game, APK, Voucher)
const products = [
  {
    name: "Mobile Legends: Bang Bang",
    category: "populer",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/MLBB-2025-tiles-178x178.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Mobile%20Legends%20Bang%20Bang"
  },
  {
    name: "Free Fire",
    category: "populer",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/free-fire-tile-codacash-new.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Free%20Fire"
  },
  {
    name: "Genshin Impact",
    category: "populer",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/genshinimpact_tile.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Genshin%20Impact"
  },
  {
    name: "Chamet",
    category: "populer",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles-plain/Chamet-tile_178x178.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Chamet"
  },
  {
    name: "Zenless Zone Zero",
    category: "populer",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/ZZZ_Zenless-Zone-Zero-Tile.png",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Zenless%20Zone%20Zero"
  },
  {
    name: "Honor of Kings",
    category: "populer",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/HonorofKings_Codacash178x178.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Honor%20of%20Kings"
  },
  {
    name: "PUBG Mobile",
    category: "populer",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/pubgm_tile_aug2024.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20PUBG%20Mobile"
  },
  {
    name: "VALORANT",
    category: "pc",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/valorant_tile.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Valorant"
  },
  {
    name: "Call of Duty: Mobile",
    category: "mobile",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/CODM-tile-codacash-new.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Call%20of%20Duty%20Mobile"
  },
  {
    name: "EA SPORTS FC Mobile",
    category: "mobile",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/FCM25_tile-image.png",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20EA%20Sports%20FC%20Mobile"
  },
  // Tambahkan game lainnya sesuai kategori
];

// RENDER PRODUK KE HALAMAN
function renderProducts() {
  const gamePopuler = document.getElementById("game-populer");
  const gameMobile = document.getElementById("game-mobile");
  const gamePc = document.getElementById("game-pc");

  // Clear kategori
  gamePopuler.innerHTML = "";
  gameMobile.innerHTML = "";
  gamePc.innerHTML = "";

  // Render produk berdasarkan kategori
  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 p-3 rounded shadow hover:shadow-lg transition duration-300 w-32 sm:w-40 lg:w-48";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="w-full h-28 object-cover rounded mb-2 cursor-pointer" onclick="window.location.href='${product.whatsapp}'">
      <h3 class="text-sm text-center font-semibold">${product.name}</h3>
      <button class="w-full py-2 mt-2 bg-primary text-white rounded hover:bg-blue-700 transition-all" onclick="window.location.href='${product.whatsapp}'">Beli ${product.name}</button>
    `;

    if (product.category === "populer") {
      gamePopuler.appendChild(card);
    } else if (product.category === "mobile") {
      gameMobile.appendChild(card);
    } else if (product.category === "pc") {
      gamePc.appendChild(card);
    }
  });
}

// Panggil fungsi untuk render produk
renderProducts();
