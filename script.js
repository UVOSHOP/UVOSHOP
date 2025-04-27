const games = [
    // Example games, you can add more games as needed
    { name: "Mobile Legends", img: "https://play-lh.googleusercontent.com/yzXkSh1_A_MRNLi3WJ2jAp7u5f50RHIUf3Jr0gFzLDb2s5CB_JYxv-OqWID1rZmYHGI=w240-h480", kategori: "Mobile" },
    { name: "Free Fire", img: "https://play-lh.googleusercontent.com/GI-yE8UMNC-bgiqEavukTYHTfPYf_pHC0mrGkMyzPqDMEv1lmX5pyY0I0ixTKNccLQ=w240-h480", kategori: "Mobile" },
    { name: "Valorant", img: "https://playvalorant.com/assets/press-kit/VALORANT-Key-Art.jpg", kategori: "PC" },
    { name: "Point Blank", img: "https://cdn.unipin.com/images/merchant/logo/point-blank-new.jpg", kategori: "PC" },
    { name: "Steam", img: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Steam_logo.png", kategori: "Voucher" },
    { name: "Google Play", img: "https://upload.wikimedia.org/wikipedia/commons/0/02/Google_Play_Store_Logo_2019.png", kategori: "Voucher" }
];

function renderGames(gamesToRender) {
    const gameList = document.getElementById('game-list');
    gameList.innerHTML = ''; // Clear previous games
    gamesToRender.forEach(game => {
        const gameItem = document.createElement('div');
        gameItem.className = 'game-card';
        gameItem.innerHTML = `
            <img src="${game.img}" alt="${game.name}">
            <h4>${game.name}</h4>
            <button onclick="window.location.href='https://wa.me/6285648211278?text=Saya%20ingin%20top%20up%20${encodeURIComponent(game.name)}'">Top Up</button>
        `;
        gameList.appendChild(gameItem);
    });
}

function filterCategory(category) {
    const filteredGames = games.filter(game => game.kategori === category);
    renderGames(filteredGames);
}

// Render all games on load
window.onload = () => renderGames(games);
