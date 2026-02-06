/**
 * Image Management Page
 * Handles listing, uploading, and deleting images
 */

(function() {
    'use strict';

    // DOM Elements
    let hamburgerMenu, navMenu, navOverlay, closeMenuBtn;
    let uploadArea, fileInput, selectFilesBtn;
    let uploadProgress, progressFill, progressText;
    let loading, imagesGrid, emptyState, imageCount;
    let searchInput, refreshBtn;
    let deleteModal, deleteImageName, confirmDeleteBtn, cancelDeleteBtn;
    let errorToast, successToast, errorMessage, successMessage;

    // State
    let allImages = [];
    let filteredImages = [];
    let imageToDelete = null;

    /**
     * Initialize the application
     */
    function init() {
        console.log('🚀 Initializing Image Management...');

        // Get DOM elements
        getDOMElements();

        // Setup event listeners
        setupEventListeners();

        // Initialize Cloudinary
        CloudinaryManager.init(CONFIG.CLOUDINARY_CLOUD_NAME, CONFIG.CLOUDINARY_TAG);

        // Load images
        loadImages();
    }

    /**
     * Get DOM elements
     */
    function getDOMElements() {
        // Navigation
        hamburgerMenu = document.getElementById('hamburger-menu');
        navMenu = document.getElementById('nav-menu');
        navOverlay = document.getElementById('nav-overlay');
        closeMenuBtn = document.getElementById('close-menu');

        // Upload
        uploadArea = document.getElementById('upload-area');
        fileInput = document.getElementById('file-input');
        selectFilesBtn = document.getElementById('select-files-btn');
        uploadProgress = document.getElementById('upload-progress');
        progressFill = document.getElementById('progress-fill');
        progressText = document.getElementById('progress-text');

        // Images list
        loading = document.getElementById('loading');
        imagesGrid = document.getElementById('images-grid');
        emptyState = document.getElementById('empty-state');
        imageCount = document.getElementById('image-count');
        searchInput = document.getElementById('search-input');
        refreshBtn = document.getElementById('refresh-btn');

        // Delete modal
        deleteModal = document.getElementById('delete-modal');
        deleteImageName = document.getElementById('delete-image-name');
        confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        cancelDeleteBtn = document.getElementById('cancel-delete-btn');

        // Toasts
        errorToast = document.getElementById('error-toast');
        successToast = document.getElementById('success-toast');
        errorMessage = document.getElementById('error-message');
        successMessage = document.getElementById('success-message');
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Navigation
        hamburgerMenu.addEventListener('click', toggleMenu);
        closeMenuBtn.addEventListener('click', closeMenu);
        navOverlay.addEventListener('click', closeMenu);

        // Upload
        selectFilesBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling to uploadArea
            fileInput.click();
        });
        fileInput.addEventListener('change', handleFileSelect);
        uploadArea.addEventListener('click', (e) => {
            // Only trigger if clicking on the upload area itself, not the button
            if (e.target === uploadArea || e.target.closest('.upload-icon, .upload-or, p')) {
                fileInput.click();
            }
        });
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);

        // Search and refresh
        searchInput.addEventListener('input', handleSearch);
        refreshBtn.addEventListener('click', loadImages);

        // Delete modal
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }

    /**
     * Toggle navigation menu
     */
    function toggleMenu() {
        hamburgerMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');
    }

    /**
     * Close navigation menu
     */
    function closeMenu() {
        hamburgerMenu.classList.remove('active');
        navMenu.classList.remove('active');
        navOverlay.classList.remove('active');
    }

    /**
     * Load images from Cloudinary
     */
    async function loadImages() {
        try {
            loading.style.display = 'block';
            imagesGrid.innerHTML = '';
            emptyState.style.display = 'none';

            console.log('📥 Loading images from Cloudinary...');
            const images = await CloudinaryManager.getImages();
            
            allImages = images;
            filteredImages = images;
            
            displayImages(images);
            updateImageCount(images.length);

            console.log(`✓ Loaded ${images.length} images`);
        } catch (error) {
            console.error('❌ Error loading images:', error);
            showError('Failed to load images. Please try again.');
        } finally {
            loading.style.display = 'none';
        }
    }

    /**
     * Display images in grid
     */
    function displayImages(images) {
        imagesGrid.innerHTML = '';

        if (images.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        images.forEach(image => {
            const card = createImageCard(image);
            imagesGrid.appendChild(card);
        });
    }

    /**
     * Create image card element
     */
    function createImageCard(image) {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.dataset.imageId = image.id;

        // Format date
        const date = new Date(image.createdTime);
        const formattedDate = date.toLocaleDateString('vi-VN');

        // Format size
        const sizeKB = Math.round((image.width * image.height) / 1024);

        card.innerHTML = `
            <img src="${image.thumbnailUrl}" alt="${image.name}" class="image-card-img" loading="lazy">
            <div class="image-card-info">
                <div class="image-card-name" title="${image.name}">${image.name}</div>
                <div class="image-card-meta">
                    <span>📅 ${formattedDate}</span>
                    <span>📐 ${image.width}×${image.height}</span>
                </div>
                <div class="image-card-actions">
                    <button class="btn-icon view-btn" data-image-id="${image.id}">👁️ View</button>
                    <button class="btn-icon delete-btn" data-image-id="${image.id}">🗑️ Delete</button>
                </div>
            </div>
        `;

        // Add event listeners
        const viewBtn = card.querySelector('.view-btn');
        const deleteBtn = card.querySelector('.delete-btn');

        viewBtn.addEventListener('click', () => viewImage(image));
        deleteBtn.addEventListener('click', () => showDeleteModal(image));

        return card;
    }

    /**
     * View image in new tab
     */
    function viewImage(image) {
        window.open(image.fullUrl, '_blank');
    }

    /**
     * Show delete confirmation modal
     */
    function showDeleteModal(image) {
        imageToDelete = image;
        deleteImageName.textContent = image.name;
        deleteModal.classList.add('show');
    }

    /**
     * Close delete modal
     */
    function closeDeleteModal() {
        deleteModal.classList.remove('show');
        imageToDelete = null;
    }

    /**
     * Confirm delete image
     */
    async function confirmDelete() {
        if (!imageToDelete) return;

        try {
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.textContent = 'Deleting...';

            console.log('🗑️ Deleting image:', imageToDelete.id);
            await CloudinaryManager.deleteImage(imageToDelete.id);

            showSuccess(`Deleted "${imageToDelete.name}" successfully!`);
            closeDeleteModal();

            // Reload images
            await loadImages();

        } catch (error) {
            console.error('❌ Error deleting image:', error);
            showError('Failed to delete image. Please try again.');
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = 'Delete';
        }
    }

    /**
     * Handle file select
     */
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            uploadFiles(files);
        }
    }

    /**
     * Handle drag over
     */
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    }

    /**
     * Handle drag leave
     */
    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    }

    /**
     * Handle drop
     */
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.classList.remove('drag-over');

        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('image/')
        );

        if (files.length > 0) {
            uploadFiles(files);
        } else {
            showError('Please drop image files only.');
        }
    }

    /**
     * Upload files to Cloudinary
     */
    async function uploadFiles(files) {
        try {
            uploadProgress.style.display = 'block';
            progressFill.style.width = '0%';
            progressText.textContent = `Uploading 0/${files.length} files...`;

            console.log(`📤 Uploading ${files.length} files to folder: ${CONFIG.CLOUDINARY_FOLDER}...`);

            let uploaded = 0;
            let failed = 0;
            
            for (const file of files) {
                try {
                    await CloudinaryManager.uploadImage(file);
                    uploaded++;
                    console.log(`✓ Uploaded: ${file.name}`);
                } catch (error) {
                    failed++;
                    console.error(`✗ Failed to upload: ${file.name}`, error);
                }
                
                const progress = ((uploaded + failed) / files.length) * 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `Uploading ${uploaded + failed}/${files.length} files...`;
            }

            // Show result notification
            if (failed === 0) {
                showSuccess(`✅ Successfully uploaded ${uploaded} image(s) to folder "${CONFIG.CLOUDINARY_FOLDER}"!`);
            } else if (uploaded > 0) {
                showSuccess(`⚠️ Uploaded ${uploaded} image(s), ${failed} failed.`);
            } else {
                showError(`❌ Failed to upload all ${failed} image(s). Please try again.`);
            }
            
            // Reset file input
            fileInput.value = '';
            
            // Hide progress after a short delay
            setTimeout(() => {
                uploadProgress.style.display = 'none';
            }, 1500);

            // Auto-refresh page after successful upload
            if (uploaded > 0) {
                console.log('🔄 Auto-refreshing page in 2 seconds...');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }

        } catch (error) {
            console.error('❌ Error uploading files:', error);
            showError('Failed to upload files. Please check your internet connection and try again.');
            uploadProgress.style.display = 'none';
        }
    }

    /**
     * Handle search
     */
    function handleSearch(e) {
        const query = e.target.value.toLowerCase().trim();

        if (!query) {
            filteredImages = allImages;
        } else {
            filteredImages = allImages.filter(image => 
                image.name.toLowerCase().includes(query)
            );
        }

        displayImages(filteredImages);
        updateImageCount(filteredImages.length);
    }

    /**
     * Update image count
     */
    function updateImageCount(count) {
        imageCount.textContent = count;
    }

    /**
     * Show error toast
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorToast.classList.add('show');
        setTimeout(() => {
            errorToast.classList.remove('show');
        }, 3000);
    }

    /**
     * Show success toast
     */
    function showSuccess(message) {
        successMessage.textContent = message;
        successToast.classList.add('show');
        setTimeout(() => {
            successToast.classList.remove('show');
        }, 3000);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

