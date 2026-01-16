// Configuration file
const CONFIG = {
    // Google Drive API Configuration
    // Hướng dẫn setup:
    // 1. Truy cập https://console.cloud.google.com/
    // 2. Tạo project mới hoặc chọn project có sẵn
    // 3. Enable Google Drive API
    // 4. Tạo API Key (Credentials > Create Credentials > API Key)
    // 5. Restrict API key chỉ cho Google Drive API
    // 6. Copy API key vào đây
    GOOGLE_API_KEY: 'AIzaSyAOFqDzpycwSQFbUSZazhMlHBcXQAjniEk',
    
    // Google Drive Folder ID
    // Lấy từ URL của folder: https://drive.google.com/drive/folders/FOLDER_ID_HERE
    // Folder phải được set là "Anyone with the link can view"
    GOOGLE_FOLDER_ID: '13CcHGMQmcnC3BvQrFVgSNK_KTvrLvdc0',
    
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
        spacing: 15,
        
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
        maxConcurrent: 5, // Load max 5 images at a time
        thumbnailSize: 512 // Google Drive thumbnail size
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

