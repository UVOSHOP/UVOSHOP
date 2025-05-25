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
const blockPreviewContainer = document.getElementById('block-preview'); // Asumsi ada kontainer ini di HTML

// Konstanta Game
const GRID_ROWS = 9;
const GRID_COLS = 9;
let CELL_SIZE = 40; // Ukuran sel dasar, akan dihitung ulang
let BLOCK_PREVIEW_PIECE_SIZE = 20; // Ukuran potongan blok di preview, akan dihitung ulang

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
let dragOffsetX = 0; // Offset X untuk penempatan ghost (relatif terhadap sudut kiri atas blok)
let dragOffsetY = 0; // Offset Y untuk penempatan ghost (relatif terhadap sudut kiri atas blok)

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
    { shape: [[1, 1, 1], [0, 1, 0]], color: 'color-purple', size: 4 }, // T-shape
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
    const gameAreaWidth = document.querySelector('.game-area').clientWidth; // Ambil lebar area game
    const gameAreaHeight = document.querySelector('.game-area').clientHeight; // Ambil tinggi area game

    // Hitung CELL_SIZE berdasarkan lebar yang tersedia untuk grid
    // Beri sedikit margin untuk keamanan
    CELL_SIZE = Math.floor((gameAreaWidth * 0.95) / GRID_COLS);
    // Pastikan CELL_SIZE tidak terlalu besar atau terlalu kecil
    CELL_SIZE = Math.min(CELL_SIZE, Math.floor((gameAreaHeight * 0.6) / GRID_ROWS), 50); // Maks 50px, sesuaikan dengan tinggi juga
    CELL_SIZE = Math.max(CELL_SIZE, 20); // Minimal 20px

    // BLOCK_PREVIEW_PIECE_SIZE harus lebih kecil dari CELL_SIZE
    // Bisa disesuaikan agar tidak terlalu besar di preview
    BLOCK_PREVIEW_PIECE_SIZE = Math.floor(CELL_SIZE * 0.4); // Sekitar 40% dari CELL_SIZE
    BLOCK_PREVIEW_PIECE_SIZE = Math.max(BLOCK_PREVIEW_PIECE_SIZE, 8); // Minimal 8px
    BLOCK_PREVIEW_PIECE_SIZE = Math.min(BLOCK_PREVIEW_PIECE_SIZE, 20); // Maksimal 20px agar tidak terlalu besar

    // Set CSS variable untuk ukuran potongan blok
    document.documentElement.style.setProperty('--cell-size', `${CELL_SIZE}px`);
    document.documentElement.style.setProperty('--block-preview-piece-size', `${BLOCK_PREVIEW_PIECE_SIZE}px`);

    // Perbarui grid template columns untuk game board
    gameGridElement.style.gridTemplateColumns = `repeat(${GRID_COLS}, var(--cell-size))`;
    gameGridElement.style.gridTemplateRows = `repeat(${GRID_ROWS}, var(--cell-size))`;

    // Pastikan game-grid sendiri memiliki ukuran yang sesuai
    gameGridElement.style.width = `${GRID_COLS * CELL_SIZE}px`;
    gameGridElement.style.height = `${GRID_ROWS * CELL_SIZE}px`;

    // Jika ghost element ada, recreate dengan ukuran baru
    if (ghostElement) {
        ghostElement.remove();
        ghostElement = createGhostElement(draggedBlock, CELL_SIZE); // Kirim CELL_SIZE untuk ghost
        document.body.appendChild(ghostElement);
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
    // Pastikan event listener hanya ditambahkan sekali
    restartButton.removeEventListener('click', initializeGame);
    restartButton.addEventListener('click', initializeGame);
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
        slot.classList.remove('dragging'); // Hapus kelas dragging jika ada
        if (currentBlocks[index]) {
            const blockContainer = document.createElement('div');
            blockContainer.classList.add('draggable-block-container');
            // Gunakan BLOCK_PREVIEW_PIECE_SIZE untuk preview
            const blockWidth = currentBlocks[index].shape[0].length;
            blockContainer.style.gridTemplateColumns = `repeat(${blockWidth}, ${BLOCK_PREVIEW_PIECE_SIZE}px)`;
            
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

// createGhostElement sekarang menerima cellSize untuk ukuran potongan
function createGhostElement(block, cellSizeForGhost) {
    if (!block) return null;
    const ghost = document.createElement('div');
    ghost.classList.add('draggable-block-container', 'ghost');
    // Gunakan cellSizeForGhost (CELL_SIZE dari game grid) untuk ukuran potongan ghost
    ghost.style.gridTemplateColumns = `repeat(${block.shape[0].length}, ${cellSizeForGhost}px)`;
    
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

            // Opsional: uncomment jika Anda ingin memastikan blok bisa ditempatkan
            // if (canBlockBePlacedAnywhere(newBlock)) {
                const emptySlotIndex = currentBlocks.findIndex(b => b === null);
                if (emptySlotIndex !== -1) {
                    currentBlocks[emptySlotIndex] = newBlock;
                    blocksGenerated++;
                    blocksInCurrentSet++; // Tambahkan ke counter blok
                }
            // }
            attempts++;
        }

        // Fallback: Jika ada slot yang kosong setelah mencoba menghasilkan blok,
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
        });
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
            const cellColorClass = gameGrid[cell.r][cell.c];
            
            cellElement.style.transition = 'background-color 0.2s ease-out';
            cellElement.style.backgroundColor = '#ecf0f1'; // Warna putih sesaat
            
            createExplosionEffect(cellElement, cellColorClass);
        });

        setTimeout(() => {
            uniqueCellsToClear.forEach(cell => {
                gameGrid[cell.r][cell.c] = 0; // Bersihkan sel di grid
                const cellElement = gameGridElement.children[cell.r * GRID_COLS + cell.c];
                
                cellElement.style.transition = '';
                cellElement.style.backgroundColor = ''; // Hapus inline style background color
                cellElement.classList.remove('occupied', 'color-red', 'color-blue', 'color-yellow', 'color-purple', 'color-orange', 'color-green', 'color-cyan', 'color-pink');
                cellElement.style.backgroundColor = '#3d3d3d'; // Setel kembali ke warna default sel kosong
            });

            updateGridDisplay();
            addScore(uniqueCellsToClear.length * 10 + (linesClearedCount > 1 ? linesClearedCount * 50 : 0));
            changeBackgroundColor();
            checkGameOver();
        }, 500);
    } else {
        checkGameOver();
    }
}

