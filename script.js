document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');

    if (!gameId) {
        // === INDEX.HTML: Daftar game, kategori & search ===
        const searchInput = document.getElementById('search-input');
        const categories = {
            'popular-games': document.getElementById('popular-games'),
            'mobile-games': document.getElementById('mobile-games'),
            'pc-games': document.getElementById('pc-games'),
            'game-vouchers': document.getElementById('game-vouchers'),
        };

        // buat elemen card game
        function createGameCard(game) {
            const card = document.createElement('div');
            // Pastikan class ini sesuai dengan yang dicari oleh searchInput.addEventListener
            // Di sini, kita menggunakan 'game-item' yang sebelumnya Anda gunakan di HTML untuk styling dan pencarian
            card.className = 'game-item'; // <-- PERHATIAN: Mengubah dari 'game-card' menjadi 'game-item'

            card.innerHTML = `
                <img src="${game.icon}" alt="${game.name}" />
                <h3>${game.name}</h3>
            `;
            card.addEventListener('click', () => {
                const clicks = JSON.parse(localStorage.getItem('gameClicks') || '{}');
                clicks[game.id] = (clicks[game.id] || 0) + 1;
                localStorage.setItem('gameClicks', JSON.stringify(clicks));
                window.location.href = `topup.html?game=${game.id}`;
            });
            return card;
        }

        // load games.json
        fetch('games.json')
            .then(res => res.json())
            .then(games => {
                let clicks = JSON.parse(localStorage.getItem('gameClicks') || '{}');
                games.sort((a, b) => (clicks[b.id] || 0) - (clicks[a.id] || 0));

                games.forEach(game => {
                    // masukkan ke kategori popular
                    categories['popular-games'].appendChild(createGameCard(game));
                    // masukkan ke kategori spesifik
                    switch (game.category) {
                        case 'mobile':
                            categories['mobile-games'].appendChild(createGameCard(game));
                            break;
                        case 'pc':
                            categories['pc-games'].appendChild(createGameCard(game));
                            break;
                        case 'voucher':
                            categories['game-vouchers'].appendChild(createGameCard(game));
                            break;
                    }
                });

                // search filter (sudah ada di kode Anda, ini yang akan diaktifkan)
                searchInput.addEventListener('input', () => {
                    const term = searchInput.value.toLowerCase();
                    // Iterasi semua kategori kontainer (misal: popular-games, mobile-games, dll.)
                    Object.values(categories).forEach(container => {
                        // Iterasi setiap card game di dalam kontainer tersebut
                        Array.from(container.children).forEach(card => {
                            // Ambil nama game dari tag <h3> di dalam card
                            const name = card.querySelector('h3').innerText.toLowerCase();
                            // Atur display card berdasarkan apakah nama game mengandung term pencarian
                            card.style.display = name.includes(term) ? 'block' : 'none';
                        });
                    });
                });

                // === Tambahan: Leaderboard klik terbanyak ===
                const leaderboardContainer = document.getElementById('leaderboard');
                if (leaderboardContainer) {
                    Object.entries(clicks)
                        .sort((a, b) => b[1] - a[1])
                        .forEach(([id, count]) => {
                            const game = games.find(g => g.id === id);
                            if (game) {
                                const li = document.createElement('li');
                                li.innerText = `${game.name}: ${count} klik`;
                                leaderboardContainer.appendChild(li);
                            }
                        });
                }
            })
            .catch(err => console.error('Gagal load games.json:', err));

    } else {
        // === TOPUP.HTML: Halaman top-up dengan form ===
        fetch('games.json')
            .then(res => res.json())
            .then(games => {
                const game = games.find(g => g.id === gameId);
                if (!game) {
                    return console.error('Game tidak ditemukan');
                }

                document.getElementById('game-title').innerText = game.name;

                const noServer = [
                    'free-fire', 'free-fire-max', 'pubg-mobile', 'valorant',
                    'roblox', 'steam-wallet', 'garena-shells', 'minecraft',
                    'fortnite', 'apex-legends', 'dota-2', 'valorant-points'
                ];
                if (noServer.includes(gameId)) {
                    document.getElementById('server-id-container').style.display = 'none';
                }

                const prices = game.prices || [];
                const container = document.getElementById('nominals-container');
                if (prices.length > 0) {
                    prices.forEach((price, i) => {
                        const wrap = document.createElement('div');
                        wrap.className = 'nominal-option';

                        const input = document.createElement('input');
                        input.type = 'radio';
                        input.id = `nominal-${i}`;
                        input.name = 'nominal';
                        input.value = price.price;
                        input.required = true;

                        const label = document.createElement('label');
                        label.htmlFor = input.id;
                        label.innerHTML = `
                            <span class="amount">${price.amount}</span>
                            <span class="price">Rp ${price.price}</span>
                        `;

                        wrap.appendChild(input);
                        wrap.appendChild(label);
                        container.appendChild(wrap);
                    });
                } else {
                    container.innerHTML = `<p>Harga nominal tidak tersedia untuk game ini.</p>`;
                }

                // kirim WA
                document.getElementById('topup-form').addEventListener('submit', e => {
                    e.preventDefault();
                    const userId = document.getElementById('user-id').value;
                    const serverId = document.getElementById('server-id').value;
                    const sel = document.querySelector('input[name="nominal"]:checked');
                    const nominalText = sel.nextElementSibling.textContent.trim();
                    const msg = encodeURIComponent(
                        `Halo Admin UVOSHOP, saya mau beli:\n` +
                        `Game: ${game.name}\n` +
                        `User ID: ${userId}\n` +
                        `${noServer.includes(gameId) ? '' : 'Server ID: ' + serverId + '\n'}` +
                        `Item: ${nominalText}`
                    );
                    window.location.href = `https://api.whatsapp.com/send?phone=6285648211278&text=${msg}`;
                });

                // === Tambahan: Leaderboard Top-up per game ===
                const topupLb = document.getElementById('topup-leaderboard');
                if (topupLb) {
                    const key = `topupClicks_${gameId}`;
                    const clicks = JSON.parse(localStorage.getItem(key) || '{}');
                    Object.entries(clicks)
                        .sort((a, b) => b[1] - a[1])
                        .forEach(([user, count]) => {
                            const li = document.createElement('li');
                            li.innerText = `${user}: ${count} transaksi`;
                            topupLb.appendChild(li);
                        });

                    // Simpan transaksi saat form submit
                    document.getElementById('topup-form').addEventListener('submit', e => {
                        const userId = document.getElementById('user-id').value || 'Anonymous';
                        clicks[userId] = (clicks[userId] || 0) + 1;
                        localStorage.setItem(key, JSON.stringify(clicks));
                    });
                }
            })
            .catch(err => console.error(err));
    }
});
