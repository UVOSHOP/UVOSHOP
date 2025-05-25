// uvoblock.js

// Mendapatkan referensi elemen DOM
const gameGridElement = document.getElementById('game-grid');
const scoreDisplay = document.getElementById('scoreDisplay');
const blockPreviewSlots = [
    document.getElementById('slot1'),
    document.getElementById('slot2'),
    document.getElementById('slot3')
];
const gameOverlay = document.getElementById('game-overlay');
const overlayMessage = document.getElementById('overlay-message');
const restartButton = document.getElementById('restartButton');
const bodyElement = document.body;

// Konstanta Game
const GRID_ROWS = 9;
const GRID_COLS = 9;
let CELL_SIZE = 40; // Ukuran sel dasar, akan dihitung ulang
let BLOCK_PIECE_SIZE = 20; // Ukuran potongan blok di preview/ghost, akan dihitung ulang

// Variabel Game State
let gameGrid = []; // Representasi grid (0 untuk kosong, string warna untuk terisi)
let score = 0;
let currentBlocks = []; // Array untuk menyimpan 3 blok yang tersedia
let draggedBlock = null; // Blok yang sedang diseret
let draggedBlockIndex = -1; // Indeks blok di currentBlocks
let ghostElement = null; // Elemen DOM untuk ghost block
let currentHighlightCells = []; // Sel yang sedang di-highlight di grid
let isDragging = false; // Flag untuk status drag
let dragOffsetX = 0; // Offset X untuk penempatan ghost (bug 1)
let dragOffsetY = 0; // Offset Y untuk penempatan ghost (bug 1)

// Daftar warna background gelap yang akan berganti-ganti (bug 4)
const BACKGROUND_COLORS = [
    '#1a1a1a', // Sangat gelap
    '#222222',
    '#2a2a2a',
    '#333333',
    '#3b3b3b'
];
let currentBgColorIndex = 0;

// --- Definisi Bentuk Blok ---
// Anda bisa menambahkan atau mengurangi bentuk blok di sini
const BLOCK_SHAPES = [
    // Single Block
    { shape: [[1]], color: 'color-red', size: 1 },
    // 2-Block Shapes
    { shape: [[1, 1]], color: 'color-blue', size: 2 },
    { shape: [[1], [1]], color: 'color-yellow', size: 2 },
    // 3-Block Shapes
    { shape: [[1, 1, 1]], color: 'color-purple', size: 3 },
    { shape: [[1], [1], [1]], color: 'color-orange', size: 3 },
    { shape: [[1, 1], [0, 1]], color: 'color-green', size: 3 }, // L-shape
    { shape: [[1, 1], [1, 0]], color: 'color-cyan', size: 3 },  // L-shape
    { shape: [[0, 1], [1, 1]], color: 'color-pink', size: 3 },
    { shape: [[1, 0], [1, 1]], color: 'color-red', size: 3 },
    { shape: [[1, 1, 0], [0, 1, 0]], color: 'color-blue', size: 3 }, // T-shape top-left corner
    { shape: [[0, 1, 0], [1, 1, 0]], color: 'color-yellow', size: 3 }, // T-shape top-right corner
    { shape: [[1,1,1],[0,1,0]], color: 'color-purple', size: 4 }, // T-shape
    // 4-Block Shapes
    { shape: [[1, 1, 1, 1]], color: 'color-purple', size: 4 },
    { shape: [[1], [1], [1], [1]], color: 'color-orange', size: 4 },
    { shape: [[1, 1], [1, 1]], color: 'color-green', size: 4 }, // 2x2
    { shape: [[1, 0], [1, 0], [1, 1]], color: 'color-cyan', size: 4 }, // L-shape 3x2 (large)
    { shape: [[0, 1], [0, 1], [1, 1]], color: 'color-pink', size: 4 }, // L-shape 3x2 (large)
    { shape: [[0, 1, 0], [1, 1, 1]], color: 'color-red', size: 4 }, // T-shape
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'color-blue', size: 4 }, // Z-shape
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'color-yellow', size: 4 }, // S-shape
    // 5-Block Shapes
    { shape: [[1, 1, 1, 1, 1]], color: 'color-purple', size: 5 },
    { shape: [[1], [1], [1], [1], [1]], color: 'color-orange', size: 5 }
];