function checkGameOver() {
    let canPlaceAnyRemainingBlock = false;
    for (let i = 0; i < currentBlocks.length; i++) {
        const block = currentBlocks[i];
        if (block !== null && canBlockBePlacedAnywhere(block)) {
            canPlaceAnyRemainingBlock = true;
            break;
        }
    }

    if (!canPlaceAnyRemainingBlock) {
        overlayMessage.textContent = 'GAME OVER!';
        gameOverlay.classList.remove('hidden');
    } else {
        gameOverlay.classList.add('hidden');
    }
}


function createExplosionEffect(cellElement, blockColorClass) {
    const rect = cellElement.getBoundingClientRect();
    const numParticles = 10;
    const computedStyle = getComputedStyle(cellElement);
    const baseColor = computedStyle.backgroundColor;

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('explosion-particle');
        document.body.appendChild(particle);

        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = baseColor;

        particle.style.left = `${rect.left + rect.width / 2 - size / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2 - size / 2}px`;

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 20;
        const endX = distance * Math.cos(angle);
        const endY = distance * Math.sin(angle);

        particle.style.setProperty('--x', `${endX}px`);
        particle.style.setProperty('--y', `${endY}px`);

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
        return;
    }
    e.preventDefault();

    isDragging = true;
    const slot = e.currentTarget;
    draggedBlockIndex = parseInt(slot.dataset.blockIndex);
    draggedBlock = currentBlocks[draggedBlockIndex];

    if (!draggedBlock) return;

    // Sembunyikan blok asli di slot
    slot.classList.add('dragging');

    // Buat ghost element dengan ukuran CELL_SIZE dari grid
    ghostElement = createGhostElement(draggedBlock, CELL_SIZE);
    document.body.appendChild(ghostElement);

    const { x, y } = getEventCoordinates(e);
    const ghostRect = ghostElement.getBoundingClientRect();

    // Hitung offset agar pusat blok berada di bawah kursor/jari
    dragOffsetX = ghostRect.width / 2;
    dragOffsetY = ghostRect.height / 2;

    // Posisikan ghost
    ghostElement.style.left = `${x - dragOffsetX}px`;
    ghostElement.style.top = `${y - dragOffsetY}px`;

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
}

