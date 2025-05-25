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
let blocksInCurrentSet = 0; // Melacak berapa banyak blok yang ada di 3 slot saat ini
let draggedBlock = null; // Blok yang sedang diseret
let draggedBlockIndex = -1; // Indeks blok di currentBlocks
let ghostElement = null; // Elemen DOM untuk ghost block
let currentHighlightCells = []; // Sel yang sedang di-highlight di grid
let isDragging = false; // Flag untuk status drag
let dragOffsetX = 0; // Offset X untuk penempatan ghost
let dragOffsetY = 0; // Offset Y untuk penempatan ghost

// Daftar warna background gelap yang akan berganti-ganti
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
});

function initializeGame() {
    score = 0;
    updateScoreDisplay();
    gameGrid = Array(GRID_ROWS).fill(0).map(() => Array(GRID_COLS).fill(0)); // Inisialisasi grid kosong
    blocksInCurrentSet = 0; // Reset counter blok

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

function updateScoreDisplay() {
    scoreDisplay.textContent = `Skor: ${score}`;
}

function addScore(points) {
    score += points;
    updateScoreDisplay();
}

function drawBlockPreview() {
    blockPreviewSlots.forEach((slot, index) => {
        slot.innerHTML = '';
        slot.classList.remove('dragging');
        if (currentBlocks[index]) {
            const blockContainer = document.createElement('div');
            blockContainer.classList.add('draggable-block-container');
            const blockWidth = currentBlocks[index].shape[0].length;
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
    // Jika ini inisialisasi game ATAU semua blok di set sebelumnya sudah terpakai
    if (isInitial || blocksInCurrentSet === 0) {
        currentBlocks = Array(3).fill(null); // Reset semua slot
        let blocksGenerated = 0;
        let attempts = 0;
        blocksInCurrentSet = 0; // Reset counter blok

        while (blocksGenerated < 3 && attempts < 200) { // Batasi upaya untuk mencegah infinite loop
            const randomIndex = Math.floor(Math.random() * BLOCK_SHAPES.length);
            const newBlock = JSON.parse(JSON.stringify(BLOCK_SHAPES[randomIndex])); // Deep copy

            // Pastikan blok baru bisa ditempatkan di grid
            if (canBlockBePlacedAnywhere(newBlock)) {
                const emptySlotIndex = currentBlocks.findIndex(b => b === null);
                if (emptySlotIndex !== -1) {
                    currentBlocks[emptySlotIndex] = newBlock;
                    blocksGenerated++;
                    blocksInCurrentSet++; // Tambahkan ke counter blok
                }
            }
            attempts++;
        }

        // Fallback: Jika ada slot yang kosong setelah mencoba menghasilkan blok yang bisa ditempatkan,
        // isi dengan blok 1x1 atau blok kecil lainnya yang pasti bisa ditempatkan.
        for (let i = 0; i < 3; i++) {
            if (currentBlocks[i] === null) {
                const smallBlock = BLOCK_SHAPES.find(b => b.size === 1 || (b.shape.length <= 2 && b.shape[0].length <= 2));
                if (smallBlock) {
                    currentBlocks[i] = JSON.parse(JSON.stringify(smallBlock));
                } else {
                    currentBlocks[i] = JSON.parse(JSON.stringify(BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)]));
                }
                if (currentBlocks[i] !== null) { // Pastikan blok berhasil diisi
                    blocksInCurrentSet++;
                }
            }
        }
    }
    drawBlockPreview();
    checkGameOver(); // Periksa game over setelah menghasilkan blok baru
}

function canBlockBePlacedAnywhere(block) {
    if (!block) return false;
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

    // Pastikan hanya sel unik yang akan dihapus
    const uniqueCellsToClear = Array.from(new Set(cellsToClear.map(JSON.stringify))).map(JSON.parse);
    
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
            // Setelah animasi selesai, baru bersihkan grid dan update skor
            uniqueCellsToClear.forEach(cell => {
                gameGrid[cell.r][cell.c] = 0; // Bersihkan sel di grid
                const cellElement = gameGridElement.children[cell.r * GRID_COLS + cell.c];
                cellElement.style.transition = ''; // Hapus transisi sementara
                cellElement.classList.remove('occupied', 'color-red', 'color-blue', 'color-yellow', 'color-purple', 'color-orange', 'color-green', 'color-cyan', 'color-pink'); // Hapus kelas warna
            });

            updateGridDisplay(); // Perbarui tampilan grid
            addScore(uniqueCellsToClear.length * 10 + (linesClearedCount > 1 ? linesClearedCount * 50 : 0)); // Tambahkan skor
            changeBackgroundColor(); // Ganti warna background
            checkGameOver(); // Periksa game over setelah pembersihan
        }, 500); // Sesuaikan durasi timeout dengan durasi animasi ledakan
    } else {
        // Jika tidak ada garis yang bersih, langsung cek game over
        checkGameOver();
    }
}

