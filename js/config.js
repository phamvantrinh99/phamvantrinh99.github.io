// Configuration file
const CONFIG = {
    // Cloudinary Configuration
    // Hướng dẫn setup:
    // 1. Truy cập https://cloudinary.com/console
    // 2. Copy "Cloud name" từ Dashboard
    // 3. Tag ảnh trong Media Library (ví dụ: "gallery")
    // 4. Settings → Security → Uncheck "Resource list"
    CLOUDINARY_CLOUD_NAME: 'disufd9md',
    CLOUDINARY_TAG: 'uploaded',
    
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

