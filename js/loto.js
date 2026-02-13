// Lô Tô Digital - OCR Game Logic

// ===== STATE MANAGEMENT =====
let gameState = {
    currentStep: 'upload', // upload, verify, play
    uploadedImage: null,
    scannedNumbers: [],
    cardNumbers: [],
    markedIndices: [],
    calledNumbers: [],
    editingIndex: null,
    isScanning: false
};

// ===== WIN PATTERNS =====
const winPatterns = {
    'Row 1': [0, 1, 2, 3, 4],
    'Row 2': [5, 6, 7, 8, 9],
    'Row 3': [10, 11, 12, 13, 14],
    'Row 4': [15, 16, 17, 18, 19],
    'Row 5': [20, 21, 22, 23, 24],
    'Column 1': [0, 5, 10, 15, 20],
    'Column 2': [1, 6, 11, 16, 21],
    'Column 3': [2, 7, 12, 17, 22],
    'Column 4': [3, 8, 13, 18, 23],
    'Column 5': [4, 9, 14, 19, 24],
    'Diagonal ↘': [0, 6, 12, 18, 24],
    'Diagonal ↙': [4, 8, 12, 16, 20],
    'Four Corners': [0, 4, 20, 24],
    'Full Card': Array.from({ length: 25 }, (_, i) => i)
};

// ===== DOM ELEMENTS =====
const elements = {
    // Upload Section
    uploadSection: document.getElementById('upload-section'),
    uploadArea: document.getElementById('upload-area'),
    fileInput: document.getElementById('file-input'),
    imagePreview: document.getElementById('image-preview'),
    previewImg: document.getElementById('preview-img'),
    changeImageBtn: document.getElementById('change-image-btn'),
    scanBtn: document.getElementById('scan-btn'),
    scanProgress: document.getElementById('scan-progress'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),

    // Verify Section
    verifySection: document.getElementById('verify-section'),
    verifyGrid: document.getElementById('verify-grid'),
    rescanBtn: document.getElementById('rescan-btn'),
    confirmBtn: document.getElementById('confirm-btn'),

    // Game Section
    gameSection: document.getElementById('game-section'),
    numberInput: document.getElementById('number-input'),
    markBtn: document.getElementById('mark-btn'),
    quickNumbers: document.getElementById('quick-numbers'),
    calledCount: document.getElementById('called-count'),
    calledNumbers: document.getElementById('called-numbers'),
    gameGrid: document.getElementById('game-grid'),
    clearBtn: document.getElementById('clear-btn'),
    uploadNewBtn: document.getElementById('upload-new-btn'),

    // Win Modal
    winModal: document.getElementById('win-modal'),
    winPatternName: document.getElementById('win-pattern-name'),
    winGrid: document.getElementById('win-grid'),
    winNumbersList: document.getElementById('win-numbers-list'),
    playAgainBtn: document.getElementById('play-again-btn'),
    newCardBtn: document.getElementById('new-card-btn'),

    // Edit Modal
    editModal: document.getElementById('edit-modal'),
    editInput: document.getElementById('edit-input'),
    cancelEditBtn: document.getElementById('cancel-edit-btn'),
    saveEditBtn: document.getElementById('save-edit-btn'),

    // Navigation
    hamburgerMenu: document.getElementById('hamburger-menu'),
    navMenu: document.getElementById('nav-menu'),
    navOverlay: document.getElementById('nav-overlay')
};

// ===== INITIALIZATION =====
function init() {
    console.log('🎰 Lô Tô Digital initialized');
    setupEventListeners();
    initParticles();
    loadSavedGame();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Upload
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    elements.changeImageBtn.addEventListener('click', () => elements.fileInput.click());
    elements.scanBtn.addEventListener('click', scanImage);

    // Verify
    elements.rescanBtn.addEventListener('click', rescanImage);
    elements.confirmBtn.addEventListener('click', confirmNumbers);

    // Game
    elements.markBtn.addEventListener('click', markNumber);
    elements.numberInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') markNumber();
    });
    elements.clearBtn.addEventListener('click', clearMarks);
    elements.uploadNewBtn.addEventListener('click', uploadNewCard);

    // Win Modal
    elements.playAgainBtn.addEventListener('click', playAgain);
    elements.newCardBtn.addEventListener('click', uploadNewCard);

    // Edit Modal
    elements.cancelEditBtn.addEventListener('click', closeEditModal);
    elements.saveEditBtn.addEventListener('click', saveEdit);
    elements.editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEdit();
    });
    document.querySelector('.edit-overlay').addEventListener('click', closeEditModal);

    // Navigation
    elements.hamburgerMenu.addEventListener('click', toggleMenu);
    elements.navOverlay.addEventListener('click', closeMenu);
}

