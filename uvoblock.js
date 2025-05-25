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
const bodyElement = document.body; // Referensi ke body untuk ganti background

// Konstanta Game
const GRID_ROWS = 9;
const GRID_COLS = 9;
let CELL_SIZE = 0; // Akan dihitung ulang secara dinamis
let BLOCK_PIECE_SIZE = 0; // Akan dihitung ulang secara dinamis

// Variabel Game State
let gameGrid = []; // Representasi grid (0 untuk kosong, string warna untuk terisi)
let score = 0;
let currentBlocks = []; // Array untuk menyimpan 3 blok yang tersedia
let draggedBlock = null; // Blok yang sedang diseret
let draggedBlockIndex = -1; // Indeks blok di currentBlocks
let ghostElement = null; // Elemen DOM untuk ghost block
let currentHighlightCells = []; // Sel yang sedang di-highlight di grid
let isDragging = false; // Flag untuk status drag

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

function calculateCellSizes() {
    const gridRect = gameGridElement.getBoundingClientRect();
    const availableGridWidth = gridRect.width;
    const availableGridHeight = gridRect.height;

    CELL_SIZE = Math.min(
        availableGridWidth / GRID_COLS,
        availableGridHeight / GRID_ROWS
    );
    
    CELL_SIZE = Math.max(25, Math.min(CELL_SIZE, 55)); 

    BLOCK_PIECE_SIZE = CELL_SIZE / 2; 

    document.documentElement.style.setProperty('--block-piece-size', `${BLOCK_PIECE_SIZE}px`);

    gameGridElement.style.gridTemplateColumns = `repeat(${GRID_COLS}, ${CELL_SIZE}px)`;
    gameGridElement.style.gridTemplateRows = `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`;

    if (ghostElement && draggedBlock) {
        ghostElement.remove();
        ghostElement = createGhostElement(draggedBlock);
        document.body.appendChild(ghostElement);
    }
    drawBlockPreview();
    updateGridDisplay();
}

window.addEventListener('resize', calculateCellSizes);


function initializeGame() {
    score = 0;
    updateScoreDisplay();
    gameGrid = Array(GRID_ROWS).fill(0).map(() => Array(GRID_COLS).fill(0));

    gameGridElement.innerHTML = '';
    for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.dataset.index = i;
        gameGridElement.appendChild(cell);
    }
    calculateCellSizes();
    updateGridDisplay();
    
    // Inisialisasi 3 blok pertama
    currentBlocks = Array(3).fill(null);
    generateNewBlocks(true); // Panggil untuk mengisi slot awal
    
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
            if (!cellElement) continue;

            cellElement.className = 'grid-cell';
            if (gameGrid[r][c] !== 0) {
                cellElement.classList.add('occupied');
                cellElement.classList.add(gameGrid[r][c]);
            }
        }
    }
}

