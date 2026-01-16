// Configuration file - EXAMPLE
// Copy this file to config.js and fill in your actual values

const CONFIG = {
    // ============================================
    // GOOGLE DRIVE API CONFIGURATION
    // ============================================
    
    // Your Google API Key
    // Get it from: https://console.cloud.google.com/
    // Steps:
    // 1. Create a project
    // 2. Enable Google Drive API
    // 3. Create Credentials > API Key
    // 4. Restrict the key to your domain and Google Drive API
    GOOGLE_API_KEY: 'YOUR_GOOGLE_API_KEY_HERE',
    
    // Your Google Drive Folder ID
    // Get it from the folder URL: https://drive.google.com/drive/folders/FOLDER_ID
    // Make sure the folder is shared as "Anyone with the link can view"
    GOOGLE_FOLDER_ID: 'YOUR_FOLDER_ID_HERE',
    
    // ============================================
    // THREE.JS SCENE CONFIGURATION
    // ============================================
    SCENE: {
        backgroundColor: 0x1a1a2e,  // Background color (hex)
        cameraFov: 75,              // Field of view
        cameraNear: 0.1,            // Near clipping plane
        cameraFar: 2000,            // Far clipping plane
        cameraPosition: { x: 0, y: 0, z: 50 }  // Initial camera position
    },
    
    // ============================================
    // GALLERY LAYOUT CONFIGURATION
    // ============================================
    GALLERY: {
        imageWidth: 10,      // Width of each image plane in 3D space
        imageHeight: 10,     // Height of each image plane in 3D space
        spacing: 15,         // Spacing between images
        
        // Grid layout settings
        gridColumns: 5,      // Number of columns in grid layout
        
        // Circle layout settings
        circleRadius: 40,    // Radius of the circle
        
        // Spiral layout settings
        spiralSpacing: 5,    // Vertical spacing in spiral
        spiralRotations: 3   // Number of spiral rotations
    },
    
    // ============================================
    // ANIMATION CONFIGURATION
    // ============================================
    ANIMATION: {
        autoRotate: false,          // Auto-rotate camera around the scene
        autoRotateSpeed: 0.5,       // Rotation speed (if autoRotate is true)
        transitionDuration: 1000    // Duration of layout transitions (ms)
    },
    
    // ============================================
    // IMAGE LOADING CONFIGURATION
    // ============================================
    LOADING: {
        maxConcurrent: 5,    // Maximum number of images to load simultaneously
        thumbnailSize: 512   // Google Drive thumbnail size (pixels)
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

