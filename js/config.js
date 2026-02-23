// Configuration file
const CONFIG = {
    // Cloudinary Configuration
    // Hướng dẫn setup:
    // 1. Truy cập https://cloudinary.com/console
    // 2. Copy "Cloud name" từ Dashboard
    // 3. Tag ảnh trong Media Library (ví dụ: "gallery")
    // 4. Settings → Security → Uncheck "Resource list"
    // 5. Settings → Upload → Create unsigned upload preset: "ml_default"
    CLOUDINARY_CLOUD_NAME: 'disufd9md',
    CLOUDINARY_TAG: 'uploaded',
    CLOUDINARY_FOLDER: 'Test folder', // Folder to upload images to
    CLOUDINARY_UPLOAD_PRESET: 'ml_default', // Unsigned upload preset
    
    // OCR Image Optimization Settings (Client-side compression)
    OCR_OPTIMIZATION: {
        // Maximum file size for OCR.space free tier
        maxFileSize: 1024 * 1024 // 1MB in bytes
    },
    
    // Three.js Scene Configuration
    SCENE: {
        backgroundColor: 0x1a1a2e,
        cameraFov: 75,
        cameraNear: 0.1,
        cameraFar: 2000,
        cameraPosition: { x: 0, y: 0, z: 50 }
    },
    
    // Gallery Layout Configuration
    GALLERY: {
        imageWidth: 10,
        imageHeight: 10,
        spacing: 18,
        
        // Grid layout
        gridColumns: 5,
        
        // Circle layout
        circleRadius: 40,
        
        // Spiral layout
        spiralSpacing: 5,
        spiralRotations: 3
    },
    
    // Animation Configuration
    ANIMATION: {
        autoRotate: false,
        autoRotateSpeed: 0.5,
        transitionDuration: 1000 // milliseconds
    },
    
    // Image Loading Configuration
    LOADING: {
        maxConcurrent: 5, // Load 5 images at a time (Cloudinary CDN is fast!)
        thumbnailSize: 1200 // Cloudinary thumbnail width (higher quality)
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

