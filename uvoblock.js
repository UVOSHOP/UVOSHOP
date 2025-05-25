// uvoblock.js

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20; // Increased height for more gameplay
const CELL_SIZE_PX = 30; // Base cell size, will be adjusted for mobile

const gameBoard = document.getElementById('game-board');
const blockSelection = document.getElementById('block-selection');
const scoreDisplay = document.getElementById('score-display');

let board = [];
let currentBlock = null;
let currentBlockShape = [];
let currentBlockColor = '';
let selectedBlockPreviewElement = null; // Stores the currently selected block's preview div

let score = 0;

// Define block shapes and their colors
const BLOCKS = [
    { shape: [[1,1],[1,1]], color: '#FFD700' }, // O block (Yellow)
    { shape: [[1,1,1,1]], color: '#00FFFF' },   // I block (Cyan)
    { shape: [[0,1,1],[1,1,0]], color: '#32CD32' }, // S block (Lime Green)
    { shape: [[1,1,0],[0,1,1]], color: '#FF0000' }, // Z block (Red)
    { shape: [[1,1,1],[0,1,0]], color: '#8A2BE2' }, // T block (Blue Violet)
    { shape: [[1,0,0],[1,1,1]], color: '#FF7F50' }, // L block (Coral)
    { shape: [[0,0,1],[1,1,1]], color: '#1E90FF' }  // J block (Dodger Blue)
];

// --- Game Initialization ---

function initializeGame() {
    // Set up the game board CSS grid
    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_WIDTH}, ${CELL_SIZE_PX}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${BOARD_HEIGHT}, ${CELL_SIZE_PX}px)`;

    // Create board cells
    for (let r = 0; r < BOARD_HEIGHT; r++) {
        board[r] = [];
        for (let c = 0; c < BOARD_WIDTH; c++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', handleCellClick); // For desktop/debug
            gameBoard.appendChild(cell);
            board[r][c] = { element: cell, filled: false, color: '' };
        }
    }

    generateNewBlockOptions();
    updateScoreDisplay();
    addTouchListenersToBoard(); // Add touch listeners
    adjustBoardAndCellsSize(); // Initial adjustment
    window.addEventListener('resize', adjustBoardAndCellsSize); // Adjust on resize
}

// --- Responsiveness and Mobile Adjustments ---

function adjustBoardAndCellsSize() {
    const gameContainerWidth = gameBoard.parentElement.clientWidth - 40; // Subtract padding
    const maxCellSize = Math.floor(gameContainerWidth / BOARD_WIDTH);
    const newCellSize = Math.min(CELL_SIZE_PX, maxCellSize); // Don't make cells larger than base size

    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_WIDTH}, ${newCellSize}px)`;
    gameBoard.style.gridTemplateRows = `repeat(${BOARD_HEIGHT}, ${newCellSize}px)`;

    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.style.width = `${newCellSize}px`;
        cell.style.height = `${newCellSize}px`;
    });

    // Adjust preview cell size relative to game cells
    document.querySelectorAll('.block-cell').forEach(cell => {
        const previewCellSize = Math.max(8, newCellSize / 2); // Minimum 8px, half of game cell size
        cell.style.width = `${previewCellSize}px`;
        cell.style.height = `${previewCellSize}px`;
    });
}

// --- Block Management ---

function generateNewBlockOptions() {
    blockSelection.innerHTML = ''; // Clear previous options
    currentBlock = null; // Clear selected block
    if (selectedBlockPreviewElement) {
        selectedBlockPreviewElement.classList.remove('selected');
        selectedBlockPreviewElement = null;
    }

    const shuffledBlocks = shuffleArray([...BLOCKS]); // Get 3 random unique blocks
    for (let i = 0; i < 3; i++) {
        const blockDef = shuffledBlocks[i];
        createBlockPreview(blockDef);
    }
}

