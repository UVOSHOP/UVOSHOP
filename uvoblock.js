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
const gameAreaElement = document.querySelector('.game-area'); // Ambil referensi ke game-area

// Konstanta Game
const GRID_ROWS = 9;
const GRID_COLS = 9;
let CELL_SIZE = 40; // Ukuran sel dasar, akan dihitung ulang
let BLOCK_PREVIEW_PIECE_SIZE = 20; // Ukuran potongan blok di preview, akan dihitung ulang

// Variabel Game State
let gameGrid = [];
let score = 0;
let currentBlocks = [];
let blocksInCurrentSet = 0;
let draggedBlock = null;
let draggedBlockIndex = -1;
let ghostElement = null;
let currentHighlightCells = [];
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Daftar warna background gelap
const BACKGROUND_COLORS = [
    '#1a1a1a', '#222222', '#2a2a2a', '#333333', '#3b3b3b'
];
let currentBgColorIndex = 0;

// --- Definisi Bentuk Blok --- (Tidak ada perubahan di sini, tetap sama)
const BLOCK_SHAPES = [
    { shape: [[1]], color: 'color-red', size: 1 },
    { shape: [[1, 1]], color: 'color-blue', size: 2 },
    { shape: [[1], [1]], color: 'color-yellow', size: 2 },
    { shape: [[1, 1, 1]], color: 'color-purple', size: 3 },
    { shape: [[1], [1], [1]], color: 'color-orange', size: 3 },
    { shape: [[1, 1], [0, 1]], color: 'color-green', size: 3 },
    { shape: [[1, 1], [1, 0]], color: 'color-cyan', size: 3 },
    { shape: [[0, 1], [1, 1]], color: 'color-pink', size: 3 },
    { shape: [[1, 0], [1, 1]], color: 'color-red', size: 3 },
    { shape: [[1, 1, 0], [0, 1, 0]], color: 'color-blue', size: 3 },
    { shape: [[0, 1, 0], [1, 1, 0]], color: 'color-yellow', size: 3 },
    { shape: [[1, 1, 1], [0, 1, 0]], color: 'color-purple', size: 4 },
    { shape: [[1, 1, 1, 1]], color: 'color-purple', size: 4 },
    { shape: [[1], [1], [1], [1]], color: 'color-orange', size: 4 },
    { shape: [[1, 1], [1, 1]], color: 'color-green', size: 4 },
    { shape: [[1, 0], [1, 0], [1, 1]], color: 'color-cyan', size: 4 },
    { shape: [[0, 1], [0, 1], [1, 1]], color: 'color-pink', size: 4 },
    { shape: [[0, 1, 0], [1, 1, 1]], color: 'color-red', size: 4 },
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'color-blue', size: 4 },
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'color-yellow', size: 4 },
    { shape: [[1, 1, 1, 1, 1]], color: 'color-purple', size: 5 },
    { shape: [[1], [1], [1], [1], [1]], color: 'color-orange', size: 5 }
];

// --- Inisialisasi & Responsifitas Game ---
function calculateCellSizes() {
    // Gunakan lebar viewport untuk perhitungan utama agar lebih responsif di mobile
    // Ambil lebar yang tersedia untuk konten utama, bukan hanya game-grid
    const availableWidth = window.innerWidth * 0.9; // 90% dari lebar viewport
    const availableHeight = window.innerHeight * 0.7; // 70% dari tinggi viewport (sisanya untuk skor & blok preview)

    // Hitung CELL_SIZE berdasarkan lebar dan tinggi yang tersedia untuk grid
    // Prioritaskan agar grid muat di layar
    CELL_SIZE = Math.floor(Math.min(availableWidth / GRID_COLS, availableHeight / GRID_ROWS));

    // Pastikan CELL_SIZE tidak terlalu besar atau terlalu kecil
    CELL_SIZE = Math.min(CELL_SIZE, 50); // Maksimal 50px
    CELL_SIZE = Math.max(CELL_SIZE, 25); // Minimal 25px (agar cukup besar untuk disentuh)

    // BLOCK_PREVIEW_PIECE_SIZE harus lebih kecil dari CELL_SIZE dan proporsional
    // Agar blok preview tidak terpotong, ukurannya harus relatif kecil
    BLOCK_PREVIEW_PIECE_SIZE = Math.floor(CELL_SIZE * 0.5); // 50% dari CELL_SIZE
    BLOCK_PREVIEW_PIECE_SIZE = Math.max(BLOCK_PREVIEW_PIECE_SIZE, 10); // Minimal 10px
    BLOCK_PREVIEW_PIECE_SIZE = Math.min(BLOCK_PREVIEW_PIECE_SIZE, 25); // Maksimal 25px

    // Set CSS variable untuk ukuran potongan blok
    document.documentElement.style.setProperty('--cell-size', `${CELL_SIZE}px`);
    document.documentElement.style.setProperty('--block-preview-piece-size', `${BLOCK_PREVIEW_PIECE_SIZE}px`);

    // Perbarui grid template columns untuk game board
    gameGridElement.style.gridTemplateColumns = `repeat(${GRID_COLS}, var(--cell-size))`;
    gameGridElement.style.gridTemplateRows = `repeat(${GRID_ROWS}, var(--cell-size))`;

    // Atur ukuran game-grid agar pas dengan sel
    gameGridElement.style.width = `${GRID_COLS * CELL_SIZE}px`;
    gameGridElement.style.height = `${GRID_ROWS * CELL_SIZE}px`;

    // Jika ghost element ada, recreate dengan ukuran baru
    if (ghostElement) {
        ghostElement.remove();
        ghostElement = createGhostElement(draggedBlock, CELL_SIZE);
        document.body.appendChild(ghostElement);
    }
    drawBlockPreview();
}

