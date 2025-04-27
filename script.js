const games = [
    {
        name: "Mobile Legends: Bang Bang",
        image: "https://play-lh.googleusercontent.com/7I1gFWe0sOgiS3RHrzLv5ivwDfi4bGoZBF9q-RoXa4-mRpgbH_2zPaOhVumz5JKZP2A=s48-rw",
        link: "https://www.unipin.com",
    },
    {
        name: "PUBG Mobile",
        image: "https://play-lh.googleusercontent.com/klrABftwKfTg3zQicx9G4TZg9Hk8hQJt6bd-kZGxyfa54UhwDFcDvvS7RUfxDW_8Ml4=s48-rw",
        link: "https://www.unipin.com",
    },
    {
        name: "Free Fire",
        image: "https://play-lh.googleusercontent.com/6llpraFcTI0rEUuRpWEG9NWWblvm106y5JXcDzu60ACuaUYDD3i70a-p9_QM65NsGDE=s48-rw",
        link: "https://www.unipin.com",
    },
    // Add other games in the same format
];

const gameSlider = document.querySelector(".game-slider");

games.forEach(game => {
    const gameItem = document.createElement("div");
    gameItem.classList.add("game-item");

    gameItem.innerHTML = `
        <img src="${game.image}" alt="${game.name}">
        <p>${game.name}</p>
        <button onclick="window.location.href='${game.link}'">Beli</button>
    `;

    gameSlider.appendChild(gameItem);
});