function checkGameOver() {
    let canPlaceAnyBlock = false;
    for (let i = 0; i < currentBlocks.length; i++) {
        const block = currentBlocks[i];
        if (block !== null) {
            if (canBlockBePlacedAnywhere(block)) {
                canPlaceAnyBlock = true;
                break; // Cukup temukan satu blok yang bisa ditempatkan
            }
        }
    }

    // Jika semua slot blok kosong DAN tidak ada blok yang bisa ditempatkan
    // ATAU jika masih ada blok di slot tetapi TIDAK ADA SATUPUN yang bisa ditempatkan
    if (!canPlaceAnyBlock && blocksInCurrentSet > 0) {
        // Ini adalah skenario di mana masih ada blok di slot, tapi tidak ada yang bisa diletakkan.
        // Game Over!
        overlayMessage.textContent = 'GAME OVER!';
        gameOverlay.classList.remove('hidden');
    } else if (!canPlaceAnyBlock && blocksInCurrentSet === 0) {
        // Ini adalah skenario ketika semua blok di set sebelumnya telah terpakai,
        // dan set blok baru yang dihasilkan juga tidak ada yang bisa diletakkan.
        // Game Over!
        overlayMessage.textContent = 'GAME OVER!';
        gameOverlay.classList.remove('hidden');
    } else {
        // Permainan masih berlanjut
        gameOverlay.classList.add('hidden');
    }
}


function createExplosionEffect(cellElement) {
    const rect = cellElement.getBoundingClientRect();
    const numParticles = 10;
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('explosion-particle');
        document.body.appendChild(particle);

        const size = Math.random() * 10 + 5; // Ukuran partikel acak
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = cellElement.style.backgroundColor || getComputedStyle(cellElement).backgroundColor;

        // Posisi awal partikel di tengah sel
        particle.style.left = `${rect.left + rect.width / 2 - size / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2 - size / 2}px`;

        // Posisi akhir acak
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 20;
        const endX = distance * Math.cos(angle);
        const endY = distance * Math.sin(angle);

        particle.style.setProperty('--x', `${endX}px`);
        particle.style.setProperty('--y', `${endY}px`);

        // Hapus partikel setelah animasi selesai
        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    }
}

function changeBackgroundColor() {
    currentBgColorIndex = (currentBgColorIndex + 1) % BACKGROUND_COLORS.length;
    bodyElement.style.backgroundColor = BACKGROUND_COLORS[currentBgColorIndex];
}

// --- Drag & Drop / Touch Events ---
function getEventCoordinates(e) {
    if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function startDrag(e) {
    if (e.target.closest('.block-slot:empty')) {
        return; // Jangan mulai drag jika slot kosong
    }
    e.preventDefault(); // Mencegah scrolling pada touch devices

    isDragging = true;
    const slot = e.currentTarget;
    draggedBlockIndex = parseInt(slot.dataset.blockIndex);
    draggedBlock = currentBlocks[draggedBlockIndex];

    if (!draggedBlock) return;

    slot.classList.add('dragging');

    // Buat ghost element
    ghostElement = createGhostElement(draggedBlock);
    document.body.appendChild(ghostElement);

    const { x, y } = getEventCoordinates(e);
    const ghostRect = ghostElement.getBoundingClientRect();

    // Hitung offset agar pusat blok berada di bawah kursor/jari
    dragOffsetX = ghostRect.width / 2;
    dragOffsetY = ghostRect.height / 2;

    // Posisikan ghost
    ghostElement.style.left = `${x - dragOffsetX}px`;
    ghostElement.style.top = `${y - dragOffsetY}px`;

    // Tambahkan event listener untuk drag
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag); // Tambahan untuk touch cancel
}