function drag(e) {
    if (!isDragging || !ghostElement || !draggedBlock) return;
    e.preventDefault();

    const { x, y } = getEventCoordinates(e);

    // Posisikan ghost
    ghostElement.style.left = `${x - dragOffsetX}px`;
    ghostElement.style.top = `${y - dragOffsetY}px`;

    const gridRect = gameGridElement.getBoundingClientRect();
    
    // hitung posisi di grid berdasarkan top-left blok, bukan kursor
    // Ini harus mempertimbangkan offset yang sudah diterapkan ke ghost
    const targetCol = Math.floor((x - gridRect.left - dragOffsetX) / CELL_SIZE);
    const targetRow = Math.floor((y - gridRect.top - dragOffsetY) / CELL_SIZE);

    // Clamp targetRow dan targetCol agar tidak keluar dari batas grid
    const clampedTargetCol = Math.max(0, Math.min(GRID_COLS - draggedBlock.shape[0].length, targetCol));
    const clampedTargetRow = Math.max(0, Math.min(GRID_ROWS - draggedBlock.shape.length, targetRow));

    highlightCells(draggedBlock, clampedTargetRow, clampedTargetCol);
}

function endDrag(e) {
    if (!isDragging) return;

    isDragging = false;
    clearHighlights();

    if (ghostElement) {
        ghostElement.remove();
        ghostElement = null;
    }
    
    const slotElement = blockPreviewSlots[draggedBlockIndex];
    if (slotElement) {
        slotElement.classList.remove('dragging');
    }

    const { x, y } = getEventCoordinates(e);
    const gridRect = gameGridElement.getBoundingClientRect();

    let placedSuccessfully = false;

    // Periksa apakah blok dilepaskan di dalam area grid
    if (x >= gridRect.left && x <= gridRect.right &&
        y >= gridRect.top && y <= gridRect.bottom) {
        
        // hitung posisi di grid berdasarkan top-left blok, mempertimbangkan offset drag
        const targetCol = Math.floor((x - gridRect.left - dragOffsetX) / CELL_SIZE);
        const targetRow = Math.floor((y - gridRect.top - dragOffsetY) / CELL_SIZE);

        const clampedTargetRow = Math.max(0, Math.min(GRID_ROWS - draggedBlock.shape.length, targetRow));
        const clampedTargetCol = Math.max(0, Math.min(GRID_COLS - draggedBlock.shape[0].length, targetCol));

        if (placeBlock(draggedBlock, clampedTargetRow, clampedTargetCol)) {
            updateGridDisplay();
            addScore(draggedBlock.size);
            
            currentBlocks[draggedBlockIndex] = null;
            blocksInCurrentSet--;
            placedSuccessfully = true;

            if (blocksInCurrentSet === 0) {
                generateNewBlocks();
            } else {
                drawBlockPreview();
            }

            clearLines();
        }
    }
    
    if (!placedSuccessfully) {
        drawBlockPreview();
        checkGameOver();
    }

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
