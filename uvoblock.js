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

// --- Definisi Bentuk Blok ---
// Tidak ada perubahan di sini, tetap sama seperti sebelumnya
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
    console.log('Calculating cell sizes...');
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
    console.log('Calculated CELL_SIZE:', CELL_SIZE);

    // BLOCK_PREVIEW_PIECE_SIZE harus lebih kecil dari CELL_SIZE dan proporsional
    // Agar blok preview tidak terpotong, ukurannya harus relatif kecil
    BLOCK_PREVIEW_PIECE_SIZE = Math.floor(CELL_SIZE * 0.5); // 50% dari CELL_SIZE
    BLOCK_PREVIEW_PIECE_SIZE = Math.max(BLOCK_PREVIEW_PIECE_SIZE, 10); // Minimal 10px
    BLOCK_PREVIEW_PIECE_SIZE = Math.min(BLOCK_PREVIEW_PIECE_SIZE, 25); // Maksimal 25px
    console.log('Calculated BLOCK_PREVIEW_PIECE_SIZE:', BLOCK_PREVIEW_PIECE_SIZE);


    // Set CSS variable untuk ukuran potongan blok
    document.documentElement.style.setProperty('--cell-size', `${CELL_SIZE}px`);
    document.documentElement.style.setProperty('--block-preview-piece-size', `${BLOCK_PREVIEW_PIECE_SIZE}px`);
    console.log('CSS variables set: --cell-size=' + CELL_SIZE + 'px, --block-preview-piece-size=' + BLOCK_PREVIEW_PIECE_SIZE + 'px');


    // Perbarui grid template columns untuk game board
    gameGridElement.style.gridTemplateColumns = `repeat(${GRID_COLS}, var(--cell-size))`;
    gameGridElement.style.gridTemplateRows = `repeat(${GRID_ROWS}, var(--cell-size))`;

    // Atur ukuran game-grid agar pas dengan sel
    gameGridElement.style.width = `${GRID_COLS * CELL_SIZE}px`;
    gameGridElement.style.height = `${GRID_ROWS * CELL_SIZE}px`;
    console.log('Game grid styles updated.');

    // Jika ghost element ada, recreate dengan ukuran baru
    if (ghostElement) {
        ghostElement.remove();
        ghostElement = createGhostElement(draggedBlock, CELL_SIZE);
        document.body.appendChild(ghostElement);
    }
    drawBlockPreview(); // Pastikan ini dipanggil
    console.log('drawBlockPreview called from calculateCellSizes.');
}

window.addEventListener('resize', calculateCellSizes);

function initializeGame() {
    console.log('Initializing game...');
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
    calculateCellSizes(); // Pastikan ini dipanggil untuk mengatur ukuran awal
    updateGridDisplay();
    generateNewBlocks(true); // Ini yang mengisi currentBlocks
    gameOverlay.classList.add('hidden');
    // Pastikan event listener untuk restart button hanya ditambahkan sekali
    restartButton.removeEventListener('click', initializeGame);
    restartButton.addEventListener('click', initializeGame);
    changeBackgroundColor();
    console.log('Game initialized. Overlay hidden. Restart button listener set.');
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
    console.log('Drawing block preview. currentBlocks:', currentBlocks);
    blockPreviewSlots.forEach((slot, index) => {
        slot.innerHTML = ''; // Kosongkan slot sebelum menggambar ulang
        slot.classList.remove('dragging'); // Hapus kelas dragging jika ada
        
        // Hapus semua event listener terkait drag di slot ini
        slot.removeEventListener('mousedown', startDrag);
        slot.removeEventListener('touchstart', startDrag);

        if (currentBlocks[index]) {
            console.log('Attempting to draw block at slot index:', index, currentBlocks[index]);
            const blockContainer = document.createElement('div');
            blockContainer.classList.add('draggable-block-container');
            
            // Mengambil dimensi blok
            const blockRows = currentBlocks[index].shape.length;
            const blockCols = currentBlocks[index].shape[0].length; // Asumsi semua baris memiliki panjang yang sama

            // Mengatur grid template columns untuk kontainer blok pratinjau
            // Gunakan BLOCK_PREVIEW_PIECE_SIZE untuk display di slot
            blockContainer.style.gridTemplateColumns = `repeat(${blockCols}, var(--block-preview-piece-size))`;
            blockContainer.style.gridTemplateRows = `repeat(${blockRows}, var(--block-preview-piece-size))`; // Tambahkan ini juga

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
            slot.dataset.blockIndex = index; // Simpan index blok di dataset slot

            // Tambahkan event listener untuk setiap slot yang memiliki blok
            slot.addEventListener('mousedown', startDrag);
            slot.addEventListener('touchstart', startDrag, { passive: false }); // passive: false penting
            console.log('Block drawn and listeners added for slot:', index);
        } else {
            console.log('Slot', index, 'is empty (currentBlocks[index] is null).');
        }
    });
    console.log('Finished drawing block preview.');
}


