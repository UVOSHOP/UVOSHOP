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
      card.className = 'game-card';
      card.innerHTML = `
        <img src="${game.icon}" alt="${game.name}" />
        <h3>${game.name}</h3>
      `;
      card.addEventListener('click', () => {
        window.location.href = `topup.html?game=${game.id}`;
      });
      return card;
    }

    // load games.json
    fetch('games.json')
      .then(res => res.json())
      .then(games => {
        games.forEach(game => {
          const card = createGameCard(game);
          // distribusi ke kategori
          switch (game.category) {
            case 'popular':
              categories['popular-games'].appendChild(card);
              break;
            case 'mobile':
              categories['mobile-games'].appendChild(card);
              break;
            case 'pc':
              categories['pc-games'].appendChild(card);
              break;
            case 'voucher':
              categories['game-vouchers'].appendChild(card);
              break;
            default:
              categories['popular-games'].appendChild(card);
          }
        });
      })
      .catch(err => console.error('Gagal load games.json:', err));

    // search filter
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase();
      Object.values(categories).forEach(container => {
        Array.from(container.children).forEach(card => {
          const name = card.querySelector('h3').innerText.toLowerCase();
          card.style.display = name.includes(term) ? 'block' : 'none';
        });
      });
    });

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

        // hide server ID jika tidak perlu
        const noServer = [
          'free-fire', 'free-fire-max', 'pubg-mobile', 'valorant',
          'roblox', 'steam-wallet', 'garena-shells', 'minecraft',
          'fortnite', 'apex-legends', 'dota-2', 'valorant-points'
        ];
        if (noServer.includes(gameId)) {
          document.getElementById('server-id-container').style.display = 'none';
        }

        // load harga nominal dari games.json
        const nominals = game.nominals || {}; // Ambil harga nominal dari game yang dipilih

        const container = document.getElementById('nominals-container');
        if (nominals.length > 0) {
          nominals.forEach((n, i) => {
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
      })
      .catch(err => console.error(err));
  }
});
