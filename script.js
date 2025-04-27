const games = [
  {
    name: "Mobile Legends",
    image: "https://play-lh.googleusercontent.com/OcBqAu4Nh1gm8ms-FGoP8a2G1ab4YHO0SPO88PjLhGXwCFzzfTf6_2AtBgLhJ2j-Yvw=w240-h480-rw"
  },
  {
    name: "Free Fire",
    image: "https://play-lh.googleusercontent.com/4RJ20YQUaeoXJ1h9vInx31pcyAYgckpFbsN1_dyo3nXovt8Z1VVKeDbX4GJIpZc3xRM=w240-h480-rw"
  },
  {
    name: "PUBG Mobile",
    image: "https://play-lh.googleusercontent.com/dcvQovFyU15OkduAePFTD0GHnLKek7SgTCtnTnJfFAvLK3zTbAChpWS1dtbbHXWHiw=w240-h480-rw"
  },
  {
    name: "Valorant",
    image: "https://upload.wikimedia.org/wikipedia/en/2/2b/Valorant_logo_-_pink_color_version.svg"
  },
  {
    name: "Call of Duty Mobile",
    image: "https://play-lh.googleusercontent.com/qAKVUIcyCF0U1kOESJ-Yt9RK7gqdCrkhWUX0jKvuRy52V6D1zzvNnEk2rPOa2jqFbUw=w240-h480-rw"
  },
  {
    name: "Genshin Impact",
    image: "https://play-lh.googleusercontent.com/WnkJvtx57HgkuEiFR8f7L6v6atPBZV5JAWRSvApGhci3WxMoXcFXUVXJyt_YEK7XWKw=w240-h480-rw"
  },
  {
    name: "Arena of Valor",
    image: "https://play-lh.googleusercontent.com/Z_whigr5KoHRRTkYPaza92zgHlALRhJAltJmKu8eROu3QqfGzzfHeBgDvqPLb0sR3g=s48-rw"
  },
  {
    name: "Point Blank",
    image: "https://play-lh.googleusercontent.com/IGOlY-TMU0cGW_I8EFKBkLACxPLu1TQqbqaqx7NUsGMyjNWIO1NdhwdBrq-71pUAHw=s48-rw"
  }
];

const gameList = document.getElementById('gameList');

// Fungsi buat nampilin game
function displayGames(list) {
  gameList.innerHTML = '';
  list.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img src="${game.image}" alt="${game.name}">
      <h4>${game.name}</h4>
      <button onclick="window.location.href='https://wa.me/6285648211278?text=Halo,%20saya%20mau%20top%20up%20${encodeURIComponent(game.name)}'">Top-Up</button>
    `;
    gameList.appendChild(card);
  });
}

displayGames(games);

// Search
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', function() {
  const keyword = this.value.toLowerCase();
  const filteredGames = games.filter(game => game.name.toLowerCase().includes(keyword));
  displayGames(filteredGames);
});