// ===== UPLOAD HANDLERS =====
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
}

function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);
    }
}

function processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        gameState.uploadedImage = e.target.result;
        elements.previewImg.src = e.target.result;
        elements.uploadArea.style.display = 'none';
        elements.imagePreview.style.display = 'block';
        elements.scanBtn.style.display = 'block';
        console.log('✅ Image uploaded successfully');
    };
    reader.readAsDataURL(file);
}

// ===== SMART LOTO CARD PRE-PROCESSING =====
// Strategy: Detect WHITE cells (with numbers) and isolate them
function preprocessImage(imageElement, debug = false) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match image
        const width = imageElement.naturalWidth || imageElement.width;
        const height = imageElement.naturalHeight || imageElement.height;
        canvas.width = width;
        canvas.height = height;
        
        // Draw original image
        ctx.drawImage(imageElement, 0, 0);
        
        // Get image data
        let imageData = ctx.getImageData(0, 0, width, height);
        let data = imageData.data;
        
        // Step 1: Detect WHITE cells (where numbers are)
        console.log('📸 Step 1: Detecting white cells with numbers...');
        
        // Create a mask: WHITE cells = keep, COLORED cells = remove
        const mask = new Uint8Array(width * height);
        let whitePixelCount = 0;
        let coloredPixelCount = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Check if pixel is "white-ish" (bright and not too colorful)
            const brightness = (r + g + b) / 3;
            const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
            
            // RELAXED threshold for white cells
            // White cells: brightness > 180 OR (brightness > 120 AND low color variance)
            const isWhiteCell = brightness > 180 || (brightness > 120 && colorVariance < 80);
            
            mask[i / 4] = isWhiteCell ? 1 : 0;
            
            if (isWhiteCell) whitePixelCount++;
            else coloredPixelCount++;
        }
        
        console.log(`✅ White pixels: ${whitePixelCount}, Colored pixels: ${coloredPixelCount}`);
        
        // Step 2: Create clean image - WHITE background, BLACK text
        console.log('🎨 Step 2: Creating clean image...');
        
        for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = i / 4;
            
            if (mask[pixelIndex] === 1) {
                // White cell - convert to grayscale and enhance
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Grayscale
                const gray = r * 0.299 + g * 0.587 + b * 0.114;
                
                // If pixel is VERY dark (number text), make it BLACK
                // If pixel is bright (background), make it WHITE
                const threshold = 80; // Lower threshold to catch darker numbers
                const value = gray < threshold ? 0 : 255;
                
                data[i] = data[i + 1] = data[i + 2] = value;
            } else {
                // Colored cell - make it LIGHT GRAY (for debugging)
                data[i] = data[i + 1] = data[i + 2] = 200;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Step 3: Light blur to smooth edges
        console.log('🔍 Step 3: Smoothing...');
        imageData = applyGaussianBlur(ctx, width, height, 1);
        ctx.putImageData(imageData, 0, 0);
        
        // Step 4: Final threshold to ensure pure black/white
        console.log('⚡ Step 4: Final threshold...');
        imageData = ctx.getImageData(0, 0, width, height);
        data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i];
            const value = gray > 128 ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = value;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        console.log('✅ Pre-processing complete!');
        
        // Debug: Show processed image
        if (debug) {
            const debugWindow = window.open('', 'Processed Image - Smart Detection');
            debugWindow.document.write(`
                <html>
                <head><title>Processed Image - Smart Loto Detection</title></head>
                <body style="margin:0; background:#ccc; padding:20px;">
                    <h2>Smart Loto Card Processing</h2>
                    <p>Strategy: Detect WHITE cells → Extract numbers → Remove colored cells</p>
                    <img src="${canvas.toDataURL('image/png')}" style="max-width:100%; height:auto; border:2px solid #333;">
                </body>
                </html>
            `);
        }
        
        // Return canvas as data URL
        resolve(canvas.toDataURL('image/png'));
    });
}

