document.addEventListener('DOMContentLoaded', () => {
    const gamesContainer = document.getElementById('games-container');
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    if (!gameId) {
        // List games
        fetch('games.json')
            .then(res => res.json())
            .then(games => {
                games.forEach(game => {
                    const card = document.createElement('div');
                    card.className = 'game-card';
                    card.innerHTML = `
                        <img src="${game.icon}" alt="${game.name}" />
                        <h3>${game.name}</h3>
                    `;
                    card.addEventListener('click', () => {
                        window.location.href = `topup.html?game=${game.id}`;
                    });
                    gamesContainer.appendChild(card);
                });
            });
    } else {
        // Top up form
        fetch('games.json')
            .then(res => res.json())
            .then(games => {
                const game = games.find(g => g.id === gameId);
                document.getElementById('game-title').innerText = game.name;
                // Hide server ID for games without server requirement
                const noServer = ['free-fire','free-fire-max','pubg-mobile','valorant','roblox','steam-wallet','garena-shells','minecraft','fortnite','apex-legends','dota-2','valorant-points'];
                if (noServer.includes(gameId)) {
                    document.getElementById('server-id-container').style.display = 'none';
                }
                // Nominals
                const nominals = {
                    'mlbb': [
                        {"amount":"12 Diamonds","price":"3500"},
                        {"amount":"28 Diamonds","price":"8000"},
                        {"amount":"36 Diamonds","price":"10000"},
                        {"amount":"56 Diamonds","price":"16000"},
                        {"amount":"85 Diamonds","price":"23000"},
                        {"amount":"169 Diamonds","price":"46000"},
                        {"amount":"220 Diamonds","price":"60000"},
                        {"amount":"282 Diamonds","price":"80000"},
                        {"amount":"366 Diamonds","price":"100000"},
                        {"amount":"568 Diamonds","price":"150000"},
                        {"amount":"875 Diamonds","price":"230000"},
                        {"amount":"2010 Diamonds","price":"500000"},
                        {"amount":"4804 Diamonds","price":"1200000"},
                        {"amount":"6004 Diamonds","price":"1500000"}
                    ],
                    'free-fire': [
                        {"amount":"50 Diamonds","price":"8000"},
                        {"amount":"70 Diamonds","price":"10000"},
                        {"amount":"140 Diamonds","price":"20000"},
                        {"amount":"355 Diamonds","price":"50000"},
                        {"amount":"720 Diamonds","price":"100000"},
                        {"amount":"1450 Diamonds","price":"200000"},
                        {"amount":"2180 Diamonds","price":"300000"},
                        {"amount":"3640 Diamonds","price":"500000"},
                        {"amount":"7290 Diamonds","price":"1000000"},
                        {"amount":"36500 Diamonds","price":"5000000"}
                    ]
                    // Add more game nominal lists here...
                };
                const container = document.getElementById('nominals-container');
                nominals[gameId].forEach(n => {
                    const opt = document.createElement('div');
                    opt.className = 'nominal-option';
                    opt.innerHTML = `
                        <label>
                            <input type="radio" name="nominal" value="${n.price}" required/>
                            ${n.amount} - Rp ${n.price}
                        </label>
                    `;
                    container.appendChild(opt);
                });
                // Form submit
                document.getElementById('topup-form').addEventListener('submit', e => {
                    e.preventDefault();
                    const userId = document.getElementById('user-id').value;
                    const serverId = document.getElementById('server-id').value;
                    const nominal = document.querySelector('input[name="nominal"]:checked').parentNode.textContent.trim();
                    const message = encodeURIComponent(`Halo Admin UVOSHOP, saya mau beli:
Game: ${game.name}
User ID: ${userId}
${noServer.includes(gameId) ? '' : 'Server ID: ' + serverId + '\n'}
Item: ${nominal}`);
                    window.location.href = `https://api.whatsapp.com/send?phone=6285648211278&text=${message}`;
                });
            });
    }
});
