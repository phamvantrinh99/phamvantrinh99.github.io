// Lô Tô Digital - OCR Game Logic

// ===== STATE MANAGEMENT =====
let gameState = {
    currentStep: 'upload',
    uploadedImages: [],
    cards: [], // Array of { id, name, numbers: [], markedIndices: [] }
    currentCardIndex: 0,
    scannedNumbers: [],
    calledNumbers: [],
    editingIndex: null,
    editingCardId: null,
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
    const files = Array.from(e.target.files);
    if (files.length > 0) processFiles(files);
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
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
        processFiles(files);
    }
}

function processFiles(files) {
    gameState.uploadedImages = files;
    
    elements.uploadArea.style.display = 'none';
    elements.imagePreview.style.display = 'block';
    
    // Clear previous preview
    elements.imagePreview.innerHTML = '';
    
    // Create container for multiple images
    const previewContainer = document.createElement('div');
    previewContainer.style.display = 'grid';
    previewContainer.style.gridTemplateColumns = files.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))';
    previewContainer.style.gap = '15px';
    previewContainer.style.marginBottom = '20px';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgWrapper = document.createElement('div');
            imgWrapper.style.position = 'relative';
            imgWrapper.style.borderRadius = '12px';
            imgWrapper.style.overflow = 'hidden';
            imgWrapper.style.border = '2px solid rgba(102, 126, 234, 0.3)';
            imgWrapper.style.cursor = 'pointer';
            imgWrapper.style.transition = 'transform 0.2s, box-shadow 0.2s';
            imgWrapper.style.background = '#1a1a2e';
            
            imgWrapper.addEventListener('mouseenter', () => {
                imgWrapper.style.transform = 'scale(1.02)';
                imgWrapper.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
            });
            imgWrapper.addEventListener('mouseleave', () => {
                imgWrapper.style.transform = 'scale(1)';
                imgWrapper.style.boxShadow = 'none';
            });
            imgWrapper.addEventListener('click', () => openImageModal(e.target.result, index + 1));
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '100%';
            img.style.height = '250px';
            img.style.objectFit = 'contain';
            img.style.display = 'block';
            
            const label = document.createElement('div');
            label.textContent = `Card ${index + 1}`;
            label.style.position = 'absolute';
            label.style.top = '10px';
            label.style.left = '10px';
            label.style.background = 'rgba(102, 126, 234, 0.9)';
            label.style.color = 'white';
            label.style.padding = '5px 10px';
            label.style.borderRadius = '6px';
            label.style.fontSize = '14px';
            label.style.fontWeight = 'bold';
            
            const clickHint = document.createElement('div');
            clickHint.textContent = '🔍 Click to view';
            clickHint.style.position = 'absolute';
            clickHint.style.bottom = '10px';
            clickHint.style.right = '10px';
            clickHint.style.background = 'rgba(0, 0, 0, 0.7)';
            clickHint.style.color = 'white';
            clickHint.style.padding = '4px 8px';
            clickHint.style.borderRadius = '4px';
            clickHint.style.fontSize = '12px';
            clickHint.style.opacity = '0.8';
            
            imgWrapper.appendChild(img);
            imgWrapper.appendChild(label);
            imgWrapper.appendChild(clickHint);
            previewContainer.appendChild(imgWrapper);
        };
        reader.readAsDataURL(file);
    });
    
    elements.imagePreview.appendChild(previewContainer);
    
    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.justifyContent = 'center';
    
    const changeBtn = document.createElement('button');
    changeBtn.className = 'btn-secondary';
    changeBtn.id = 'change-image-btn';
    changeBtn.textContent = 'Change Images';
    changeBtn.addEventListener('click', () => elements.fileInput.click());
    
    const scanBtn = document.createElement('button');
    scanBtn.className = 'btn-primary';
    scanBtn.id = 'scan-btn';
    scanBtn.innerHTML = `<span class="btn-icon">🔍</span> Scan ${files.length} Card${files.length > 1 ? 's' : ''}`;
    scanBtn.addEventListener('click', scanImage);
    
    buttonContainer.appendChild(changeBtn);
    buttonContainer.appendChild(scanBtn);
    elements.imagePreview.appendChild(buttonContainer);
}

