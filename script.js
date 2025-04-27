// Inisialisasi Swiper untuk kategori
new Swiper('.kategoriSwiper', {
    slidesPerView: 'auto',
    spaceBetween: 10,
    freeMode: true,
});

// Inisialisasi Swiper untuk game (kalau mau geser horizontal juga)
new Swiper('.gameSwiper', {
    slidesPerView: 'auto',
    spaceBetween: 15,
    freeMode: true,
});

// Daftar game
const games = [
    { name: "Mobile Legends", img: "https://play-lh.googleusercontent.com/yzXkSh1_A_MRNLi3WJ2jAp7u5f50RHIUf3Jr0gFzLDb2s5CB_JYxv-OqWID1rZmYHGI=w240-h480", kategori: "Mobile" },
    { name: "PUBG Mobile", img: "https://play-lh.googleusercontent.com/IC9DXDiJD51rWGDLXwj-CWneP4Crg2M7tCGC0dXWyrDFRG8svZXkIHkXAQ7R9wK6Vg=w240-h480", kategori: "Mobile" },
    { name: "Genshin Impact", img: "https://play-lh.googleusercontent.com/5f3XZtrWJzW2NUKIpG5bUGD1bTW2O4bwkwN_9X-gkWfIPkSgTzNix8hYt_K0S8SByBc=w240-h480", kategori: "Mobile" },
    { name: "Valorant", img: "https://playvalorant.com/assets/press-kit/VALORANT-Key-Art.jpg", kategori: "PC" },
    { name: "Point Blank", img: "https://cdn.unipin.com/images/merchant/logo/point-blank-new.jpg", kategori: "PC" },
    { name: "Free Fire", img: "https://play-lh.googleusercontent.com/GI-yE8UMNC-bgiqEavukTYHTfPYf_pHC0mrGkMyzPqDMEv1lmX5pyY0I0ixTKNccLQ=w240-h480", kategori: "Mobile" },
    { name: "Call of Duty Mobile", img: "https://play-lh.googleusercontent.com/SzP6pNEqIA7s4B1uHK5aRzLG8d_xWv0q4nq0hYp2e4WIBW7bgvjAuG_0hAdfAQV3WQo=w240-h480", kategori: "Mobile" },
    { name: "Arena of Valor", img: "https://play-lh.googleusercontent.com/cp8bGwOPzDKP_9RX37vtZ4FbFCI4TMEgx_ZkwSihcsCwSasq9VWhK_xOAMzVJQJ7Kw=w240-h480", kategori: "Mobile" },
    { name: "Honkai Impact", img: "https://play-lh.googleusercontent.com/IqkK1wj4vX7sT5w2XhKeb7gyZKPyPTD91n3J0zDZffM7bNlBJRI5rPrUdK4-8M3h0mw=w240-h480", kategori: "Mobile" },
    { name: "Ragnarok X", img: "https://play-lh.googleusercontent.com/VhYYawXxKDbpoevKyNhrguJdFOQnFrUKWBomzZ8UdBQHnLZP8SsqHvBrXcVO0k09hr0=w240-h480", kategori: "Mobile" },
    // Tambahkan lagi game lainnya kalau mau total 20-30 ya!
];

// Render game
const gameList = document.getElementById('game-list');
games.forEach(game => {
    const gameItem = document.createElement('div');
    gameItem.className = 'swiper-slide game-card';
    gameItem.innerHTML = `
        <img src="${game.img}" alt="${game.name}">
        <h4>${game.name}</h4>
        <button onclick="window.location.href='https://wa.me/6285648211278?text=Saya%20ingin%20top%20up%20${encodeURIComponent(game.name)}'">Top Up</button>
    `;
    gameList.appendChild(gameItem);
});
