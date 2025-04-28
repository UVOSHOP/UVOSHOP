document.addEventListener('DOMContentLoaded', () => {
    const gamesContainer = document.getElementById('games-container');
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');

    if (!gameId) {
        // Halaman daftar game
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
        // Halaman top-up
        fetch('games.json')
            .then(res => res.json())
            .then(games => {
                const game = games.find(g => g.id === gameId);
                document.getElementById('game-title').innerText = game.name;

                // Daftar game tanpa server ID
                const noServer = [
                    'free-fire','free-fire-max','pubg-mobile','valorant',
                    'roblox','steam-wallet','garena-shells','minecraft',
                    'fortnite','apex-legends','dota-2','valorant-points'
                ];
                if (noServer.includes(gameId)) {
                    document.getElementById('server-id-container').style.display = 'none';
                }

                // Data nominal sesuai UniPin
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
                    // Tambahkan list nominal untuk game lain di sini...
                };

                // Render nominal sebagai kartu
                const container = document.getElementById('nominals-container');
                nominals[gameId].forEach((n, i) => {
                    const wrap = document.createElement('div');
                    wrap.className = 'nominal-option';

                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.id = `nominal-${i}`;
                    input.name = 'nominal';
                    input.value = n.price;
                    input.required = true;

                    const label = document.createElement('label');
                    label.htmlFor = input.id;
                    label.innerHTML = `
                        <span class="amount">${n.amount}</span>
                        <span class="price">Rp ${n.price}</span>
                    `;

                    wrap.appendChild(input);
                    wrap.appendChild(label);
                    container.appendChild(wrap);
                });

                // Submit form: kirim pesan ke WA
                document.getElementById('topup-form').addEventListener('submit', e => {
                    e.preventDefault();
                    const userId = document.getElementById('user-id').value;
                    const serverId = document.getElementById('server-id').value;
                    const selected = document.querySelector('input[name="nominal"]:checked');
                    const nominalText = selected.nextElementSibling.textContent.trim();
                    const message = encodeURIComponent(
                        `Halo Admin UVOSHOP, saya mau beli:\n` +
                        `Game: ${game.name}\n` +
                        `User ID: ${userId}\n` +
                        `${noServer.includes(gameId) ? '' : 'Server ID: ' + serverId + '\n'}` +
                        `Item: ${nominalText}`
                    );
                    window.location.href = `https://api.whatsapp.com/send?phone=6285648211278&text=${message}`;
                });
            });
    }
});
