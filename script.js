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
          const card = createGameCard(game);

          // masukkan ke kategori popular
          categories['popular-games'].appendChild(card);

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

        // search filter
        searchInput.addEventListener('input', () => {
          const term = searchInput.value.toLowerCase();
          // Loop over each category container and hide cards that don't match the search term
          Object.values(categories).forEach(container => {
            Array.from(container.children).forEach(card => {
              const name = card.querySelector('h3').innerText.toLowerCase();
              // Menyembunyikan atau menampilkan card berdasarkan pencarian
              card.style.display = name.includes(term) ? 'block' : 'none';
            });
          });
        });

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
      })
      .catch(err => console.error(err));
  }
});
<script>
  // Ambil elemen input pencarian dan semua elemen game-item
  const searchInput = document.getElementById('search-input');
  const gameItems = document.querySelectorAll('.game-item');

  // Event listener untuk menangani perubahan input
  searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase(); // Ambil nilai input dan buat menjadi lowercase
    gameItems.forEach(item => {
      const gameName = item.querySelector('div').textContent.toLowerCase(); // Ambil nama game
      if (gameName.includes(query)) {
        item.style.display = 'block'; // Tampilkan game yang sesuai
      } else {
        item.style.display = 'none'; // Sembunyikan game yang tidak sesuai
      }
    });
  });
</script>
