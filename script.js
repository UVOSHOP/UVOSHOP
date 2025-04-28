document.addEventListener('DOMContentLoaded', () => {
  const gameList = document.getElementById('game-list');
  const searchInput = document.getElementById('search');
  const categoryFilter = document.getElementById('category-filter');

  fetch('games.json')
    .then(response => response.json())
    .then(games => {
      const renderGames = (games) => {
        gameList.innerHTML = '';
        games.forEach(game => {
          const gameCard = document.createElement('div');
          gameCard.classList.add('game-card');
          gameCard.innerHTML = `
            <img src="${game.image}" alt="${game.name}">
            <h3>${game.name}</h3>
            <button onclick="window.location.href='https://wa.me/6285648211278?text=Saya%20ingin%20top-up%20${game.name}'">Beli</button>
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
    })
    .catch(error => console.error('Error loading the game data:', error));
});
