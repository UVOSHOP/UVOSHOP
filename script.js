// Data produk
const products = {
  semua: [
    { name: 'MLBB', category: 'populer', image: 'mlbb.png', waLink: 'https://wa.me/6285648211278?text=Top+Up+MLBB' },
    { name: 'Free Fire', category: 'populer', image: 'freefire.png', waLink: 'https://wa.me/6285648211278?text=Top+Up+Free+Fire' },
    { name: 'PUBG', category: 'populer', image: 'pubg.png', waLink: 'https://wa.me/6285648211278?text=Top+Up+PUBG' },
    { name: 'Valorant', category: 'populer', image: 'valorant.png', waLink: 'https://wa.me/6285648211278?text=Top+Up+Valorant' },
    { name: 'Genshin Impact', category: 'populer', image: 'genshin.png', waLink: 'https://wa.me/6285648211278?text=Top+Up+Genshin+Impact' },
    // 30 game mobile
    { name: 'Game Mobile 1', category: 'mobile', image: 'mobile1.png', waLink: 'https://wa.me/6285648211278?text=Top+Up+Game+Mobile+1' },
    // Tambahkan lebih banyak produk sesuai kategori
    // 20 game PC
    { name: 'Game PC 1', category: 'pc', image: 'pc1.png', waLink: 'https://wa.me/6285648211278?text=Top+Up+Game+PC+1' },
    // 20 aplikasi
    { name: 'Netflix', category: 'apk', image: 'netflix.png', waLink: 'https://wa.me/6285648211278?text=Top+Up+Netflix' },
    // 20 voucher
    { name: 'Voucher 1', category: 'voucher', image: 'voucher1.png', waLink: 'https://wa.me/6285648211278?text=Top+Up+Voucher+1' }
  ]
};

// Fungsi untuk render produk berdasarkan kategori
function renderProducts(category) {
  const productContainer = document.getElementById('product-slider');
  productContainer.innerHTML = '';
  const filteredProducts = products.semua.filter(product => category === 'semua' || product.category === category);

  filteredProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <button onclick="window.location.href='${product.waLink}'">Beli</button>
    `;
    productContainer.appendChild(productCard);
  });
}

// Fungsi toggle dark mode
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Fungsi kategori filter
document.querySelectorAll('.category-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderProducts(button.dataset.category);
  });
});

// Set kategori default
renderProducts('semua');