// --- Inisialisasi & Responsifitas Game ---

// Menghitung ulang ukuran sel berdasarkan ukuran grid di layar
function calculateCellSizes() {
    const gridRect = gameGridElement.getBoundingClientRect();
    CELL_SIZE = gridRect.width / GRID_COLS;
    BLOCK_PIECE_SIZE = CELL_SIZE / 2; // Potongan blok 1/2 ukuran sel grid

    // Set CSS variable untuk ukuran potongan blok
    document.documentElement.style.setProperty('--block-piece-size', `${BLOCK_PIECE_SIZE}px`);

    // Perbarui grid template columns untuk game board
    gameGridElement.style.gridTemplateColumns = `repeat(${GRID_COLS}, ${CELL_SIZE}px)`;
    gameGridElement.style.gridTemplateRows = `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`;

    // Jika ghost element ada, recreate dengan ukuran baru
    if (ghostElement) {
        ghostElement.remove();
        ghostElement = createGhostElement(draggedBlock);
        document.body.appendChild(ghostElement);
        // Posisi akan diperbarui oleh touchmove/mousemove
    }
    // Gambar ulang preview blok untuk memperbarui ukuran
    drawBlockPreview();
}

// Event listener untuk resize window
window.addEventListener('resize', () => {
    calculateCellSizes();
    // Setelah resize, pastikan posisi ghost (jika ada) diperbarui
    if (ghostElement && isDragging) {
        // Posisikan ulang ghost berdasarkan touch/mouse terakhir jika masih dragging
        // Ini akan dihandle oleh touchmove/mousemove yang dipicu oleh gerakan kecil
        // atau jika tidak ada gerakan, dragEnd akan membersihkannya
    }
});


function initializeGame() {
    score = 0;
    updateScoreDisplay();
    gameGrid = Array(GRID_ROWS).fill(0).map(() => Array(GRID_COLS).fill(0)); // Inisialisasi grid kosong

    gameGridElement.innerHTML = ''; // Bersihkan grid lama
    for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;
        gameGridElement.appendChild(cell);
    }
    calculateCellSizes(); // Hitung ukuran sel awal
    updateGridDisplay();
    generateNewBlocks(true); // Hasilkan blok baru untuk awal game
    gameOverlay.classList.add('hidden'); // Sembunyikan overlay game over
    restartButton.addEventListener('click', initializeGame); // Event listener untuk tombol restart
    changeBackgroundColor(); // Set background color awal
}

// --- Fungsi Rendering dan UI ---

function updateGridDisplay() {
    const cells = gameGridElement.children;
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const cellIndex = r * GRID_COLS + c;
            const cellElement = cells[cellIndex];
            cellElement.className = 'grid-cell'; // Reset kelas

            if (gameGrid[r][c] !== 0) {
                cellElement.classList.add('occupied');
                cellElement.classList.add(gameGrid[r][c]); // Tambahkan kelas warna
            }
        }
    }
}

function drawBlockPreview() {
    blockPreviewSlots.forEach((slot, index) => {
        slot.innerHTML = '';
        slot.classList.remove('dragging');
        if (currentBlocks[index]) {
            const blockContainer = document.createElement('div');
            blockContainer.classList.add('draggable-block-container');
            const blockWidth = currentBlocks[index].shape[0].length;
            // Gunakan ukuran CELL_SIZE untuk preview agar konsisten
            blockContainer.style.gridTemplateColumns = `repeat(${blockWidth}, ${BLOCK_PIECE_SIZE}px)`;
            
            currentBlocks[index].shape.forEach(row => {
                row.forEach(cell => {
                    const piece = document.createElement('div');
                    if (cell === 1) {
                        piece.classList.add('block-piece');
                        piece.classList.add(currentBlocks[index].color);
                    }
                    blockContainer.appendChild(piece);
                });
            });
            slot.appendChild(blockContainer);
            slot.dataset.blockIndex = index;
            // Tambahkan event listener untuk setiap slot
            slot.addEventListener('mousedown', startDrag);
            slot.addEventListener('touchstart', startDrag, { passive: false });
        } else {
            // Hapus event listener jika slot kosong untuk mencegah bug
            slot.removeEventListener('mousedown', startDrag);
            slot.removeEventListener('touchstart', startDrag);
        }
    });
}

