const games = [
    // Mobile Games
    { name: "Mobile Legends", img: "https://play-lh.googleusercontent.com/yzXkSh1_A_MRNLi3WJ2jAp7u5f50RHIUf3Jr0gFzLDb2s5CB_JYxv-OqWID1rZmYHGI=w240-h480", kategori: "Mobile" },
    { name: "PUBG Mobile", img: "https://play-lh.googleusercontent.com/IC9DXDiJD51rWGDLXwj-CWneP4Crg2M7tCGC0dXWyrDFRG8svZXkIHkXAQ7R9wK6Vg=w240-h480", kategori: "Mobile" },
    { name: "Genshin Impact", img: "https://play-lh.googleusercontent.com/5f3XZtrWJzW2NUKIpG5bUGD1bTW2O4bwkwN_9X-gkWfIPkSgTzNix8hYt_K0S8SByBc=w240-h480", kategori: "Mobile" },
    { name: "Free Fire", img: "https://play-lh.googleusercontent.com/GI-yE8UMNC-bgiqEavukTYHTfPYf_pHC0mrGkMyzPqDMEv1lmX5pyY0I0ixTKNccLQ=w240-h480", kategori: "Mobile" },
    { name: "Call of Duty Mobile", img: "https://play-lh.googleusercontent.com/SzP6pNEqIA7s4B1uHK5aRzLG8d_xWv0q4nq0hYp2e4WIBW7bgvjAuG_0hAdfAQV3WQo=w240-h480", kategori: "Mobile" },
    { name: "Arena of Valor", img: "https://play-lh.googleusercontent.com/cp8bGwOPzDKP_9RX37vtZ4FbFCI4TMEgx_ZkwSihcsCwSasq9VWhK_xOAMzVJQJ7Kw=w240-h480", kategori: "Mobile" },
    { name: "Honkai Impact", img: "https://play-lh.googleusercontent.com/IqkK1wj4vX7sT5w2XhKeb7gyZKPyPTD91n3J0zDZffM7bNlBJRI5rPrUdK4-8M3h0mw=w240-h480", kategori: "Mobile" },
    { name: "Ragnarok X", img: "https://play-lh.googleusercontent.com/VhYYawXxKDbpoevKyNhrguJdFOQnFrUKWBomzZ8UdBQHnLZP8SsqHvBrXcVO0k09hr0=w240-h480", kategori: "Mobile" },
    { name: "Clash of Clans", img: "https://play-lh.googleusercontent.com/MiNOwSeDjXYeM7yFxoTXR2ZGrrdC0gYwFQTwjlK1VpHcfFC7LO7FC9lWqxEdF3Lr9E=w240-h480", kategori: "Mobile" },
    { name: "Brawl Stars", img: "https://play-lh.googleusercontent.com/K1FVQAmCmDjmZ6vS4cZ9TSmg7A7hde_fDRrUwV7rTnH3LVZ7tHJ8YVVY3imZzYv0-K0=w240-h480", kategori: "Mobile" },

    // PC Games
    { name: "Valorant", img: "https://playvalorant.com/assets/press-kit/VALORANT-Key-Art.jpg", kategori: "PC" },
    { name: "Point Blank", img: "https://cdn.unipin.com/images/merchant/logo/point-blank-new.jpg", kategori: "PC" },
    { name: "League of Legends", img: "https://upload.wikimedia.org/wikipedia/commons/9/9f/League_of_Legends_logo_2019.svg", kategori: "PC" },
    { name: "Dota 2", img: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Dota_2_logo.svg", kategori: "PC" },
    { name: "Counter-Strike: Global Offensive", img: "https://upload.wikimedia.org/wikipedia/commons/f/f7/CSGO_Logo.png", kategori: "PC" },
    { name: "Fortnite", img: "https://upload.wikimedia.org/wikipedia/commons/3/37/Fortnite_logo.svg", kategori: "PC" },
    { name: "Apex Legends", img: "https://upload.wikimedia.org/wikipedia/commons/3/36/Apex_Legends_logo.svg", kategori: "PC" },
    { name: "Overwatch 2", img: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Overwatch_2_logo.png", kategori: "PC" },
    { name: "Warframe", img: "https://upload.wikimedia.org/wikipedia/commons/2/27/Warframe_logo_2018.svg", kategori: "PC" },
    { name: "Minecraft", img: "https://upload.wikimedia.org/wikipedia/commons/5/51/Minecraft_logo.png", kategori: "PC" },

    // Voucher Games
    { name: "Steam", img: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Steam_logo.png", kategori: "Voucher" },
    { name: "PlayStation Network", img: "https://upload.wikimedia.org/wikipedia/commons/5/5f/PlayStation_Logo.png", kategori: "Voucher" },
    { name: "Xbox Live", img: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Xbox_logo_%282016%29.svg", kategori: "Voucher" },
    { name: "Google Play Gift Cards", img: "https://upload.wikimedia.org/wikipedia/commons/0/02/Google_Play_Store_Logo_2019.png", kategori: "Voucher" },
    { name: "Apple iTunes Gift Cards", img: "https://upload.wikimedia.org/wikipedia/commons/4/42/Apple_iTunes_logo.svg", kategori: "Voucher" },
    { name: "Amazon Gift Cards", img: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", kategori: "Voucher" },
    { name: "Nintendo eShop", img: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Nintendo_eShop_logo.png", kategori: "Voucher" },
    { name: "Riot Points (RP)", img: "https://upload.wikimedia.org/wikipedia/commons/7/75/Riot_Games_logo_2020.png", kategori: "Voucher" },
    { name: "Garena Shells", img: "https://upload.wikimedia.org/wikipedia/commons/6/69/Garena_logo.png", kategori: "Voucher" },
    { name: "Facebook Credits", img: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Facebook_logo_2023.png", kategori: "Voucher" }
];

// Function to render games based on category
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

// Function to filter games by category
function filterCategory(category) {
    const filteredGames = games.filter(game => game.kategori === category);
    renderGames(filteredGames);
}

// Render all games on load
window.onload = () => renderGames(games);