// ===== OCR SCANNING WITH OCR.SPACE API =====
async function scanImage() {
    if (gameState.isScanning) return;
    
    gameState.isScanning = true;
    elements.scanBtn.style.display = 'none';
    elements.scanProgress.style.display = 'block';
    
    const files = gameState.uploadedImages;
    if (!files || files.length === 0) {
        alert('No images selected');
        resetUpload();
        return;
    }
    
    gameState.cards = [];
    
    try {
        for (let i = 0; i < files.length; i++) {
            const originalFile = files[i];
            const cardName = `Card ${i + 1}`;
            
            elements.progressText.textContent = `Scanning ${cardName} (${i + 1}/${files.length})...`;
            elements.progressFill.style.width = `${((i / files.length) * 80)}%`;
            
            console.log(`\n📋 Processing ${cardName}: ${originalFile.name}`);
            
            try {
                const numbers = await scanSingleCard(originalFile);
                
                if (numbers.length > 0) {
                    gameState.cards.push({
                        id: Date.now() + i,
                        name: cardName,
                        fileName: originalFile.name,
                        numbers: numbers,
                        markedIndices: []
                    });
                    console.log(`✓ ${cardName}: ${numbers.length} numbers detected`);
                } else {
                    console.warn(`⚠️ ${cardName}: No numbers detected`);
                }
                
            } catch (error) {
                console.error(`❌ ${cardName} failed:`, error.message);
            }
        }
        
        elements.progressFill.style.width = '100%';
        
        if (gameState.cards.length === 0) {
            alert('❌ No numbers detected in any card. Please try clearer images.');
            resetUpload();
            return;
        }
        
        console.log(`\n✓ Successfully scanned ${gameState.cards.length}/${files.length} cards`);
        showVerifySection();
        
    } catch (error) {
        console.error('❌ Scanning error:', error);
        alert('Scan failed. Please try again.');
        resetUpload();
    } finally {
        gameState.isScanning = false;
    }
}

async function scanSingleCard(originalFile) {
    const file = await optimizeImageForOCR(originalFile);
    
    const ocrFile = new File([file], originalFile.name || 'loto-card.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
    });
    
    const formData = new FormData();
    formData.append('file', ocrFile);
    formData.append('apikey', 'K86801680588957');
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '3');
    formData.append('scale', 'true');
    formData.append('detectOrientation', 'true');
    formData.append('filetype', 'JPG');
    
    let result;
    let lastError;
    const maxRetries = 2;
        
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            const response = await fetch('https://api.ocr.space/parse/image', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`OCR API error: ${response.status}`);
            }
            
            result = await response.json();
            
            if (result.IsErroredOnProcessing) {
                if (result.ErrorMessage?.includes('Timed out') || result.ErrorMessage?.includes('E101')) {
                    lastError = new Error('OCR timeout');
                    continue;
                }
                throw new Error(result.ErrorMessage || 'OCR processing failed');
            }
            
            break;
            
        } catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                throw lastError;
            }
        }
    }
    
    if (!result || result.IsErroredOnProcessing) {
        throw lastError || new Error('OCR failed');
    }
    
    const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
    const numbers = extractNumbers(parsedText);
    
    return numbers;
}