function createGhostElement(block) {
    if (!block) return null;
    const ghost = document.createElement('div');
    ghost.classList.add('draggable-block-container', 'ghost');
    // Atur ukuran kolom ghost block berdasarkan BLOCK_PIECE_SIZE
    ghost.style.gridTemplateColumns = `repeat(${block.shape[0].length}, ${BLOCK_PIECE_SIZE}px)`;
    
    block.shape.forEach(row => {
        row.forEach(cell => {
            const piece = document.createElement('div');
            if (cell === 1) {
                piece.classList.add('block-piece');
                piece.classList.add(block.color);
            }
            ghost.appendChild(piece);
        });
    });
    return ghost;
}

function highlightCells(block, startRow, startCol) {
    clearHighlights();
    currentHighlightCells = [];

    if (!block) return;

    let isValidPlacement = true;
    const cellsToHighlight = [];

    block.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell === 1) {
                const targetRow = startRow + r;
                const targetCol = startCol + c;

                if (
                    targetRow < 0 || targetRow >= GRID_ROWS ||
                    targetCol < 0 || targetCol >= GRID_COLS ||
                    gameGrid[targetRow][targetCol] !== 0
                ) {
                    isValidPlacement = false;
                }
                cellsToHighlight.push({ r: targetRow, c: targetCol });
            }
        });
    });

    cellsToHighlight.forEach(pos => {
        // Pastikan sel berada di dalam batas grid
        if (pos.r >= 0 && pos.r < GRID_ROWS && pos.c >= 0 && pos.c < GRID_COLS) {
            const cellElement = gameGridElement.children[pos.r * GRID_COLS + pos.c];
            if (cellElement) {
                cellElement.classList.add(isValidPlacement ? 'highlight' : 'invalid');
                currentHighlightCells.push(cellElement);
            }
        }
    });
}

function clearHighlights() {
    currentHighlightCells.forEach(cell => {
        cell.classList.remove('highlight', 'invalid');
    });
    currentHighlightCells = [];
}

// --- Logika Game ---

function generateNewBlocks(isInitial = false) {
    const allSlotsEmpty = currentBlocks.every(block => block === null);
    if (allSlotsEmpty || isInitial) {
        currentBlocks = Array(3).fill(null); // Reset semua slot
        let blocksGenerated = 0;
        let attempts = 0;

        while (blocksGenerated < 3 && attempts < 200) { // Batasi upaya untuk mencegah infinite loop
            const randomIndex = Math.floor(Math.random() * BLOCK_SHAPES.length);
            const newBlock = JSON.parse(JSON.stringify(BLOCK_SHAPES[randomIndex])); // Deep copy

            // Pastikan blok baru bisa ditempatkan di grid
            if (canBlockBePlacedAnywhere(newBlock)) {
                const emptySlotIndex = currentBlocks.findIndex(b => b === null);
                if (emptySlotIndex !== -1) {
                    currentBlocks[emptySlotIndex] = newBlock;
                    blocksGenerated++;
                }
            }
            attempts++;
        }

        // Fallback: Jika ada slot yang kosong setelah mencoba menghasilkan blok yang bisa ditempatkan,
        // isi dengan blok 1x1 atau blok kecil lainnya yang pasti bisa ditempatkan.
        for (let i = 0; i < 3; i++) {
            if (currentBlocks[i] === null) {
                // Cari blok 1x1 atau blok kecil lainnya
                const smallBlock = BLOCK_SHAPES.find(b => b.size === 1 || (b.shape.length <= 2 && b.shape[0].length <= 2));
                if (smallBlock) {
                    currentBlocks[i] = JSON.parse(JSON.stringify(smallBlock));
                } else {
                    // Jika tidak ada blok kecil, fallback ke blok acak apapun
                    currentBlocks[i] = JSON.parse(JSON.stringify(BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)]));
                }
            }
        }
    }
    drawBlockPreview();
    checkGameOver(); // Periksa game over setelah menghasilkan blok baru
}

function canBlockBePlacedAnywhere(block) {
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (canPlaceBlock(block, r, c)) {
                return true;
            }
        }
    }
    return false;
}