function createBlockPreview(blockDef) {
    const container = document.createElement('div');
    container.classList.add('block-preview-container');
    container.dataset.blockColor = blockDef.color;
    container.dataset.blockShape = JSON.stringify(blockDef.shape);

    const previewGrid = document.createElement('div');
    previewGrid.classList.add('block-preview');
    // Determine grid dimensions for preview
    const rows = blockDef.shape.length;
    const cols = blockDef.shape[0].length;
    previewGrid.style.gridTemplateColumns = `repeat(${cols}, auto)`;
    previewGrid.style.gridTemplateRows = `repeat(${rows}, auto)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            // Dynamically adjust cell size based on current game cell size
            const previewCellSize = Math.max(8, board[0][0].element.offsetWidth / 2);
            cell.style.width = `${previewCellSize}px`;
            cell.style.height = `${previewCellSize}px`;

            if (blockDef.shape[r][c] === 1) {
                cell.classList.add('block-cell');
                cell.style.backgroundColor = blockDef.color;
            }
            previewGrid.appendChild(cell);
        }
    }

    container.appendChild(previewGrid);
    blockSelection.appendChild(container);

    container.addEventListener('click', () => selectBlock(container, blockDef));
}

function selectBlock(previewElement, blockDef) {
    if (selectedBlockPreviewElement) {
        selectedBlockPreviewElement.classList.remove('selected');
    }
    selectedBlockPreviewElement = previewElement;
    selectedBlockPreviewElement.classList.add('selected');

    currentBlockShape = blockDef.shape;
    currentBlockColor = blockDef.color;
    currentBlock = { x: 0, y: 0, shape: currentBlockShape, color: currentBlockColor };

    // Clear any previous previews on the board
    clearPreview();
}

function canPlaceBlock(boardX, boardY, shape) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
            if (shape[r][c] === 1) {
                const targetRow = boardY + r;
                const targetCol = boardX + c;

                // Check boundaries
                if (targetRow < 0 || targetRow >= BOARD_HEIGHT ||
                    targetCol < 0 || targetCol >= BOARD_WIDTH) {
                    return false; // Out of bounds
                }
                // Check if cell is already filled
                if (board[targetRow][targetCol].filled) {
                    return false; // Cell occupied
                }
            }
        }
    }
    return true;
}

function placeBlock(boardX, boardY, shape, color) {
    if (!canPlaceBlock(boardX, boardY, shape)) {
        console.warn("Attempted to place block at invalid position or overlapping.");
        return false;
    }

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
            if (shape[r][c] === 1) {
                const targetRow = boardY + r;
                const targetCol = boardX + c;
                const cell = board[targetRow][targetCol].element;
                cell.classList.add('filled');
                cell.style.backgroundColor = color;
                board[targetRow][targetCol].filled = true;
                board[targetRow][targetCol].color = color;
            }
        }
    }
    return true;
}

function removeSelectedBlockPreview() {
    if (selectedBlockPreviewElement) {
        selectedBlockPreviewElement.remove();
        selectedBlockPreviewElement = null;
        currentBlock = null;
        currentBlockShape = [];
        currentBlockColor = '';
    }
}

// --- Game Logic ---

function checkRowsForCompletion() {
    let linesCleared = 0;
    for (let r = BOARD_HEIGHT - 1; r >= 0; r--) {
        const rowFilled = board[r].every(cell => cell.filled);
        if (rowFilled) {
            linesCleared++;
            // Remove the row
            for (let c = 0; c < BOARD_WIDTH; c++) {
                board[r][c].element.classList.remove('filled');
                board[r][c].element.style.backgroundColor = '#555'; // Reset to default background
                board[r][c].filled = false;
                board[r][c].color = '';
            }

            // Shift rows above down
            for (let i = r; i > 0; i--) {
                for (let c = 0; c < BOARD_WIDTH; c++) {
                    const sourceCell = board[i - 1][c];
                    const targetCell = board[i][c];

                    targetCell.element.classList.toggle('filled', sourceCell.filled);
                    targetCell.element.style.backgroundColor = sourceCell.filled ? sourceCell.color : '#555';
                    targetCell.filled = sourceCell.filled;
                    targetCell.color = sourceCell.color;
                }
            }
            // Clear the top row after shifting
            for (let c = 0; c < BOARD_WIDTH; c++) {
                board[0][c].element.classList.remove('filled');
                board[0][c].element.style.backgroundColor = '#555';
                board[0][c].filled = false;
                board[0][c].color = '';
            }
            r++; // Recheck the current row as it's now filled with content from above
        }
    }
    if (linesCleared > 0) {
        updateScore(linesCleared);
        // If all blocks are used up, generate new ones
        if (blockSelection.children.length === 0) {
             generateNewBlockOptions();
        }
    } else {
        // Only generate new blocks if no lines were cleared and all blocks are used
        if (blockSelection.children.length === 0) {
            generateNewBlockOptions();
        }
    }
}


function updateScore(lines) {
    // Example scoring: 100 points per line, bonus for multiple lines
    score += lines * 100 * lines;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

// --- Visual Feedback (Hover/Preview) ---

let currentHoveredCells = [];

function clearPreview() {
    currentHoveredCells.forEach(cell => {
        if (!cell.classList.contains('filled')) { // Only clear if not permanently filled
            cell.style.backgroundColor = ''; // Reset to CSS default
            cell.classList.remove('preview');
        }
    });
    currentHoveredCells = [];
}

function showPreview(targetRow, targetCol) {
    if (!currentBlock) return;

    clearPreview(); // Clear previous preview

    const blockShape = currentBlock.shape;
    const blockColor = currentBlock.color;
    const previewCells = [];

    let canPlace = true;
    for (let r = 0; r < blockShape.length; r++) {
        for (let c = 0; c < blockShape[0].length; c++) {
            if (blockShape[r][c] === 1) {
                const cellRow = targetRow + r;
                const cellCol = targetCol + c;

                if (cellRow >= 0 && cellRow < BOARD_HEIGHT &&
                    cellCol >= 0 && cellCol < BOARD_WIDTH &&
                    !board[cellRow][cellCol].filled) {
                    previewCells.push(board[cellRow][cellCol].element);
                } else {
                    canPlace = false; // Out of bounds or occupied
                    break;
                }
            }
        }
        if (!canPlace) break;
    }

    if (canPlace) {
        previewCells.forEach(cell => {
            if (!cell.classList.contains('filled')) {
                cell.style.backgroundColor = blockColor;
                cell.classList.add('preview');
            }
        });
        currentHoveredCells = previewCells;
    } else {
        // If not placeable, clear any lingering preview and indicate no valid spot
        clearPreview();
    }
}

// --- Event Handlers ---

function handleCellClick(event) {
    if (!currentBlock) {
        console.log("No block selected.");
        return; // No block is selected
    }

    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    // Calculate the top-left corner for placing the block
    // We assume the block is centered on the clicked cell
    const blockRows = currentBlockShape.length;
    const blockCols = currentBlockShape[0].length;
    const startRow = row - Math.floor(blockRows / 2);
    const startCol = col - Math.floor(blockCols / 2);

    if (placeBlock(startCol, startRow, currentBlockShape, currentBlockColor)) {
        removeSelectedBlockPreview();
        checkRowsForCompletion();
        clearPreview(); // Clear any remaining preview after placement
    } else {
        console.warn("Cannot place block here due to overlap or boundary issues.");
        // Maybe add some visual feedback that placement failed
    }
}


// --- Mobile Touch Handlers ---

let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;
let currentTargetCell = null; // To keep track of the cell currently being hovered

function addTouchListenersToBoard() {
    gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameBoard.addEventListener('touchend', handleTouchEnd);
}

function getCellFromTouch(touch) {
    const boardRect = gameBoard.getBoundingClientRect();
    const x = touch.clientX - boardRect.left;
    const y = touch.clientY - boardRect.top;

    const cellWidth = board[0][0].element.offsetWidth;
    const cellHeight = board[0][0].element.offsetHeight;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (row >= 0 && row < BOARD_HEIGHT && col >= 0 && col < BOARD_WIDTH) {
        return board[row][col].element;
    }
    return null;
}

function handleTouchStart(event) {
    if (!currentBlock) return;
    if (event.touches.length > 1) return; // Ignore multi-touch

    event.preventDefault(); // Prevent scrolling
    isDragging = true;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;

    const cell = getCellFromTouch(event.touches[0]);
    if (cell) {
        currentTargetCell = cell;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        // Calculate the top-left corner for previewing based on the touch position
        const blockRows = currentBlockShape.length;
        const blockCols = currentBlockShape[0].length;
        const startRow = row - Math.floor(blockRows / 2);
        const startCol = col - Math.floor(blockCols / 2);
        showPreview(startRow, startCol);
    }
}

function handleTouchMove(event) {
    if (!isDragging || !currentBlock) return;
    event.preventDefault(); // Prevent scrolling

    const cell = getCellFromTouch(event.touches[0]);
    if (cell && cell !== currentTargetCell) {
        currentTargetCell = cell;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const blockRows = currentBlockShape.length;
        const blockCols = currentBlockShape[0].length;
        const startRow = row - Math.floor(blockRows / 2);
        const startCol = col - Math.floor(blockCols / 2);
        showPreview(startRow, startCol);
    }
}

function handleTouchEnd(event) {
    if (!isDragging || !currentBlock || !currentTargetCell) {
        isDragging = false;
        clearPreview();
        return;
    }

    isDragging = false;
    const row = parseInt(currentTargetCell.dataset.row);
    const col = parseInt(currentTargetCell.dataset.col);

    // Calculate the top-left corner for placing the block
    const blockRows = currentBlockShape.length;
    const blockCols = currentBlockShape[0].length;
    const startRow = row - Math.floor(blockRows / 2);
    const startCol = col - Math.floor(blockCols / 2);

    if (placeBlock(startCol, startRow, currentBlockShape, currentBlockColor)) {
        removeSelectedBlockPreview();
        checkRowsForCompletion();
    } else {
        console.warn("Mobile: Cannot place block here.");
        // Visual feedback for failed placement (e.g., shake the board, momentary red flash)
    }
    clearPreview(); // Always clear preview after touch ends
    currentTargetCell = null;
}


// --- Utility Functions ---

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Start the game!
initializeGame();