function extractNumbers(text) {
    const matches = text.match(/\d+/g) || [];
    const numbers = [];
    
    matches.forEach(match => {
        if (match.length === 1 || match.length === 2) {
            const num = parseInt(match);
            if (num >= 0 && num <= 99) {
                numbers.push(match.padStart(2, '0'));
            }
        } else if (match.length === 3) {
            const num1 = parseInt(match.substring(0, 1));
            const num2 = parseInt(match.substring(1, 3));
            if (num1 >= 0 && num1 <= 9) numbers.push(num1.toString().padStart(2, '0'));
            if (num2 >= 0 && num2 <= 99) numbers.push(num2.toString().padStart(2, '0'));
        } else if (match.length === 4) {
            const num1 = parseInt(match.substring(0, 2));
            const num2 = parseInt(match.substring(2, 4));
            if (num1 >= 0 && num1 <= 99) numbers.push(num1.toString().padStart(2, '0'));
            if (num2 >= 0 && num2 <= 99) numbers.push(num2.toString().padStart(2, '0'));
        } else if (match.length > 4) {
            for (let i = 0; i < match.length - 1; i += 2) {
                const chunk = match.substring(i, i + 2);
                const num = parseInt(chunk);
                if (num >= 0 && num <= 99) {
                    numbers.push(chunk.padStart(2, '0'));
                }
            }
        }
    });
    
    return [...new Set(numbers)];
}

async function convertHeicIfNeeded(file) {
    const fileName = file.name.toLowerCase();
    const isHeic = fileName.endsWith('.heic') || fileName.endsWith('.heif');
    
    if (!isHeic) {
        return file;
    }
    
    console.log('🔄 Converting HEIC to JPEG...');
    
    try {
        const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9
        });
        
        const convertedFile = new File(
            [convertedBlob], 
            file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'),
            { type: 'image/jpeg', lastModified: Date.now() }
        );
        
        console.log(`✓ Converted HEIC to JPEG: ${(convertedFile.size / 1024).toFixed(2)}KB`);
        return convertedFile;
        
    } catch (error) {
        console.error('❌ HEIC conversion failed:', error);
        throw new Error('Cannot convert HEIC image. Please use JPG or PNG format.');
    }
}

async function optimizeImageForOCR(file) {
    const ocrConfig = CONFIG.OCR_OPTIMIZATION;
    
    const convertedFile = await convertHeicIfNeeded(file);
    
    console.log(`📊 Original: ${(convertedFile.size / 1024).toFixed(2)}KB`);
    
    const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        initialQuality: 1,
        fileType: 'image/jpeg',
        preserveExif: false
    };
    
    const compressedFile = await imageCompression(convertedFile, options);
    const sizeKB = (compressedFile.size / 1024).toFixed(2);
    
    console.log(`✓ Compressed: ${sizeKB}KB`);
    
    if (compressedFile.size > ocrConfig.maxFileSize) {
        throw new Error(`Image too large: ${sizeKB}KB. Please crop or use a smaller image.`);
    }
    
    return compressedFile;
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
    
    gameState.cards.forEach((card, cardIndex) => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        cardContainer.style.marginBottom = '30px';
        cardContainer.style.padding = '20px';
        cardContainer.style.background = 'rgba(255, 255, 255, 0.03)';
        cardContainer.style.border = '2px solid rgba(102, 126, 234, 0.3)';
        cardContainer.style.borderRadius = '15px';
        cardContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        
        const cardHeader = document.createElement('div');
        cardHeader.style.marginBottom = '10px';
        cardHeader.innerHTML = `
            <h3 style="margin: 0; color: #667eea;">${card.name}</h3>
            <p style="margin: 5px 0; font-size: 14px; color: #888;">${card.fileName}</p>
            <p style="margin: 5px 0; font-size: 14px; color: #888;">${card.numbers.length} numbers detected</p>
        `;
        
        const grid = document.createElement('div');
        grid.className = 'loto-grid';
        
        card.numbers.forEach((number, index) => {
            const cell = document.createElement('div');
            cell.className = 'loto-cell';
            cell.textContent = number;
            cell.addEventListener('click', () => openEditModal(card.id, index));
            grid.appendChild(cell);
        });
        
        cardContainer.appendChild(cardHeader);
        cardContainer.appendChild(grid);
        elements.verifyGrid.appendChild(cardContainer);
    });
}