function placeBlock(block, startRow, startCol) {
    if (!canPlaceBlock(block, startRow, startCol)) {
        return false;
    }

    block.shape.forEach((row, r) => {
        row.forEach((cell, c) => {
            if (cell === 1) {
                gameGrid[startRow + r][startCol + c] = block.color;
            }
        });
    });
    return true;
}

function canPlaceBlock(block, startRow, startCol) {
    for (let r = 0; r < block.shape.length; r++) {
        for (let c = 0; c < block.shape[r].length; c++) {
            if (block.shape[r][c] === 1) {
                const targetRow = startRow + r;
                const targetCol = startCol + c;

                if (
                    targetRow < 0 || targetRow >= GRID_ROWS || // Cek batas baris
                    targetCol < 0 || targetCol >= GRID_COLS || // Cek batas kolom
                    gameGrid[targetRow][targetCol] !== 0 // Cek apakah sudah terisi
                ) {
                    return false;
                }
            }
        }
    }
    return true;
}

function clearLines() {
    let cellsToClear = [];
    let linesClearedCount = 0;

    // Check full rows
    for (let r = 0; r < GRID_ROWS; r++) {
        let isRowFull = true;
        for (let c = 0; c < GRID_COLS; c++) {
            if (gameGrid[r][c] === 0) {
                isRowFull = false;
                break;
            }
        }
        if (isRowFull) {
            linesClearedCount++;
            for (let c = 0; c < GRID_COLS; c++) {
                cellsToClear.push({ r: r, c: c });
            }
        }
    }

    // Check full columns
    for (let c = 0; c < GRID_COLS; c++) {
        let isColFull = true;
        for (let r = 0; r < GRID_ROWS; r++) {
            if (gameGrid[r][c] === 0) {
                isColFull = false;
                break;
            }
        }
        if (isColFull) {
            linesClearedCount++;
            for (let r = 0; r < GRID_ROWS; r++) {
                // Hindari menambahkan duplikat jika sel sudah menjadi bagian dari baris yang dihapus
                if (!cellsToClear.some(cell => cell.r === r && cell.c === c)) {
                    cellsToClear.push({ r: r, c: c });
                }
            }
        }
    }

    const uniqueCellsToClear = cellsToClear; // uniqueness sudah dihandle di atas
    
    if (uniqueCellsToClear.length > 0) {
        // Animasi ledakan
        uniqueCellsToClear.forEach(cell => {
            const cellElement = gameGridElement.children[cell.r * GRID_COLS + cell.c];
            createExplosionEffect(cellElement);
            // Tambahkan transisi sementara untuk efek visual sebelum dihapus
            cellElement.style.transition = 'background-color 0.2s ease-out';
            cellElement.style.backgroundColor = '#ecf0f1'; // Warna putih sesaat
        });

        setTimeout(() => {
            // Hapus blok setelah animasi
            uniqueCellsToClear.forEach(cell => {
                gameGrid[cell.r][cell.c] = 0;
                const cellElement = gameGridElement.children[cell.r * GRID_COLS + cell.c];
                cellElement.style.transition = ''; // Hapus transisi inline
                cellElement.style.backgroundColor = ''; // Reset warna background
            });
            updateGridDisplay(); // Perbarui tampilan grid

            // Perhitungan Skor
            score += uniqueCellsToClear.length * 10; // Skor dasar per sel
            if (linesClearedCount > 1) { // Bonus untuk clearing multiple lines/columns
                score += (linesClearedCount * 10) * linesClearedCount; // Bonus kuadratik
            }
            if (uniqueCellsToClear.length === GRID_ROWS * GRID_COLS) { // Bonus untuk full clear (bug 5)
                score += 1000; // Contoh bonus
                overlayMessage.textContent = 'FULL CLEAR BONUS!'; // Ubah pesan game over jika ini terjadi
                setTimeout(() => {
                    overlayMessage.textContent = 'GAME OVER!'; // Kembalikan pesan default
                }, 1500); // Tampilkan sebentar
            }

            updateScoreDisplay();
            changeBackgroundColor(); // Ganti background setelah clear
            checkGameOver(); // Periksa game over setelah clear
        }, 300); // Durasi animasi ledakan
    } else {
        checkGameOver(); // Periksa game over meskipun tidak ada baris yang clear
    }
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Skor: ${score}`;
}

function createExplosionEffect(cellElement) {
    const rect = cellElement.getBoundingClientRect();
    const numParticles = 5 + Math.floor(Math.random() * 5); // 5-9 partikel

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('explosion-particle');
        document.body.appendChild(particle); // Append to body to animate freely

        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        particle.style.width = particle.style.height = `${Math.random() * 8 + 4}px`; // Ukuran partikel

        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 50 + 20; // Jarak ledakan
        const endX = startX + distance * Math.cos(angle);
        const endY = startY + distance * Math.sin(angle);

        particle.style.setProperty('--x', `${endX - startX}px`);
        particle.style.setProperty('--y', `${endY - startY}px`);

        // Hapus partikel setelah animasi selesai
        particle.addEventListener('animationend', () => particle.remove());
    }
}

function checkGameOver() {
    // Game Over jika tidak ada blok yang tersisa DAN tidak ada blok baru yang bisa ditempatkan
    const hasPlayableBlocks = currentBlocks.some(block => canBlockBePlacedAnywhere(block));

    if (!hasPlayableBlocks && currentBlocks.every(block => block === null)) {
        // Ini kondisi ketika semua slot kosong dan tidak bisa generate blok baru yang bisa ditempatkan
        overlayMessage.textContent = 'TIDAK ADA BLOK BISA DITEMPATKAN!'; // Pesan khusus
        showGameOver();
        return;
    }

    // Game Over jika semua slot blok sudah diisi dan tidak ada lagi yang bisa ditempatkan (bug 3)
    // DAN tidak ada baris/kolom yang bisa di-clear
    if (currentBlocks.every(block => block !== null) && !hasPlayableBlocks) {
        overlayMessage.textContent = 'TIDAK BISA MAIN LAGI!'; // Pesan game over default
        showGameOver();
        return;
    }

    // Jika ada blok yang bisa ditempatkan, atau jika masih ada slot kosong yang bisa diisi, game belum over
    if (currentBlocks.some(block => block !== null) && hasPlayableBlocks) {
        gameOverlay.classList.add('hidden'); // Sembunyikan overlay jika game belum over
    } else if (currentBlocks.every(block => block === null) && !hasPlayableBlocks) {
        // Semua blok sudah habis, tapi tidak ada ruang di grid untuk blok baru
        // Ini adalah kondisi game over yang sebenarnya
        overlayMessage.textContent = 'GAME OVER!';
        showGameOver();
    }
}


function showGameOver() {
    // Reset skor jika game over (bug 3)
    score = 0;
    updateScoreDisplay();
    gameOverlay.classList.remove('hidden');
}

function changeBackgroundColor() { // Bug 4: background ganti-ganti gelap
    currentBgColorIndex = (currentBgColorIndex + 1) % BACKGROUND_COLORS.length;
    bodyElement.style.backgroundColor = BACKGROUND_COLORS[currentBgColorIndex];
}

// --- Event Handlers (Mouse & Touch) ---

function getEventCoords(event) {
    if (event.touches && event.touches.length > 0) {
        return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    return { x: event.clientX, y: event.clientY };
}

function getGridCellAtCoords(x, y) {
    const gridRect = gameGridElement.getBoundingClientRect();

    // Pastikan koordinat ada di dalam grid
    if (x < gridRect.left || x >= gridRect.right ||
        y < gridRect.top || y >= gridRect.bottom) {
        return null;
    }

    const col = Math.floor((x - gridRect.left) / CELL_SIZE);
    const row = Math.floor((y - gridRect.top) / CELL_SIZE);

    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
        return { row, col, element: gameGridElement.children[row * GRID_COLS + col] };
    }
    return null;
}

function startDrag(event) {
    if (gameOverlay.classList.contains('hidden')) { // Hanya bisa drag jika game tidak over
        isDragging = true;
        const slot = event.currentTarget;
        draggedBlockIndex = parseInt(slot.dataset.blockIndex);
        draggedBlock = currentBlocks[draggedBlockIndex];

        if (!draggedBlock) { // Tidak ada blok di slot ini
            isDragging = false;
            return;
        }

        slot.classList.add('dragging');
        slot.innerHTML = ''; // Kosongkan slot asli

        // Buat ghost element
        ghostElement = createGhostElement(draggedBlock);
        document.body.appendChild(ghostElement);

        const coords = getEventCoords(event);
        const ghostRect = ghostElement.getBoundingClientRect();
        // Hitung offset agar pusat ghost sesuai dengan jari (bug 1)
        dragOffsetX = coords.x - (ghostRect.width / 2);
        dragOffsetY = coords.y - (ghostRect.height / 2);

        // Posisikan ghost awal
        ghostElement.style.left = `${dragOffsetX}px`;
        ghostElement.style.top = `${dragOffsetY}px`;

        // Tambahkan event listener global untuk mouse/touch move/end
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', dragEnd);
        document.addEventListener('touchcancel', dragEnd); // Untuk kasus sentuhan dibatalkan
    }
}

function drag(event) {
    if (!isDragging || !ghostElement || !draggedBlock) return;

    event.preventDefault(); // Mencegah scrolling dan zoom (bug 6)

    const coords = getEventCoords(event);
    
    // Posisikan ghost mengikuti jari dengan offset yang dihitung (bug 1)
    ghostElement.style.left = `${coords.x - ghostElement.offsetWidth / 2}px`;
    ghostElement.style.top = `${coords.y - ghostElement.offsetHeight / 2}px`;

    const targetCellInfo = getGridCellAtCoords(coords.x, coords.y);

    if (targetCellInfo) {
        // Hitung posisi awal blok relatif terhadap sel yang disentuh
        const blockRows = draggedBlock.shape.length;
        const blockCols = draggedBlock.shape[0].length;
        // Posisikan ghost block agar pusatnya di sel yang disentuh
        const startRow = targetCellInfo.row - Math.floor(blockRows / 2);
        const startCol = targetCellInfo.col - Math.floor(blockCols / 2);
        highlightCells(draggedBlock, startRow, startCol);
    } else {
        clearHighlights();
    }
}

function dragEnd(event) {
    if (!isDragging) return;

    isDragging = false;
    clearHighlights();

    if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
    }
    
    // Hapus kelas 'dragging' dari slot asal
    if (blockPreviewSlots[draggedBlockIndex]) {
        blockPreviewSlots[draggedBlockIndex].classList.remove('dragging');
    }

    const coords = getEventCoords(event);
    const targetCellInfo = getGridCellAtCoords(coords.x, coords.y);

    if (targetCellInfo && draggedBlock) {
        // Hitung posisi awal blok relatif terhadap sel yang disentuh
        const blockRows = draggedBlock.shape.length;
        const blockCols = draggedBlock.shape[0].length;
        const startRow = targetCellInfo.row - Math.floor(blockRows / 2);
        const startCol = targetCellInfo.col - Math.floor(blockCols / 2);

        if (placeBlock(draggedBlock, startRow, startCol)) {
            currentBlocks[draggedBlockIndex] = null; // Hapus blok dari slot
            updateGridDisplay();
            drawBlockPreview(); // Gambar ulang preview
            clearLines(); // Periksa dan hapus baris/kolom
            checkGameOver(); // Periksa game over
        } else {
            // Jika tidak bisa ditempatkan, kembalikan blok ke slot asalnya
            if (draggedBlockIndex !== -1 && blockPreviewSlots[draggedBlockIndex].innerHTML === '') {
                currentBlocks[draggedBlockIndex] = draggedBlock;
                drawBlockPreview();
            }
            // Tambahkan feedback visual jika placement gagal
            console.log("Penempatan blok gagal.");
        }
    } else {
        // Jika dilepaskan di luar grid, kembalikan blok ke slot asalnya
        if (draggedBlockIndex !== -1 && blockPreviewSlots[draggedBlockIndex].innerHTML === '') {
            currentBlocks[draggedBlockIndex] = draggedBlock;
            drawBlockPreview();
        }
    }

    // Hapus event listener global
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', dragEnd);
    document.removeEventListener('touchcancel', dragEnd);
    
    draggedBlock = null;
    draggedBlockIndex = -1;
}

// --- Mulai Game ---
document.addEventListener('DOMContentLoaded', initializeGame);
