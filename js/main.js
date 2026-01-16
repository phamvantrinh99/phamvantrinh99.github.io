/**
 * Main Application Controller
 * Coordinates all modules and handles UI interactions
 */

(function() {
    'use strict';
    
    // DOM Elements
    let loadingScreen, loadingText, progressFill;
    let imageModal, modalImage, modalCaption;
    let errorMessage, errorText, retryBtn;
    let imageCountEl;
    let layoutButtons;
    
    // Application state
    let currentImages = [];
    let currentImageIndex = 0;
    
    /**
     * Initialize application
     */
    async function init() {
        console.log('🚀 Khởi động ứng dụng...');
        
        // Get DOM elements
        getDOMElements();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize Cloudinary Manager
        CloudinaryManager.init(CONFIG.CLOUDINARY_CLOUD_NAME, CONFIG.CLOUDINARY_TAG);
        
        // Initialize Three.js Gallery
        const container = document.getElementById('container');
        Gallery3D.init(container);
        
        try {
            // Show loading screen
            showLoading('Đang kết nối Cloudinary...');
            
            // Test connection
            const connected = await CloudinaryManager.testConnection();
            if (!connected) {
                throw new Error('Không thể kết nối Cloudinary. Kiểm tra lại Cloud Name và Folder Name.');
            }
            
            // Fetch images from Cloudinary (NO CORS!)
            showLoading('Đang tải danh sách ảnh...');
            currentImages = await CloudinaryManager.fetchImages();
            
            // Check if any images were loaded
            if (currentImages.length === 0) {
                throw new Error('Không có ảnh nào được hỗ trợ. Vui lòng upload ảnh JPG, PNG, GIF hoặc WebP.');
            }
            
            // Update UI
            updateImageCount(currentImages.length);
            
            // Load images into 3D scene
            showLoading(`Đang tải ${currentImages.length} ảnh...`);
            await Gallery3D.loadImages(currentImages);
            
            // Start animation
            Gallery3D.start();
            
            // Hide loading screen
            hideLoading();
            
            console.log('✓ Ứng dụng đã sẵn sàng!');
            
        } catch (error) {
            console.error('✗ Lỗi khởi động:', error);
            showError(error.message);
        }
    }
    
    /**
     * Get DOM elements
     */
    function getDOMElements() {
        loadingScreen = document.getElementById('loading-screen');
        loadingText = document.getElementById('loading-text');
        progressFill = document.getElementById('progress-fill');
        
        imageModal = document.getElementById('image-modal');
        modalImage = document.getElementById('modal-image');
        modalCaption = document.getElementById('modal-caption');
        
        errorMessage = document.getElementById('error-message');
        errorText = document.getElementById('error-text');
        retryBtn = document.getElementById('retry-btn');
        
        imageCountEl = document.getElementById('image-count');
        
        // Layout dropdown (not buttons anymore)
        layoutButtons = {}; // Keep for compatibility but not used
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Toggle panel button
        const toggleBtn = document.getElementById('toggle-panel');
        const controlPanel = document.getElementById('control-panel');
        const uiControls = document.getElementById('ui-controls');
        
        // Start collapsed (default)
        // uiControls does NOT have 'expanded' class initially
        
        toggleBtn.addEventListener('click', () => {
            const isExpanded = uiControls.classList.toggle('expanded');
            controlPanel.classList.toggle('hidden');
            
            // Update button text
            toggleBtn.textContent = isExpanded ? '▲' : '▼';
        });
        
        // Layout dropdown
        const layoutSelect = document.getElementById('layout-select');
        layoutSelect.addEventListener('change', (e) => {
            changeLayout(e.target.value);
        });
        
        // Control sliders and checkboxes
        setupControlListeners();
        
        // Modal controls
        const closeBtn = document.querySelector('.close');
        closeBtn.addEventListener('click', closeModal);
        
        const prevBtn = document.getElementById('prev-image');
        const nextBtn = document.getElementById('next-image');
        prevBtn.addEventListener('click', showPreviousImage);
        nextBtn.addEventListener('click', showNextImage);
        
        // Close modal on background click
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeModal();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (imageModal.classList.contains('show')) {
                if (e.key === 'Escape') closeModal();
                if (e.key === 'ArrowLeft') showPreviousImage();
                if (e.key === 'ArrowRight') showNextImage();
            }
        });
        
        // Retry button
        retryBtn.addEventListener('click', () => {
            hideError();
            init();
        });
        
        // Custom events from Gallery3D
        window.addEventListener('imageClicked', (e) => {
            const { imageData, imageIndex } = e.detail;
            showImageModal(imageData, imageIndex);
        });
        
        window.addEventListener('loadingProgress', (e) => {
            const { progress } = e.detail;
            updateProgress(progress);
        });
    }
    
    /**
     * Setup control listeners for sliders and checkboxes
     */
    function setupControlListeners() {
        // Particle Count
        const particleCountSlider = document.getElementById('particle-count');
        const particleCountValue = document.getElementById('particle-count-value');
        particleCountSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            particleCountValue.textContent = value;
            Gallery3D.updateControls({ particleCount: value });
        });
        
        // Particle Speed
        const particleSpeedSlider = document.getElementById('particle-speed');
        const particleSpeedValue = document.getElementById('particle-speed-value');
        particleSpeedSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            particleSpeedValue.textContent = value.toFixed(1) + 'x';
            Gallery3D.updateControls({ particleSpeed: value });
        });
        
        // Auto Rotate Images Toggle
        const autoRotateToggle = document.getElementById('auto-rotate-images');
        autoRotateToggle.addEventListener('change', (e) => {
            Gallery3D.updateControls({ autoRotateImages: e.target.checked });
        });
        
        // Auto Rotate Gallery Toggle
        const autoRotateGalleryToggle = document.getElementById('auto-rotate-gallery');
        autoRotateGalleryToggle.addEventListener('change', (e) => {
            Gallery3D.updateControls({ autoRotateGallery: e.target.checked });
        });
        
        // Gallery Rotation Speed (only one speed slider for both)
        const galleryRotationSpeedSlider = document.getElementById('gallery-rotation-speed');
        const galleryRotationSpeedValue = document.getElementById('gallery-rotation-speed-value');
        galleryRotationSpeedSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            galleryRotationSpeedValue.textContent = value.toFixed(1) + 'x';
            // Apply speed to both rotations
            Gallery3D.updateControls({ 
                rotationSpeed: value * 2, // Image rotation faster
                galleryRotationSpeed: value 
            });
        });
    }
    
    /**
     * Change gallery layout
     */
    function changeLayout(layout) {
        // Change layout in 3D gallery
        Gallery3D.changeLayout(layout);
        
        console.log(`Layout changed to: ${layout}`);
    }
    
    /**
     * Show loading screen
     */
    function showLoading(text) {
        loadingText.textContent = text;
        loadingScreen.classList.remove('hidden');
    }
    
    /**
     * Hide loading screen
     */
    function hideLoading() {
        loadingScreen.classList.add('hidden');
    }
    
    /**
     * Update loading progress
     */
    function updateProgress(progress) {
        progressFill.style.width = `${progress}%`;
        loadingText.textContent = `Đang tải ảnh... ${Math.round(progress)}%`;
    }
    
    /**
     * Update image count display
     */
    function updateImageCount(count) {
        imageCountEl.textContent = `📷 ${count} ảnh`;
    }
    
    /**
     * Show error message
     */
    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        hideLoading();
    }
    
    /**
     * Hide error message
     */
    function hideError() {
        errorMessage.classList.add('hidden');
    }
    
    /**
     * Show image modal
     */
    function showImageModal(imageData, imageIndex) {
        currentImageIndex = imageIndex;
        modalImage.src = imageData.fullUrl;
        modalCaption.textContent = imageData.name;
        imageModal.classList.add('show');
        
        console.log('Showing image:', imageData.name);
    }
    
    /**
     * Close modal
     */
    function closeModal() {
        imageModal.classList.remove('show');
    }
    
    /**
     * Show previous image
     */
    function showPreviousImage() {
        currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
        const imageData = currentImages[currentImageIndex];
        modalImage.src = imageData.fullUrl;
        modalCaption.textContent = imageData.name;
    }
    
    /**
     * Show next image
     */
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentImages.length;
        const imageData = currentImages[currentImageIndex];
        modalImage.src = imageData.fullUrl;
        modalCaption.textContent = imageData.name;
    }
    
    /**
     * Start application when DOM is ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