function openEditModal(cardId, index) {
    gameState.editingCardId = cardId;
    gameState.editingIndex = index;
    
    const card = gameState.cards.find(c => c.id === cardId);
    if (card) {
        elements.editInput.value = card.numbers[index];
        elements.editModal.style.display = 'flex';
        elements.editInput.focus();
        elements.editInput.select();
    }
}

function closeEditModal() {
    elements.editModal.style.display = 'none';
    gameState.editingIndex = null;
    gameState.editingCardId = null;
}

function saveEdit() {
    const value = elements.editInput.value.trim().padStart(2, '0');
    const num = parseInt(value);
    
    if (isNaN(num) || num < 0 || num > 99) {
        alert('Please enter a valid number (00-99)');
        return;
    }
    
    const card = gameState.cards.find(c => c.id === gameState.editingCardId);
    if (card) {
        card.numbers[gameState.editingIndex] = value;
        renderVerifyGrid();
    }
    
    closeEditModal();
}

function confirmNumbers() {
    if (gameState.cards.length === 0) {
        alert('No cards to confirm');
        return;
    }
    showGameSection();
}

// ===== GAME SECTION =====
function showGameSection() {
    elements.verifySection.style.display = 'none';
    elements.gameSection.style.display = 'block';
    gameState.currentStep = 'play';
    renderGameGrid();
    updateCalledNumbers();
    saveGameState();
}

function renderGameGrid() {
    elements.gameGrid.innerHTML = '';
    
    gameState.cards.forEach((card, cardIndex) => {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'card-container';
        cardContainer.style.marginBottom = '30px';
        cardContainer.style.padding = '20px';
        cardContainer.style.background = 'rgba(255, 255, 255, 0.03)';
        cardContainer.style.border = '2px solid rgba(102, 126, 234, 0.3)';
        cardContainer.style.borderRadius = '15px';
        cardContainer.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        
        const cardHeader = document.createElement('div');
        cardHeader.style.marginBottom = '10px';
        cardHeader.style.display = 'flex';
        cardHeader.style.justifyContent = 'space-between';
        cardHeader.style.alignItems = 'center';
        
        const markedCount = card.markedIndices.length;
        const totalCount = card.numbers.length;
        
        cardHeader.innerHTML = `
            <div>
                <h3 style="margin: 0; color: #667eea;">${card.name}</h3>
                <p style="margin: 5px 0; font-size: 14px; color: #888;">Marked: ${markedCount}/${totalCount}</p>
            </div>
        `;
        
        const grid = document.createElement('div');
        grid.className = 'loto-grid';
        
        card.numbers.forEach((number, index) => {
            const cell = document.createElement('div');
            cell.className = 'loto-cell';
            cell.textContent = number;
            
            if (card.markedIndices.includes(index)) {
                cell.classList.add('marked');
            }
            
            grid.appendChild(cell);
        });
        
        cardContainer.appendChild(cardHeader);
        cardContainer.appendChild(grid);
        elements.gameGrid.appendChild(cardContainer);
    });
}

function markNumber() {
    let value = elements.numberInput.value.trim();
    
    if (!value) return;
    
    value = value.padStart(2, '0');
    const num = parseInt(value);
    
    if (isNaN(num) || num < 0 || num > 99) {
        alert('Please enter a valid number (00-99)');
        return;
    }
    
    if (gameState.calledNumbers.includes(value)) {
        alert(`Number ${value} has already been called!`);
        return;
    }
    
    gameState.calledNumbers.push(value);
    
    let foundInAnyCard = false;
    let winningCards = [];
    
    gameState.cards.forEach(card => {
        const index = card.numbers.indexOf(value);
        
        if (index !== -1 && !card.markedIndices.includes(index)) {
            card.markedIndices.push(index);
            foundInAnyCard = true;
            
            const winResult = checkWinForCard(card);
            if (winResult.win) {
                winningCards.push({ card, winResult });
            }
        }
    });
    
    renderGameGrid();
    updateCalledNumbers();
    
    if (winningCards.length > 0) {
        setTimeout(() => showWinModal(winningCards[0].card, winningCards[0].winResult), 500);
    }
    
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
    
    gameState.cards.forEach(card => {
        card.markedIndices = [];
    });
    gameState.calledNumbers = [];
    renderGameGrid();
    updateCalledNumbers();
    saveGameState();
}