function createGhostElement(block, cellSizeForGhost) {
    if (!block) {
        console.warn('createGhostElement received a null block.');
        return null;
    }
    const ghost = document.createElement('div');
    ghost.classList.add('draggable-block-container', 'ghost');
    // Gunakan cellSizeForGhost (CELL_SIZE dari game grid) untuk ukuran potongan ghost
    ghost.style.gridTemplateColumns = `repeat(${block.shape[0].length}, ${cellSizeForGhost}px)`;
    ghost.style.gridTemplateRows = `repeat(${block.shape.length}, ${cellSizeForGhost}px)`; // Tambahkan ini juga

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
    console.log('Generating new blocks. isInitial:', isInitial);
    if (isInitial || blocksInCurrentSet === 0) {
        currentBlocks = Array(3).fill(null); // Reset array blok
        let blocksGenerated = 0;
        let attempts = 0;
        blocksInCurrentSet = 0;

        // Coba isi 3 blok acak
        while (blocksGenerated < 3 && attempts < 200) { // Batasi percobaan
            const randomIndex = Math.floor(Math.random() * BLOCK_SHAPES.length);
            const newBlock = JSON.parse(JSON.stringify(BLOCK_SHAPES[randomIndex])); // Deep copy

            const emptySlotIndex = currentBlocks.findIndex(b => b === null);
            if (emptySlotIndex !== -1) {
                currentBlocks[emptySlotIndex] = newBlock;
                blocksGenerated++;
                blocksInCurrentSet++;
            }
            attempts++;
        }
        console.log('Generated blocks in first pass:', currentBlocks);

        // Jika masih ada slot kosong (misal karena random tidak mengisi penuh), isi dengan blok kecil
        for (let i = 0; i < 3; i++) {
            if (currentBlocks[i] === null) {
                console.log('Filling empty slot', i, 'with a small block.');
                const smallBlock = BLOCK_SHAPES.find(b => b.size === 1 || (b.shape.length <= 2 && b.shape[0].length <= 2));
                if (smallBlock) {
                    currentBlocks[i] = JSON.parse(JSON.stringify(smallBlock));
                } else {
                    // Fallback jika tidak ada blok kecil, pilih acak saja
                    currentBlocks[i] = JSON.parse(JSON.stringify(BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)]));
                }
                if (currentBlocks[i] !== null) {
                    blocksInCurrentSet++;
                }
            }
        }
        console.log('Final blocks after fallback:', currentBlocks);
    }
    drawBlockPreview();
    console.log('drawBlockPreview called from generateNewBlocks.');
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
                if (!cellsToClear.some(cell => cell.r === r && cell.c === c)) { // Hindari duplikasi
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
            cellElement.style.backgroundColor = '#ecf0f1'; // Warna putih sebentar
            
            createExplosionEffect(cellElement, cellColorClass);
        });

        setTimeout(() => {
            uniqueCellsToClear.forEach(cell => {
                gameGrid[cell.r][cell.c] = 0; // Hapus dari data grid
                const cellElement = gameGridElement.children[cell.r * GRID_COLS + cell.c];
                
                // Reset style dan class
                cellElement.style.transition = '';
                cellElement.style.backgroundColor = ''; // Hapus inline style background
                cellElement.classList.remove('occupied', 'color-red', 'color-blue', 'color-yellow', 'color-purple', 'color-orange', 'color-green', 'color-cyan', 'color-pink');
                cellElement.style.backgroundColor = '#3d3d3d'; // Kembali ke warna background grid default
            });

            updateGridDisplay();
            addScore(uniqueCellsToClear.length * 10 + (linesClearedCount > 1 ? linesClearedCount * 50 : 0));
            changeBackgroundColor();
            checkGameOver();
        }, 500); // Durasi animasi clear
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
        particle.style.backgroundColor = baseColor; // Menggunakan warna cell yang meledak

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
    console.log('startDrag initiated.');
    // Pastikan slot tidak kosong dan bukan overlay game over
    if (e.target.closest('.block-slot:empty') || (gameOverlay && !gameOverlay.classList.contains('hidden'))) {
        console.log('Drag start prevented: slot empty or overlay active.');
        return;
    }
    e.preventDefault(); // Mencegah scrolling default browser dan interaksi lain

    isDragging = true;
    const slot = e.currentTarget; // elemen .block-slot
    draggedBlockIndex = parseInt(slot.dataset.blockIndex);
    draggedBlock = currentBlocks[draggedBlockIndex];

    if (!draggedBlock) {
        console.warn('No block found to drag at index:', draggedBlockIndex);
        return;
    }
    console.log('Starting drag for block:', draggedBlock);

    slot.classList.add('dragging'); // Sembunyikan blok asli di slot

    // Buat ghost element dengan ukuran CELL_SIZE dari grid
    ghostElement = createGhostElement(draggedBlock, CELL_SIZE);
    if (!ghostElement) {
        console.error('Failed to create ghost element.');
        isDragging = false;
        slot.classList.remove('dragging');
        return;
    }
    document.body.appendChild(ghostElement);

    const { x, y } = getEventCoordinates(e);
    
    // Mengambil posisi dari blok pratinjau yang sedang disentuh
    const blockContainerInSlot = slot.querySelector('.draggable-block-container');
    const blockContainerRect = blockContainerInSlot ? blockContainerInSlot.getBoundingClientRect() : slot.getBoundingClientRect(); // Fallback ke slot jika kontainer belum dirender

    // Hitung offset agar pusat blok yang di-drag berada di bawah kursor/jari
    // Offset ini adalah selisih antara kursor/jari dan sudut kiri atas ghost block
    // Kita ingin ghost block berada di bawah kursor/jari, jadi offsetnya adalah
    // dari kursor ke sudut kiri atas ghost (yang ukurannya CELL_SIZE per piece)
    dragOffsetX = x - blockContainerRect.left;
    dragOffsetY = y - blockContainerRect.top;

    // Posisikan ghost awal
    ghostElement.style.left = `${x - dragOffsetX}px`;
    ghostElement.style.top = `${y - dragOffsetY}px`;
    console.log(`Ghost initial position: left=${ghostElement.style.left}, top=${ghostElement.style.top}`);

    // Pastikan event listener dipasang di document untuk touch/mouse agar bisa drag keluar elemen
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false }); // passive: false penting untuk preventDefault
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
    console.log('Drag listeners added to document.');
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

    // hitung koordinat sel di grid
    let targetCol = Math.floor((ghostLeft - gridRect.left) / CELL_SIZE);
    let targetRow = Math.floor((ghostTop - gridRect.top) / CELL_SIZE);

    // Clamp targetRow dan targetCol agar tidak keluar dari batas grid
    // Dengan mempertimbangkan dimensi blok
    targetCol = Math.max(0, Math.min(GRID_COLS - draggedBlock.shape[0].length, targetCol));
    targetRow = Math.max(0, Math.min(GRID_ROWS - draggedBlock.shape.length, targetRow));

    highlightCells(draggedBlock, targetRow, targetCol);
}