window.addEventListener('resize', calculateCellSizes);

function initializeGame() {
    score = 0;
    updateScoreDisplay();
    gameGrid = Array(GRID_ROWS).fill(0).map(() => Array(GRID_COLS).fill(0));
    blocksInCurrentSet = 0;

    gameGridElement.innerHTML = '';
    for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;
        gameGridElement.appendChild(cell);
    }
    calculateCellSizes();
    updateGridDisplay();
    generateNewBlocks(true);
    gameOverlay.classList.add('hidden');
    restartButton.removeEventListener('click', initializeGame);
    restartButton.addEventListener('click', initializeGame);
    changeBackgroundColor();
}

// --- Fungsi Rendering dan UI ---
function updateGridDisplay() {
    const cells = gameGridElement.children;
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const cellIndex = r * GRID_COLS + c;
            const cellElement = cells[cellIndex];
            cellElement.className = 'grid-cell';

            if (gameGrid[r][c] !== 0) {
                cellElement.classList.add('occupied');
                cellElement.classList.add(gameGrid[r][c]);
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
        // Pastikan event listener dihapus dan ditambahkan kembali setiap kali digambar
        // untuk mencegah multiple listeners pada elemen yang sama
        slot.removeEventListener('mousedown', startDrag);
        slot.removeEventListener('touchstart', startDrag);

        if (currentBlocks[index]) {
            const blockContainer = document.createElement('div');
            blockContainer.classList.add('draggable-block-container');
            const blockWidth = currentBlocks[index].shape[0].length;
            // Gunakan BLOCK_PREVIEW_PIECE_SIZE untuk display di slot
            blockContainer.style.gridTemplateColumns = `repeat(${blockWidth}, var(--block-preview-piece-size))`;
            
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
        }
    });
}

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
                // Hanya tambahkan sel yang valid untuk highlight
                cellsToHighlight.push({ r: targetRow, c: targetCol });
            }
        });
    });

    cellsToHighlight.forEach(pos => {
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
    if (isInitial || blocksInCurrentSet === 0) {
        currentBlocks = Array(3).fill(null);
        let blocksGenerated = 0;
        let attempts = 0;
        blocksInCurrentSet = 0;

        while (blocksGenerated < 3 && attempts < 200) {
            const randomIndex = Math.floor(Math.random() * BLOCK_SHAPES.length);
            const newBlock = JSON.parse(JSON.stringify(BLOCK_SHAPES[randomIndex]));

            const emptySlotIndex = currentBlocks.findIndex(b => b === null);
            if (emptySlotIndex !== -1) {
                currentBlocks[emptySlotIndex] = newBlock;
                blocksGenerated++;
                blocksInCurrentSet++;
            }
            attempts++;
        }

        for (let i = 0; i < 3; i++) {
            if (currentBlocks[i] === null) {
                const smallBlock = BLOCK_SHAPES.find(b => b.size === 1 || (b.shape.length <= 2 && b.shape[0].length <= 2));
                if (smallBlock) {
                    currentBlocks[i] = JSON.parse(JSON.stringify(smallBlock));
                } else {
                    currentBlocks[i] = JSON.parse(JSON.stringify(BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)]));
                }
                if (currentBlocks[i] !== null) {
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
                    targetRow < 0 || targetRow >= GRID_ROWS ||
                    targetCol < 0 || targetCol >= GRID_COLS ||
                    gameGrid[targetRow][targetCol] !== 0
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
                if (!cellsToClear.some(cell => cell.r === r && cell.c === c)) {
                    cellsToClear.push({ r: r, c: c });
                }
            }
        }
    }

    const uniqueCellsToClear = Array.from(new Set(cellsToClear.map(JSON.stringify))).map(JSON.parse);
    
    if (uniqueCellsToClear.length > 0) {
        uniqueCellsToClear.forEach(cell => {
            const cellElement = gameGridElement.children[cell.r * GRID_COLS + cell.c];
            const cellColorClass = gameGrid[cell.r][cell.c];
            
            cellElement.style.transition = 'background-color 0.2s ease-out';
            cellElement.style.backgroundColor = '#ecf0f1';
            
            createExplosionEffect(cellElement, cellColorClass);
        });

        setTimeout(() => {
            uniqueCellsToClear.forEach(cell => {
                gameGrid[cell.r][cell.c] = 0;
                const cellElement = gameGridElement.children[cell.r * GRID_COLS + cell.c];
                
                cellElement.style.transition = '';
                cellElement.style.backgroundColor = '';
                cellElement.classList.remove('occupied', 'color-red', 'color-blue', 'color-yellow', 'color-purple', 'color-orange', 'color-green', 'color-cyan', 'color-pink');
                cellElement.style.backgroundColor = '#3d3d3d';
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
    // Pastikan slot tidak kosong dan bukan overlay game over
    if (e.target.closest('.block-slot:empty') || gameOverlay.classList.contains('hidden') === false) {
        return;
    }
    e.preventDefault(); // Mencegah scrolling default browser dan interaksi lain

    isDragging = true;
    const slot = e.currentTarget;
    draggedBlockIndex = parseInt(slot.dataset.blockIndex);
    draggedBlock = currentBlocks[draggedBlockIndex];

    if (!draggedBlock) return;

    slot.classList.add('dragging'); // Sembunyikan blok asli di slot

    // Buat ghost element dengan ukuran CELL_SIZE dari grid
    ghostElement = createGhostElement(draggedBlock, CELL_SIZE);
    document.body.appendChild(ghostElement);

    const { x, y } = getEventCoordinates(e);
    // Mengambil posisi dari blok pratinjau yang sedang disentuh
    const slotRect = slot.getBoundingClientRect();
    const blockContainerRect = slot.querySelector('.draggable-block-container').getBoundingClientRect();


    // Hitung offset agar pusat blok yang di-drag berada di bawah kursor/jari
    // Offset ini adalah selisih antara kursor/jari dan sudut kiri atas ghost block
    // Kita ingin ghost block berada di bawah kursor/jari, jadi offsetnya adalah
    // dari kursor ke sudut kiri atas ghost (yang ukurannya CELL_SIZE per piece)
    dragOffsetX = x - blockContainerRect.left;
    dragOffsetY = y - blockContainerRect.top;


    // Posisikan ghost awal
    ghostElement.style.left = `${x - dragOffsetX}px`;
    ghostElement.style.top = `${y - dragOffsetY}px`;

    // Pastikan event listener dipasang di document untuk touch/mouse agar bisa drag keluar elemen
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false }); // passive: false penting untuk preventDefault
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
}

function drag(e) {
    if (!isDragging || !ghostElement || !draggedBlock) return;
    e.preventDefault(); // Mencegah scrolling saat drag di touch devices

    const { x, y } = getEventCoordinates(e);

    // Posisikan ghost berdasarkan kursor dikurangi offset
    ghostElement.style.left = `${x - dragOffsetX}px`;
    ghostElement.style.top = `${y - dragOffsetY}px`;

    const gridRect = gameGridElement.getBoundingClientRect();
    
    // hitung posisi di grid berdasarkan posisi ghost block (yang sudah di-offset)
    // yaitu posisi kiri atas ghost block relatif terhadap grid
    const ghostLeft = x - dragOffsetX;
    const ghostTop = y - dragOffsetY;

    let targetCol = Math.floor((ghostLeft - gridRect.left) / CELL_SIZE);
    let targetRow = Math.floor((ghostTop - gridRect.top) / CELL_SIZE);

    // Clamp targetRow dan targetCol agar tidak keluar dari batas grid
    targetCol = Math.max(0, Math.min(GRID_COLS - draggedBlock.shape[0].length, targetCol));
    targetRow = Math.max(0, Math.min(GRID_ROWS - draggedBlock.shape.length, targetRow));

    highlightCells(draggedBlock, targetRow, targetCol);
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

    // hitung posisi pelepasan blok di grid berdasarkan posisi ghost block (yang sudah di-offset)
    const ghostLeft = x - dragOffsetX;
    const ghostTop = y - dragOffsetY;

    // Periksa apakah blok dilepaskan di dalam area grid
    if (ghostLeft + (draggedBlock.shape[0].length * CELL_SIZE) > gridRect.left &&
        ghostLeft < gridRect.right &&
        ghostTop + (draggedBlock.shape.length * CELL_SIZE) > gridRect.top &&
        ghostTop < gridRect.bottom) {
        
        // hitung posisi di grid
        const targetCol = Math.floor((ghostLeft - gridRect.left) / CELL_SIZE);
        const targetRow = Math.floor((ghostTop - gridRect.top) / CELL_SIZE);

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
        drawBlockPreview(); // Gambar ulang untuk menampilkan blok yang tidak jadi diletakkan
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
