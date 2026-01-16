/**
 * Google Drive API Integration Module
 * Handles fetching images from Google Drive shared folder
 */

const GDriveManager = (() => {
    let apiKey = '';
    let folderId = '';
    
    /**
     * Initialize Google Drive Manager
     */
    function init(key, folder) {
        apiKey = key;
        folderId = folder;
    }
    
    /**
     * Validate configuration
     */
    function validateConfig() {
        if (!apiKey || apiKey === 'YOUR_GOOGLE_API_KEY_HERE') {
            throw new Error('Vui lòng cấu hình Google API Key trong file js/config.js');
        }
        if (!folderId || folderId === 'YOUR_FOLDER_ID_HERE') {
            throw new Error('Vui lòng cấu hình Google Drive Folder ID trong file js/config.js');
        }
    }
    
    /**
     * Fetch images from Google Drive folder
     * @returns {Promise<Array>} Array of image objects
     */
    async function fetchImages() {
        validateConfig();
        
        try {
            // Query để lấy tất cả file ảnh trong folder
            const query = `'${folderId}' in parents and (mimeType contains 'image/')`;
            const fields = 'files(id,name,mimeType,thumbnailLink,webContentLink,size,createdTime)';
            
            const url = `https://www.googleapis.com/drive/v3/files?` +
                `q=${encodeURIComponent(query)}&` +
                `key=${apiKey}&` +
                `fields=${fields}&` +
                `pageSize=1000`; // Max 1000 files
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error.message || 'Không thể tải ảnh từ Google Drive');
            }
            
            const data = await response.json();
            
            if (!data.files || data.files.length === 0) {
                throw new Error('Không tìm thấy ảnh nào trong folder. Kiểm tra lại Folder ID và quyền truy cập.');
            }
            
            // Supported image formats
            const supportedFormats = [
                'image/jpeg',
                'image/jpg', 
                'image/png',
                'image/gif',
                'image/webp',
                'image/bmp',
                'image/svg+xml'
            ];
            
            // Filter và transform data
            const allFiles = data.files;
            const images = [];
            const skippedFiles = [];
            
            allFiles.forEach(file => {
                // Check if file format is supported
                const isSupported = supportedFormats.includes(file.mimeType.toLowerCase());
                
                // Also check file extension for HEIC/HEIF
                const fileName = file.name.toLowerCase();
                const isHEIC = fileName.endsWith('.heic') || fileName.endsWith('.heif');
                
                if (isSupported && !isHEIC) {
                    // Add to images array
                    images.push({
                        id: file.id,
                        name: file.name,
                        mimeType: file.mimeType,
                        thumbnailUrl: getThumbnailUrl(file.id, 512),
                        fullUrl: getFullImageUrl(file.id),
                        size: file.size,
                        createdTime: file.createdTime
                    });
                } else {
                    // Skip unsupported format
                    skippedFiles.push({
                        name: file.name,
                        mimeType: file.mimeType,
                        reason: isHEIC ? 'HEIC format not supported in browser' : 'Unsupported format'
                    });
                }
            });
            
            console.log(`✓ Đã tải ${images.length} ảnh từ Google Drive`);
            
            if (skippedFiles.length > 0) {
                console.warn(`⚠ Đã bỏ qua ${skippedFiles.length} file không hỗ trợ:`);
                skippedFiles.forEach(file => {
                    console.warn(`  - ${file.name} (${file.reason})`);
                });
            }
            
            if (images.length === 0) {
                throw new Error('Không có ảnh nào được hỗ trợ trong folder. Vui lòng upload ảnh định dạng JPG, PNG, GIF hoặc WebP.');
            }
            
            return images;
            
        } catch (error) {
            console.error('Lỗi khi tải ảnh:', error);
            throw error;
        }
    }
    
    /**
     * Get thumbnail URL for an image
     * @param {string} fileId - Google Drive file ID
     * @param {number} size - Thumbnail size (default 512)
     * @returns {string} Thumbnail URL
     */
    function getThumbnailUrl(fileId, size = 512) {
        // Using Google Drive API with alt=media for direct image access
        return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    }
    
    /**
     * Get full image URL
     * @param {string} fileId - Google Drive file ID
     * @returns {string} Full image URL
     */
    function getFullImageUrl(fileId) {
        // Using Google Drive API with alt=media for direct image access
        return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
    }
    
    /**
     * Test API connection
     */
    async function testConnection() {
        try {
            validateConfig();
            
            const url = `https://www.googleapis.com/drive/v3/files/${folderId}?` +
                `key=${apiKey}&` +
                `fields=id,name`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error.message);
            }
            
            const data = await response.json();
            console.log('✓ Kết nối Google Drive thành công:', data.name);
            return true;
            
        } catch (error) {
            console.error('✗ Lỗi kết nối Google Drive:', error.message);
            return false;
        }
    }
    
    // Public API
    return {
        init,
        fetchImages,
        testConnection,
        getThumbnailUrl,
        getFullImageUrl
    };
})();