function drawBlockPreview() {
    // console.log("Drawing block preview. Current blocks:", currentBlocks); // Debug log
    blockPreviewSlots.forEach((slot, index) => {
        slot.innerHTML = '';
        slot.classList.remove('dragging');

        slot.removeEventListener('mousedown', startDrag);
        slot.removeEventListener('touchstart', startDrag);

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
            slot.addEventListener('mousedown', startDrag);
            slot.addEventListener('touchstart', startDrag, { passive: false });
            // console.log(`Block drawn in slot ${index}:`, currentBlocks[index]); // Debug log
        } else {
            // console.log(`Slot ${index} is empty.`); // Debug log
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

function fillBlockSlot(slotIndex) {
    if (slotIndex < 0 || slotIndex >= currentBlocks.length) return;

    let attempts = 0;
    let blockFound = false;
    while (!blockFound && attempts < 200) {
        const randomIndex = Math.floor(Math.random() * BLOCK_SHAPES.length);
        const newBlock = JSON.parse(JSON.stringify(BLOCK_SHAPES[randomIndex]));

        if (canBlockBePlacedAnywhere(newBlock)) {
            currentBlocks[slotIndex] = newBlock;
            blockFound = true;
            // console.log(`Block generated for slot ${slotIndex}:`, newBlock); // Debug log
        }
        attempts++;
    }

    if (!blockFound) {
        // Fallback to a 1x1 block if no suitable block found
        const smallBlock = BLOCK_SHAPES.find(b => b.size === 1); // Only 1x1 block as sure fallback
        if (smallBlock) {
            currentBlocks[slotIndex] = JSON.parse(JSON.stringify(smallBlock));
            // console.log(`Fallback block (1x1) generated for slot ${slotIndex}.`); // Debug log
        } else {
            // Should not happen if BLOCK_SHAPES is well-defined, but for safety
            currentBlocks[slotIndex] = JSON.parse(JSON.stringify(BLOCK_SHAPES[0]));
            // console.warn(`Critical: No fallback block (1x1) found. Using first block shape for slot ${slotIndex}.`);
        }
    }
}

function generateNewBlocks() {
    // console.log("Attempting to generate new blocks."); // Debug log
    for (let i = 0; i < currentBlocks.length; i++) {
        if (currentBlocks[i] === null) {
            fillBlockSlot(i);
        }
    }
    drawBlockPreview();
    checkGameOver();
}

function canBlockBePlacedAnywhere(block) {
    if (!block) return false; // Perbaikan: Pastikan blok bukan null
    // console.log("Checking if block can be placed anywhere:", block); // Debug log
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            // Coba tempatkan blok dengan sudut kiri atasnya di (r, c)
            // Ini mungkin lebih akurat untuk memeriksa penempatan dibandingkan dengan pusatnya.
            // Kita akan menyesuaikan logika highlight/placement untuk pusat di drag function.
            if (canPlaceBlock(block, r, c)) {
                // console.log(`Block can be placed at (${r}, ${c})`); // Debug log
                return true;
            }
        }
    }
    // console.log("Block cannot be placed anywhere."); // Debug log
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
    if (!block || !block.shape) return false; // Perbaikan: Pastikan blok dan shapenya valid

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

    const uniqueCellsToClear = cellsToClear; 
    
    if (uniqueCellsToClear.length > 0) {
        uniqueCellsToClear.forEach(cell => {
            const cellElement = gameGridElement.children[cell.r * GRID_COLS + cell.c];
            if (cellElement) {
                createExplosionEffect(cellElement);
                cellElement.style.transition = 'background-color 0.2s ease-out';
                cellElement.style.backgroundColor = '#ecf0f1';
            }
        });

        setTimeout(() => {
            uniqueCellsToClear.forEach(cell => {
                gameGrid[cell.r][cell.c] = 0;
                const cellElement = gameGridElement.children[cell.r * GRID_COLS + cell.c];
                if (cellElement) {
                    cellElement.style.transition = '';
                    cellElement.style.backgroundColor = '';
                }
            });
            updateGridDisplay();

            score += uniqueCellsToClear.length * 10;
            if (linesClearedCount > 1) {
                score += (linesClearedCount * 10) * linesClearedCount;
            }
            let allCellsEmpty = true;
            for(let r=0; r<GRID_ROWS; r++){
                for(let c=0; c<GRID_COLS; c++){
                    if(gameGrid[r][c] !== 0){
                        allCellsEmpty = false;
                        break;
                    }
                }
                if(!allCellsEmpty) break;
            }

            if (allCellsEmpty) { 
                score += 1000;
                const originalOverlayMessage = overlayMessage.textContent;
                overlayMessage.textContent = 'FULL CLEAR BONUS!'; 
                gameOverlay.classList.remove('hidden');
                setTimeout(() => {
                    gameOverlay.classList.add('hidden');
                    overlayMessage.textContent = originalOverlayMessage;
                }, 1500); 
            }

            updateScoreDisplay();
            changeBackgroundColor();
            generateNewBlocks(); // Selalu coba generate blok baru setelah clear
        }, 300);
    } else {
        generateNewBlocks(); // Selalu coba generate blok baru
    }
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Skor: ${score}`;
}

function createExplosionEffect(cellElement) {
    const rect = cellElement.getBoundingClientRect();
    const numParticles = 5 + Math.floor(Math.random() * 5);

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('explosion-particle');
        document.body.appendChild(particle);

        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        particle.style.width = particle.style.height = `${Math.random() * 8 + 4}px`;

        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 50 + 20;
        const endX = startX + distance * Math.cos(angle);
        const endY = startY + distance * Math.sin(angle);

        particle.style.setProperty('--x', `${endX - startX}px`);
        particle.style.setProperty('--y', `${endY - startY}px`);

        particle.addEventListener('animationend', () => particle.remove());
    }
}

function checkGameOver() {
    const allSlotsFilled = currentBlocks.every(block => block !== null);
    const hasPlayableBlocks = currentBlocks.some(block => block && canBlockBePlacedAnywhere(block));

    if (allSlotsFilled && !hasPlayableBlocks) {
        overlayMessage.textContent = 'GAME OVER!'; 
        showGameOver();
        return; 
    }

    if (hasPlayableBlocks || !allSlotsFilled) {
        gameOverlay.classList.add('hidden');
    }
}

function showGameOver() {
    score = 0;
    updateScoreDisplay();
    gameOverlay.classList.remove('hidden');
}

function changeBackgroundColor() {
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
    if (!gameOverlay.classList.contains('hidden')) { 
        return;
    }

    isDragging = true;
    const slot = event.currentTarget;
    draggedBlockIndex = parseInt(slot.dataset.blockIndex);
    draggedBlock = currentBlocks[draggedBlockIndex];

    if (!draggedBlock) {
        isDragging = false;
        return;
    }

    slot.classList.add('dragging');

    ghostElement = createGhostElement(draggedBlock);
    document.body.appendChild(ghostElement);

    const coords = getEventCoords(event);
    ghostElement.style.left = `${coords.x - ghostElement.offsetWidth / 2}px`;
    ghostElement.style.top = `${coords.y - ghostElement.offsetHeight / 2}px`;

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);
    document.addEventListener('touchcancel', dragEnd);
}

function drag(event) {
    if (!isDragging || !ghostElement || !draggedBlock) return;

    if (event.type === 'touchmove') {
        event.preventDefault(); 
    }

    const coords = getEventCoords(event);
    
    ghostElement.style.left = `${coords.x - ghostElement.offsetWidth / 2}px`;
    ghostElement.style.top = `${coords.y - ghostElement.offsetHeight / 2}px`;

    const targetCellInfo = getGridCellAtCoords(coords.x, coords.y);

    if (targetCellInfo) {
        const blockRows = draggedBlock.shape.length;
        const blockCols = draggedBlock.shape[0].length;
        
        // Menyesuaikan startRow dan startCol agar pusat blok berada di bawah jari
        // Offset tambahan untuk memusatkan secara visual jika blok tidak simetris
        let centerOffsetRow = Math.floor(blockRows / 2);
        let centerOffsetCol = Math.floor(blockCols / 2);

        const startRow = targetCellInfo.row - centerOffsetRow;
        const startCol = targetCellInfo.col - centerOffsetCol;
        
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
    
    if (blockPreviewSlots[draggedBlockIndex]) {
        blockPreviewSlots[draggedBlockIndex].classList.remove('dragging');
    }

    const coords = getEventCoords(event);
    const targetCellInfo = getGridCellAtCoords(coords.x, coords.y);

    if (targetCellInfo && draggedBlock) {
        const blockRows = draggedBlock.shape.length;
        const blockCols = draggedBlock.shape[0].length;
        
        // Menggunakan logika pemusatan yang sama seperti di drag()
        let centerOffsetRow = Math.floor(blockRows / 2);
        let centerOffsetCol = Math.floor(blockCols / 2);
        const startRow = targetCellInfo.row - centerOffsetRow;
        const startCol = targetCellInfo.col - centerOffsetCol;

        if (placeBlock(draggedBlock, startRow, startCol)) {
            currentBlocks[draggedBlockIndex] = null;
            updateGridDisplay();
            fillBlockSlot(draggedBlockIndex); // Langsung isi slot yang kosong
            drawBlockPreview();
            clearLines();
        } else {
            if (draggedBlockIndex !== -1) {
                currentBlocks[draggedBlockIndex] = draggedBlock;
                drawBlockPreview();
            }
            console.log("Penempatan blok gagal. Kembalikan blok.");
            checkGameOver();
        }
    } else {
        if (draggedBlockIndex !== -1) {
            currentBlocks[draggedBlockIndex] = draggedBlock;
            drawBlockPreview();
        }
        console.log("Blok dilepaskan di luar grid. Kembalikan blok.");
        checkGameOver();
    }

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