// Gaussian Blur for noise reduction
function applyGaussianBlur(ctx, width, height, radius) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1]; // 3x3 Gaussian kernel
    const kernelSum = 16;
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let r = 0, g = 0, b = 0;
            
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4;
                    const weight = kernel[(ky + 1) * 3 + (kx + 1)];
                    r += data[idx] * weight;
                    g += data[idx + 1] * weight;
                    b += data[idx + 2] * weight;
                }
            }
            
            const idx = (y * width + x) * 4;
            output[idx] = r / kernelSum;
            output[idx + 1] = g / kernelSum;
            output[idx + 2] = b / kernelSum;
        }
    }
    
    return new ImageData(output, width, height);
}

// Light Erosion (only remove isolated pixels, preserve text)
function applyLightErosion(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            // Only erode if pixel is white and has less than 3 white neighbors
            if (data[idx] === 255) {
                let whiteNeighbors = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        if (ky === 0 && kx === 0) continue;
                        const nIdx = ((y + ky) * width + (x + kx)) * 4;
                        if (data[nIdx] === 255) whiteNeighbors++;
                    }
                }
                
                // Keep white only if it has at least 3 white neighbors (connected)
                const value = whiteNeighbors >= 3 ? 255 : 0;
                output[idx] = output[idx + 1] = output[idx + 2] = value;
            } else {
                output[idx] = output[idx + 1] = output[idx + 2] = 0;
            }
        }
    }
    
    return new ImageData(output, width, height);
}

// Light Dilation (restore text slightly)
function applyLightDilation(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            // If pixel is black, check if any neighbor is white
            if (data[idx] === 0) {
                let hasWhiteNeighbor = false;
                
                // Check only direct neighbors (not diagonals)
                const neighbors = [
                    ((y - 1) * width + x) * 4,     // top
                    ((y + 1) * width + x) * 4,     // bottom
                    (y * width + (x - 1)) * 4,     // left
                    (y * width + (x + 1)) * 4      // right
                ];
                
                for (const nIdx of neighbors) {
                    if (data[nIdx] === 255) {
                        hasWhiteNeighbor = true;
                        break;
                    }
                }
                
                const value = hasWhiteNeighbor ? 255 : 0;
                output[idx] = output[idx + 1] = output[idx + 2] = value;
            } else {
                output[idx] = output[idx + 1] = output[idx + 2] = 255;
            }
        }
    }
    
    return new ImageData(output, width, height);
}