// Removed newGame() - same as clearMarks()

function uploadNewCard() {
    if (gameState.currentStep === 'play' && gameState.calledNumbers.length > 0) {
        if (!confirm('Upload new cards? Current game will be lost.')) return;
    }
    
    gameState = {
        currentStep: 'upload',
        uploadedImages: [],
        cards: [],
        currentCardIndex: 0,
        scannedNumbers: [],
        calledNumbers: [],
        editingIndex: null,
        editingCardId: null,
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
function checkWinForCard(card) {
    for (const [name, pattern] of Object.entries(winPatterns)) {
        if (pattern.every(i => card.markedIndices.includes(i))) {
            return { 
                win: true, 
                pattern: name, 
                indices: pattern 
            };
        }
    }
    return { win: false };
}

function showWinModal(card, winResult) {
    elements.winPatternName.textContent = `${card.name} - ${winResult.pattern}`;
    
    elements.winGrid.innerHTML = '';
    card.numbers.forEach((number, index) => {
        const cell = document.createElement('div');
        cell.className = 'loto-cell';
        cell.textContent = number;
        
        if (card.markedIndices.includes(index)) {
            cell.classList.add('marked');
        }
        
        if (winResult.indices.includes(index)) {
            cell.classList.add('winning');
        }
        
        elements.winGrid.appendChild(cell);
    });
    
    elements.winNumbersList.innerHTML = '';
    winResult.indices.forEach(index => {
        const number = card.numbers[index];
        const span = document.createElement('div');
        span.className = 'win-number';
        span.textContent = number;
        elements.winNumbersList.appendChild(span);
    });
    
    elements.winModal.style.display = 'flex';
}

function playAgain() {
    elements.winModal.style.display = 'none';
    clearMarks();
}

// ===== SAVE/LOAD GAME STATE =====
function saveGameState() {
    try {
        localStorage.setItem('lotoGameState', JSON.stringify(gameState));
    } catch (error) {
    }
}

function loadSavedGame() {
    try {
        const saved = localStorage.getItem('lotoGameState');
        if (saved) {
            const savedState = JSON.parse(saved);
            
            if (savedState.currentStep === 'play' && savedState.cards && savedState.cards.length > 0) {
                if (confirm('Continue previous game?')) {
                    gameState = savedState;
                    showGameSection();
                }
            }
        }
    } catch (error) {
        console.error('Failed to load saved game:', error);
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

// ===== IMAGE PREVIEW MODAL =====
function openImageModal(imageSrc, cardNumber) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0, 0, 0, 0.9)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '10000';
    modal.style.cursor = 'pointer';
    modal.style.padding = '20px';
    
    const content = document.createElement('div');
    content.style.position = 'relative';
    content.style.maxWidth = '90%';
    content.style.maxHeight = '90%';
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.alignItems = 'center';
    
    const title = document.createElement('div');
    title.textContent = `Card ${cardNumber}`;
    title.style.color = 'white';
    title.style.fontSize = '24px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '15px';
    title.style.textAlign = 'center';
    
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.maxWidth = '100%';
    img.style.maxHeight = 'calc(90vh - 100px)';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '12px';
    img.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';
    
    const closeHint = document.createElement('div');
    closeHint.textContent = 'Click anywhere to close';
    closeHint.style.color = 'rgba(255, 255, 255, 0.7)';
    closeHint.style.fontSize = '14px';
    closeHint.style.marginTop = '15px';
    closeHint.style.textAlign = 'center';
    
    content.appendChild(title);
    content.appendChild(img);
    content.appendChild(closeHint);
    modal.appendChild(content);
    
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.body.appendChild(modal);
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

