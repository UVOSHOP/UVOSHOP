document.addEventListener('DOMContentLoaded', () => {
  const gameList = document.getElementById('game-list');
  const searchInput = document.getElementById('search');
  const categoryFilter = document.getElementById('category-filter');

  const games = [
    {
      "name": "Mobile Legends",
      "image": "https://cdn.tokogame.com/game/mobile-legends.png",
      "category": "Game Mobile"
    },
    {
      "name": "Free Fire",
      "image": "https://cdn.tokogame.com/game/free-fire.png",
      "category": "Game Mobile"
    },
    {
      "name": "PUBG Mobile",
      "image": "https://cdn.tokogame.com/game/pubg-mobile.png",
      "category": "Game Mobile"
    },
    {
      "name": "Genshin Impact",
      "image": "https://cdn.tokogame.com/game/genshin-impact.png",
      "category": "Game Mobile"
    },
    {
      "name": "Honkai: Star Rail",
      "image": "https://cdn.tokogame.com/game/honkai-star-rail.png",
      "category": "Game Mobile"
    },
    {
      "name": "Valorant",
      "image": "https://cdn.tokogame.com/game/valorant.png",
      "category": "Game PC"
    },
    {
      "name": "Arena of Valor",
      "image": "https://cdn.tokogame.com/game/arena-of-valor.png",
      "category": "Game Mobile"
    },
    {
      "name": "Call of Duty Mobile",
      "image": "https://cdn.tokogame.com/game/cod-mobile.png",
      "category": "Game Mobile"
    },
    {
      "name": "Clash of Clans",
      "image": "https://cdn.tokogame.com/game/clash-of-clans.png",
      "category": "Game Mobile"
    },
    {
      "name": "Steam Wallet",
      "image": "https://cdn.tokogame.com/game/steam-wallet.png",
      "category": "Voucher"
    }
  ];

  const renderGames = (games) => {
    gameList.innerHTML = '';
    games.forEach(game => {
      const gameCard = document.createElement('div');
      gameCard.classList.add('game-card');
      gameCard.innerHTML = `
        <img src="${game.image}" alt="${game.name}">
        <h3>${game.name}</h3>
        <p>${game.category}</p>
      `;
      gameList.appendChild(gameCard);
    });
  };

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filteredGames = games.filter(game => game.name.toLowerCase().includes(query));
    renderGames(filteredGames);
  });

  categoryFilter.addEventListener('change', (e) => {
    const category = e.target.value;
    const filteredGames = category ? games.filter(game => game.category === category) : games;
    renderGames(filteredGames);
  });

  renderGames(games);
});