// ===== OCR SCANNING WITH OCR.SPACE API =====
async function scanImage() {
    if (gameState.isScanning) return;
    
    gameState.isScanning = true;
    elements.scanBtn.style.display = 'none';
    elements.scanProgress.style.display = 'block';
    
    try {
        console.log('🔍 Starting OCR scan with OCR.space API...');
        
        // Get original file from input (better than base64)
        elements.progressText.textContent = 'Preparing image...';
        elements.progressFill.style.width = '20%';
        
        const file = elements.fileInput.files[0];
        if (!file) {
            throw new Error('No file selected');
        }
        
        console.log('📁 File info:', {
            name: file.name,
            type: file.type,
            size: file.size
        });
        
        // Prepare form data for OCR.space API using file upload
        elements.progressText.textContent = 'Uploading to OCR.space...';
        elements.progressFill.style.width = '40%';
        
        const formData = new FormData();
        formData.append('file', file); // Upload original file
        formData.append('apikey', 'K86801680588957'); // Free API key
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('OCREngine', '3'); // Engine 3: Best for numbers and handwriting
        formData.append('scale', 'true'); // Auto-scale for better accuracy
        formData.append('detectOrientation', 'true'); // Auto-detect orientation
        
        console.log('📋 FormData prepared with file upload');
        
        console.log('📤 Sending to OCR.space API...');
        elements.progressText.textContent = 'Scanning with OCR.space...';
        elements.progressFill.style.width = '60%';
        
        // Call OCR.space API
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`OCR API error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📝 OCR.space Result:', result);
        
        elements.progressFill.style.width = '80%';
        
        // Check for errors
        if (result.IsErroredOnProcessing) {
            throw new Error(result.ErrorMessage || 'OCR processing failed');
        }
        
        // Extract text from result
        const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
        console.log('📄 Parsed Text:', parsedText);
        
        // Extract numbers (00-99)
        const numbers = extractNumbers(parsedText);
        console.log('🔢 Extracted numbers:', numbers);
        console.log('📊 Total numbers found:', numbers.length);
        
        elements.progressFill.style.width = '100%';

        if (numbers.length === 0) {
            alert('❌ No numbers detected. Please try a clearer image or enter numbers manually.');
            resetUpload();
            return;
        }

        console.log(`✅ Successfully extracted ${numbers.length} numbers`);

        // Don't auto-fill - let user see what was scanned
        // User can manually add missing numbers in verify step
        gameState.scannedNumbers = numbers;
        
        // Show verify section
        showVerifySection();
        
    } catch (error) {
        console.error('❌ OCR Error:', error);
        alert('Scan failed. Please try again or enter numbers manually.');
        resetUpload();
    } finally {
        gameState.isScanning = false;
    }
}

function extractNumbers(text) {
    // Extract all 1-4 digit numbers (some might be concatenated)
    const matches = text.match(/\d+/g) || [];
    
    const numbers = [];
    
    // Process each match
    matches.forEach(match => {
        if (match.length === 1 || match.length === 2) {
            // Single or double digit - add directly
            const num = parseInt(match);
            if (num >= 0 && num <= 99) {
                numbers.push(match.padStart(2, '0'));
            }
        } else if (match.length === 3) {
            // Three digits - try to split into 1+2 or 2+1
            const num1 = parseInt(match.substring(0, 1));
            const num2 = parseInt(match.substring(1, 3));
            if (num1 >= 0 && num1 <= 9) numbers.push(num1.toString().padStart(2, '0'));
            if (num2 >= 0 && num2 <= 99) numbers.push(num2.toString().padStart(2, '0'));
        } else if (match.length === 4) {
            // Four digits - split into two 2-digit numbers
            const num1 = parseInt(match.substring(0, 2));
            const num2 = parseInt(match.substring(2, 4));
            if (num1 >= 0 && num1 <= 99) numbers.push(num1.toString().padStart(2, '0'));
            if (num2 >= 0 && num2 <= 99) numbers.push(num2.toString().padStart(2, '0'));
        } else if (match.length > 4) {
            // Very long number - try to split into 2-digit chunks
            for (let i = 0; i < match.length - 1; i += 2) {
                const chunk = match.substring(i, i + 2);
                const num = parseInt(chunk);
                if (num >= 0 && num <= 99) {
                    numbers.push(chunk.padStart(2, '0'));
                }
            }
        }
    });
    
    // Remove duplicates and return
    return [...new Set(numbers)];
}

// Helper: Convert image element to Blob
function imageToBlob(imageElement) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = imageElement.naturalWidth || imageElement.width;
        canvas.height = imageElement.naturalHeight || imageElement.height;
        
        ctx.drawImage(imageElement, 0, 0);
        
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg', 0.95); // JPEG with 95% quality
    });
}

function rescanImage() {
    resetUpload();
    elements.verifySection.style.display = 'none';
    elements.uploadSection.style.display = 'block';
}

function resetUpload() {
    elements.scanProgress.style.display = 'none';
    elements.scanBtn.style.display = 'block';
    elements.progressFill.style.width = '0%';
    elements.progressText.textContent = 'Scanning...';
}

// ===== VERIFY SECTION =====
function showVerifySection() {
    elements.uploadSection.style.display = 'none';
    elements.verifySection.style.display = 'block';
    renderVerifyGrid();
}

function renderVerifyGrid() {
    elements.verifyGrid.innerHTML = '';
    gameState.scannedNumbers.forEach((number, index) => {
        const cell = document.createElement('div');
        cell.className = 'loto-cell';
        cell.textContent = number;
        cell.addEventListener('click', () => openEditModal(index));
        elements.verifyGrid.appendChild(cell);
    });
}

function openEditModal(index) {
    gameState.editingIndex = index;
    elements.editInput.value = gameState.scannedNumbers[index];
    elements.editModal.style.display = 'flex';
    elements.editInput.focus();
    elements.editInput.select();
}

function closeEditModal() {
    elements.editModal.style.display = 'none';
    gameState.editingIndex = null;
}

function saveEdit() {
    const value = elements.editInput.value.trim().padStart(2, '0');
    const num = parseInt(value);
    
    if (isNaN(num) || num < 0 || num > 99) {
        alert('Please enter a valid number (00-99)');
        return;
    }
    
    gameState.scannedNumbers[gameState.editingIndex] = value;
    renderVerifyGrid();
    closeEditModal();
}

function confirmNumbers() {
    gameState.cardNumbers = [...gameState.scannedNumbers];
    showGameSection();
}

// ===== GAME SECTION =====
function showGameSection() {
    elements.verifySection.style.display = 'none';
    elements.gameSection.style.display = 'block';
    gameState.currentStep = 'play';
    renderGameGrid();
    saveGameState();
}

function renderGameGrid() {
    elements.gameGrid.innerHTML = '';
    gameState.cardNumbers.forEach((number, index) => {
        const cell = document.createElement('div');
        cell.className = 'loto-cell';
        cell.textContent = number;
        
        if (gameState.markedIndices.includes(index)) {
            cell.classList.add('marked');
        }
        
        elements.gameGrid.appendChild(cell);
    });
}

function markNumber() {
    let value = elements.numberInput.value.trim();
    
    if (!value) return;
    
    // Pad to 2 digits
    value = value.padStart(2, '0');
    const num = parseInt(value);
    
    if (isNaN(num) || num < 0 || num > 99) {
        alert('Please enter a valid number (00-99)');
        return;
    }
    
    // Check if already called
    if (gameState.calledNumbers.includes(value)) {
        alert(`Number ${value} has already been called!`);
        return;
    }
    
    // Find in card
    const index = gameState.cardNumbers.indexOf(value);
    
    if (index === -1) {
        // Not in card - just add to history
        gameState.calledNumbers.push(value);
        updateCalledNumbers();
    } else {
        // In card - mark it
        if (!gameState.markedIndices.includes(index)) {
            gameState.markedIndices.push(index);
            gameState.calledNumbers.push(value);
            renderGameGrid();
            updateCalledNumbers();
            
            // Check for win
            const winResult = checkWin();
            if (winResult.win) {
                setTimeout(() => showWinModal(winResult), 500);
            }
        }
    }
    
    // Clear input
    elements.numberInput.value = '';
    elements.numberInput.focus();
    
    saveGameState();
}

function updateCalledNumbers() {
    elements.calledCount.textContent = gameState.calledNumbers.length;
    
    if (gameState.calledNumbers.length === 0) {
        elements.calledNumbers.innerHTML = '<p class="empty-state">No numbers called yet</p>';
    } else {
        elements.calledNumbers.innerHTML = '';
        gameState.calledNumbers.forEach(number => {
            const span = document.createElement('div');
            span.className = 'called-number';
            span.textContent = number;
            elements.calledNumbers.appendChild(span);
        });
    }
}

function clearMarks() {
    if (!confirm('Clear all marks and start over?')) return;
    
    gameState.markedIndices = [];
    gameState.calledNumbers = [];
    renderGameGrid();
    updateCalledNumbers();
    saveGameState();
}

// Removed newGame() - same as clearMarks()

function uploadNewCard() {
    if (gameState.currentStep === 'play' && gameState.calledNumbers.length > 0) {
        if (!confirm('Upload a new card? Current game will be lost.')) return;
    }
    
    // Reset everything
    gameState = {
        currentStep: 'upload',
        uploadedImage: null,
        scannedNumbers: [],
        cardNumbers: [],
        markedIndices: [],
        calledNumbers: [],
        editingIndex: null,
        isScanning: false
    };
    
    elements.uploadArea.style.display = 'block';
    elements.imagePreview.style.display = 'none';
    elements.scanBtn.style.display = 'none';
    elements.scanProgress.style.display = 'none';
    elements.verifySection.style.display = 'none';
    elements.gameSection.style.display = 'none';
    elements.uploadSection.style.display = 'block';
    elements.winModal.style.display = 'none';
    
    elements.fileInput.value = '';
    elements.numberInput.value = '';
    
    saveGameState();
}

// ===== WIN DETECTION =====
function checkWin() {
    for (const [name, pattern] of Object.entries(winPatterns)) {
        if (pattern.every(i => gameState.markedIndices.includes(i))) {
            return { 
                win: true, 
                pattern: name, 
                indices: pattern 
            };
        }
    }
    return { win: false };
}

function showWinModal(winResult) {
    console.log('🎉 WIN!', winResult);
    
    // Update pattern name
    elements.winPatternName.textContent = winResult.pattern;
    
    // Render win grid
    elements.winGrid.innerHTML = '';
    gameState.cardNumbers.forEach((number, index) => {
        const cell = document.createElement('div');
        cell.className = 'loto-cell';
        cell.textContent = number;
        
        if (gameState.markedIndices.includes(index)) {
            cell.classList.add('marked');
        }
        
        if (winResult.indices.includes(index)) {
            cell.classList.add('winning');
        }
        
        elements.winGrid.appendChild(cell);
    });
    
    // Show winning numbers
    elements.winNumbersList.innerHTML = '';
    winResult.indices.forEach(index => {
        const number = gameState.cardNumbers[index];
        const span = document.createElement('div');
        span.className = 'win-number';
        span.textContent = number;
        elements.winNumbersList.appendChild(span);
    });
    
    // Show modal
    elements.winModal.style.display = 'flex';
}

function playAgain() {
    elements.winModal.style.display = 'none';
    newGame();
}

// ===== SAVE/LOAD GAME STATE =====
function saveGameState() {
    try {
        localStorage.setItem('lotoGameState', JSON.stringify(gameState));
    } catch (error) {
        console.error('Failed to save game state:', error);
    }
}

function loadSavedGame() {
    try {
        const saved = localStorage.getItem('lotoGameState');
        if (saved) {
            const savedState = JSON.parse(saved);
            
            // Only restore if there's an active game
            if (savedState.currentStep === 'play' && savedState.cardNumbers.length === 25) {
                if (confirm('Continue previous game?')) {
                    gameState = savedState;
                    showGameSection();
                    updateCalledNumbers();
                }
            }
        }
    } catch (error) {
        console.error('Failed to load game state:', error);
    }
}

// ===== NAVIGATION =====
function toggleMenu() {
    const isOpen = elements.navMenu.classList.contains('active');
    if (isOpen) {
        closeMenu();
    } else {
        elements.navMenu.classList.add('active');
        elements.navOverlay.classList.add('active');
        elements.hamburgerMenu.classList.add('active');
    }
}

function closeMenu() {
    elements.navMenu.classList.remove('active');
    elements.navOverlay.classList.remove('active');
    elements.hamburgerMenu.classList.remove('active');
}

// ===== PARTICLES =====
function initParticles() {
    const container = document.querySelector('.particles-container');
    if (!container) return;

    const particleCount = 100;
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random size (3-10px)
        const size = Math.random() * 7 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.background = `radial-gradient(circle, ${color}, transparent)`;
        particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;

        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 20}s`;

        // Random animation duration
        particle.style.animationDuration = `${Math.random() * 15 + 10}s`;

        // Random movement direction
        const angle = Math.random() * 360;
        const distance = Math.random() * 80 + 40;
        const translateX = Math.cos(angle * Math.PI / 180) * distance;
        const translateY = Math.sin(angle * Math.PI / 180) * distance;
        
        particle.style.setProperty('--tx', `${translateX}vw`);
        particle.style.setProperty('--ty', `${translateY}vh`);

        container.appendChild(particle);
    }

    console.log('✨ Particles initialized');
}

// Add CSS animation for particles
const style = document.createElement('style');
style.textContent = `
    .particle {
        animation: moveParticles var(--duration, 15s) linear infinite;
        opacity: 0.7;
    }
    
    @keyframes moveParticles {
        0% {
            transform: translate(0, 0);
            opacity: 0;
        }
        10% {
            opacity: 0.7;
        }
        90% {
            opacity: 0.7;
        }
        100% {
            transform: translate(var(--tx, 50vw), var(--ty, 50vh));
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== START APP =====
document.addEventListener('DOMContentLoaded', init);

