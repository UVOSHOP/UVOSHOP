// DARK / LIGHT MODE TOGGLE
const toggle = document.getElementById("theme-toggle");
toggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
});

// DATA PRODUK DUMMY (Game, APK, Voucher)
const products = [
  {
    name: "Mobile Legends: Bang Bang",
    category: "mobile",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/MLBB-2025-tiles-178x178.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Mobile%20Legends%20Bang%20Bang"
  },
  {
    name: "Free Fire",
    category: "mobile",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/free-fire-tile-codacash-new.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Free%20Fire"
  },
  {
    name: "Genshin Impact",
    category: "mobile",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/genshinimpact_tile.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Genshin%20Impact"
  },
  {
    name: "Chamet",
    category: "mobile",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles-plain/Chamet-tile_178x178.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Chamet"
  },
  // Tambahkan produk lainnya di sini
  {
    name: "Valorant",
    category: "pc",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/valorant_tile.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Valorant"
  },
  {
    name: "PUBG Mobile",
    category: "mobile",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/pubgm_tile_aug2024.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20PUBG%20Mobile"
  },
  {
    name: "Steam Wallet Code",
    category: "voucher",
    image: "https://cdn1.codashop.com/S/content/mobile/images/product-tiles/steam-tile-codacash-new.jpg",
    whatsapp: "https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20Steam%20Wallet"
  },
  // Tambahkan produk lainnya di sini
];

// RENDER PRODUK KE HALAMAN
function renderProducts() {
  const gamePopuler = document.getElementById("game-populer");
  const gameMobile = document.getElementById("game-mobile");
  const gamePC = document.getElementById("game-pc");
  const voucher = document.getElementById("voucher");

  // Clear semua kategori
  gamePopuler.innerHTML = "";
  gameMobile.innerHTML = "";
  gamePC.innerHTML = "";
  voucher.innerHTML = "";

  // Filter produk berdasarkan kategori dan render
  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 p-3 rounded shadow hover:shadow-lg transition duration-300 w-48";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="w-full h-28 object-cover rounded mb-2 cursor-pointer" onclick="window.location.href='${product.whatsapp}'">
      <h3 class="text-sm text-center font-semibold">${product.name}</h3>
      <button class="w-full py-2 mt-2 bg-primary text-white rounded hover:bg-blue-700 transition-all" onclick="window.location.href='${product.whatsapp}'">Beli ${product.name}</button>
    `;

    // Render ke kategori yang sesuai
    if (product.category === "mobile") {
      gameMobile.appendChild(card);
    } else if (product.category === "pc") {
      gamePC.appendChild(card);
    } else if (product.category === "voucher") {
      voucher.appendChild(card);
    }
  });
}

// Fitur Search
const searchInput = document.getElementById("search");
searchInput.addEventListener("input", function (e) {
  const searchTerm = e.target.value.toLowerCase();
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm)
  );
  
  renderFilteredProducts(filteredProducts);
});

function renderFilteredProducts(filteredProducts) {
  const container = document.getElementById("game-populer");
  container.innerHTML = "";  // Clear existing products
  filteredProducts.forEach((product) => {
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 p-3 rounded shadow hover:shadow-lg transition duration-300 w-48";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="w-full h-28 object-cover rounded mb-2 cursor-pointer" onclick="window.location.href='${product.whatsapp}'">
      <h3 class="text-sm text-center font-semibold">${product.name}</h3>
      <button class="w-full py-2 mt-2 bg-primary text-white rounded hover:bg-blue-700 transition-all" onclick="window.location.href='${product.whatsapp}'">Beli ${product.name}</button>
    `;
    container.appendChild(card);
  });
}

// Inisialisasi tampilan produk saat pertama kali dimuat
renderProducts();