function endDrag(e) {
    console.log('endDrag initiated.');
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

    // Periksa apakah blok dilepaskan di dalam area grid yang valid
    if (ghostLeft >= gridRect.left &&
        ghostLeft + (draggedBlock.shape[0].length * CELL_SIZE) <= gridRect.right &&
        ghostTop >= gridRect.top &&
        ghostTop + (draggedBlock.shape.length * CELL_SIZE) <= gridRect.bottom) {
        
        // hitung posisi di grid
        const targetCol = Math.floor((ghostLeft - gridRect.left) / CELL_SIZE);
        const targetRow = Math.floor((ghostTop - gridRect.top) / CELL_SIZE);

        // Clamped targetRow dan targetCol untuk memastikan blok tidak keluar grid
        const clampedTargetRow = Math.max(0, Math.min(GRID_ROWS - draggedBlock.shape.length, targetRow));
        const clampedTargetCol = Math.max(0, Math.min(GRID_COLS - draggedBlock.shape[0].length, targetCol));

        console.log('Attempting to place block at:', clampedTargetRow, clampedTargetCol);
        if (placeBlock(draggedBlock, clampedTargetRow, clampedTargetCol)) {
            console.log('Block placed successfully!');
            updateGridDisplay();
            addScore(draggedBlock.size);
            
            currentBlocks[draggedBlockIndex] = null; // Hapus blok dari preview
            blocksInCurrentSet--;
            placedSuccessfully = true;

            if (blocksInCurrentSet === 0) {
                console.log('All blocks placed, generating new set.');
                generateNewBlocks();
            } else {
                drawBlockPreview(); // Gambar ulang preview tanpa blok yang sudah dipakai
            }

            clearLines(); // Periksa dan bersihkan baris/kolom
        } else {
            console.log('Block could not be placed (invalid position or occupied cells).');
        }
    } else {
        console.log('Block dropped outside valid grid area.');
    }
    
    if (!placedSuccessfully) {
        console.log('Block not placed, redrawing preview and checking game over.');
        drawBlockPreview(); // Gambar ulang untuk menampilkan blok yang tidak jadi diletakkan
        checkGameOver();
    }

    // Hapus event listener setelah drag selesai
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
    document.removeEventListener('touchcancel', endDrag);
    console.log('Drag listeners removed from document.');

    draggedBlock = null;
    draggedBlockIndex = -1;
}

// Inisialisasi game saat DOM siap
document.addEventListener('DOMContentLoaded', initializeGame);
console.log('DOMContentLoaded event listener added. Waiting for game initialization.');