function drag(e) {
    if (!isDragging || !ghostElement || !draggedBlock) return;
    e.preventDefault(); // Mencegah scrolling saat drag di touch devices

    const { x, y } = getEventCoordinates(e);

    // Posisikan ghost
    ghostElement.style.left = `${x - dragOffsetX}px`;
    ghostElement.style.top = `${y - dragOffsetY}px`;

    // Tentukan sel grid yang sedang dihover
    const gridRect = gameGridElement.getBoundingClientRect();
    const relativeX = x - gridRect.left;
    const relativeY = y - gridRect.top;

    let col = Math.floor(relativeX / CELL_SIZE);
    let row = Math.floor(relativeY / CELL_SIZE);

    // Pastikan posisi highlight mengikuti asal blok (biasanya sudut kiri atas)
    // Bukan mengikuti pusat kursor, ini penting untuk penempatan yang akurat
    const blockShapeWidth = draggedBlock.shape[0].length;
    const blockShapeHeight = draggedBlock.shape.length;

    // Adjust row/col based on the top-left corner of the block, not the cursor center
    // This correction is crucial if dragOffsetX/Y are based on block center
    const adjustedX = x - ghostElement.getBoundingClientRect().width / 2; // Cursor x relative to the block's top-left corner
    const adjustedY = y - ghostElement.getBoundingClientRect().height / 2; // Cursor y relative to the block's top-left corner

    col = Math.floor((adjustedX - gridRect.left) / CELL_SIZE);
    row = Math.floor((adjustedY - gridRect.top) / CELL_SIZE);


    // Pastikan col/row berada dalam batas grid
    col = Math.max(0, Math.min(GRID_COLS - blockShapeWidth, col));
    row = Math.max(0, Math.min(GRID_ROWS - blockShapeHeight, row));

    highlightCells(draggedBlock, row, col);
}

function endDrag(e) {
    if (!isDragging) return;

    isDragging = false;
    clearHighlights();

    if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
    }
    
    // Hapus kelas 'dragging' dari slot yang relevan
    const slotElement = blockPreviewSlots[draggedBlockIndex];
    if (slotElement) {
        slotElement.classList.remove('dragging');
    }

    // Tentukan sel grid tempat blok dilepas
    const { x, y } = getEventCoordinates(e);
    const gridRect = gameGridElement.getBoundingClientRect();

    if (x >= gridRect.left && x <= gridRect.right &&
        y >= gridRect.top && y <= gridRect.bottom) {
        
        // Hitung posisi kolom dan baris di grid
        const relativeX = x - gridRect.left;
        const relativeY = y - gridRect.top;

        // hitung posisi di grid berdasarkan top-left blok, bukan kursor
        const blockGhostWidth = draggedBlock.shape[0].length * BLOCK_PIECE_SIZE;
        const blockGhostHeight = draggedBlock.shape.length * BLOCK_PIECE_SIZE;

        const targetCol = Math.floor((x - gridRect.left - (blockGhostWidth / 2)) / CELL_SIZE);
        const targetRow = Math.floor((y - gridRect.top - (blockGhostHeight / 2)) / CELL_SIZE);


        // Clamp targetRow dan targetCol agar tidak keluar dari batas grid
        const clampedTargetRow = Math.max(0, Math.min(GRID_ROWS - draggedBlock.shape.length, targetRow));
        const clampedTargetCol = Math.max(0, Math.min(GRID_COLS - draggedBlock.shape[0].length, targetCol));

        // Coba tempatkan blok
        if (placeBlock(draggedBlock, clampedTargetRow, clampedTargetCol)) {
            updateGridDisplay();
            addScore(draggedBlock.size); // Tambahkan skor berdasarkan ukuran blok
            
            // Hapus blok dari slot
            currentBlocks[draggedBlockIndex] = null;
            blocksInCurrentSet--; // Kurangi hitungan blok yang tersisa

            // Jika semua blok di set saat ini sudah ditempatkan
            if (blocksInCurrentSet === 0) {
                generateNewBlocks(); // Hasilkan set blok baru
            } else {
                // Jika masih ada blok di slot, hanya gambar ulang preview
                drawBlockPreview();
            }

            clearLines(); // Periksa dan bersihkan garis (akan memanggil checkGameOver)
        } else {
            // Blok tidak bisa ditempatkan, kembalikan ke slot atau biarkan dihilangkan
            // Untuk game ini, kita akan membuat pemain kehilangan blok yang gagal ditempatkan.
            // Jika ingin dikembalikan ke slot, Anda bisa menghapus `currentBlocks[draggedBlockIndex] = null;`
            // dan memanggil `drawBlockPreview();` saja di sini.
            // Untuk gameplay yang lebih menantang, kita biarkan bloknya hilang.
            drawBlockPreview(); // Gambar ulang untuk memastikan slot terlihat kosong jika blok hilang
            checkGameOver(); // Periksa game over jika ada situasi macet
        }
    } else {
        // Blok dilepaskan di luar area grid, anggap dibatalkan
        drawBlockPreview(); // Gambar ulang untuk memastikan slot terlihat seperti semula
        checkGameOver(); // Periksa game over jika ini menyebabkan kondisi macet
    }

    // Hapus semua event listener drag/drop
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    document.removeEventListener('touchcancel', endDrag);

    draggedBlock = null;
    draggedBlockIndex = -1;
}

// Inisialisasi game saat DOM siap
document.addEventListener('DOMContentLoaded', initializeGame);

//ADITdeveloper
