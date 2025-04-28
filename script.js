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
        document.getElementById('game-title').innerText = game.name;

        // hide server ID jika tidak perlu
        const noServer = [
          'free-fire','free-fire-max','pubg-mobile','valorant',
          'roblox','steam-wallet','garena-shells','minecraft',
          'fortnite','apex-legends','dota-2','valorant-points'
        ];
        if (noServer.includes(gameId)) {
          document.getElementById('server-id-container').style.display = 'none';
        }

        // nominal sesuai UniPin
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
          // tambahkan nominal untuk game lain jika perlu
        };

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
