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
    };
    reader.readAsDataURL(file);
}

// ===== OCR SCANNING WITH OCR.SPACE API =====
async function scanImage() {
    if (gameState.isScanning) return;
    
    gameState.isScanning = true;
    elements.scanBtn.style.display = 'none';
    elements.scanProgress.style.display = 'block';
    
    try {
        
        elements.progressText.textContent = 'Preparing image...';
        elements.progressFill.style.width = '20%';
        
        const originalFile = elements.fileInput.files[0];
        if (!originalFile) {
            throw new Error('No file selected');
        }
        
        elements.progressText.textContent = 'Optimizing image...';
        let file;
        
        try {
            file = await optimizeImageForOCR(originalFile);
            elements.progressText.textContent = '✓ Image optimized';
            console.log(`✓ Final size: ${(file.size / 1024).toFixed(2)}KB`);
        } catch (optimizeError) {
            console.error('❌ Optimization failed:', optimizeError.message);
            
            const errorMsg = `⚠️ Không thể tối ưu hóa ảnh.\n\nLỗi: ${optimizeError.message}\n\nVui lòng:\n- Sử dụng ảnh nhỏ hơn (< 5MB)\n- Crop ảnh để chỉ chụp thẻ lô tô\n- Giảm độ phân giải khi chụp`;
            
            alert(errorMsg);
            throw optimizeError;
        }
        
        elements.progressText.textContent = 'Uploading to OCR.space...';
        elements.progressFill.style.width = '40%';
        
        const ocrFile = new File([file], originalFile.name || 'loto-card.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now()
        });
        
        console.log('📤 Uploading:', {
            name: ocrFile.name,
            type: ocrFile.type,
            size: `${(ocrFile.size / 1024).toFixed(2)}KB`
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
        
        
        elements.progressText.textContent = 'Scanning with OCR.space...';
        elements.progressFill.style.width = '60%';
        
        // Call OCR.space API with retry logic
        let result;
        let lastError;
        const maxRetries = 2;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 1) {
                    console.log(`🔄 Retry attempt ${attempt}/${maxRetries}...`);
                    elements.progressText.textContent = `Retrying OCR (${attempt}/${maxRetries})...`;
                    // Wait a bit before retry
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
                
                // Check for errors
                if (result.IsErroredOnProcessing) {
                    if (result.ErrorMessage?.includes('Timed out') || result.ErrorMessage?.includes('E101')) {
                        lastError = new Error('OCR timeout');
                        console.warn(`⚠️ Attempt ${attempt} timed out`);
                        continue;
                    }
                    throw new Error(result.ErrorMessage || 'OCR processing failed');
                }
                
                console.log('✓ OCR completed');
                break;
                
            } catch (error) {
                lastError = error;
                console.error(`❌ Attempt ${attempt} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    throw lastError;
                }
            }
        }
        
        if (!result || result.IsErroredOnProcessing) {
            throw lastError || new Error('OCR failed after all retries');
        }
        
        elements.progressFill.style.width = '80%';
        
        const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
        const numbers = extractNumbers(parsedText);
        
        elements.progressFill.style.width = '100%';

        if (numbers.length === 0) {
            alert('❌ No numbers detected. Please try a clearer image or enter numbers manually.');
            resetUpload();
            return;
        }

        gameState.scannedNumbers = numbers;
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
        maxSizeMB: 0.95,
        maxWidthOrHeight: 2000,
        useWebWorker: true,
        initialQuality: 0.9,
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

