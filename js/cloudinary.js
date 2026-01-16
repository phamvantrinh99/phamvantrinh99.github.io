/**
 * Cloudinary Integration Module
 * Simple, fast, and NO CORS issues!
 */

const CloudinaryManager = (() => {
    let cloudName = '';
    let tagName = '';
    
    /**
     * Initialize Cloudinary Manager
     */
    function init(cloud, tag) {
        cloudName = cloud;
        tagName = tag;
    }
    
    /**
     * Validate configuration
     */
    function validateConfig() {
        if (!cloudName || cloudName === 'YOUR_CLOUD_NAME') {
            throw new Error('Vui lòng cấu hình Cloudinary Cloud Name trong file js/config.js');
        }
        if (!tagName || tagName === 'YOUR_TAG') {
            throw new Error('Vui lòng cấu hình Cloudinary Tag trong file js/config.js');
        }
    }
    
    /**
     * Fetch images from Cloudinary by tag - SIMPLE!
     * NO API KEY NEEDED!
     * @returns {Promise<Array>} Array of image objects
     */
    async function fetchImages() {
        validateConfig();
        
        try {
            console.log(`📡 Fetching images with tag: ${tagName}...`);
            
            // Simple client-side list - NO API KEY!
            const url = `https://res.cloudinary.com/${cloudName}/image/list/${tagName}.json`;
            
            const response = await fetch(url, { method: 'GET' });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Resource list bị restricted. Vào Settings → Security → Uncheck "Resource list"');
                }
                throw new Error(`Không thể tải ảnh. HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            console.log('Images Fetched:', data);
            
            if (!data.resources || data.resources.length === 0) {
                throw new Error(`Không tìm thấy ảnh với tag "${tagName}". Hãy tag ảnh trong Media Library.`);
            }
            
            // Supported image formats
            const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
            
            // Transform data
            const images = [];
            const skippedFiles = [];
            
            data.resources.forEach(resource => {
                const publicId = resource.public_id;
                const format = resource.format || 'jpg';
                const fileName = publicId.split('/').pop();
                
                // Check if format is supported
                if (supportedFormats.includes(format.toLowerCase())) {
                    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
                    
                    images.push({
                        id: publicId,
                        name: fileName,
                        mimeType: `image/${format}`,
                        // Thumbnail with auto optimization
                        thumbnailUrl: `${baseUrl}/w_${CONFIG.LOADING.thumbnailSize},q_auto:best,f_auto/${publicId}`,
                        // Full size with optimization
                        fullUrl: `${baseUrl}/w_2000,q_auto:best,f_auto/${publicId}`,
                        width: resource.width,
                        height: resource.height,
                        createdTime: resource.created_at
                    });
                } else {
                    skippedFiles.push({
                        name: fileName,
                        format: format,
                        reason: 'Unsupported format'
                    });
                }
            });
            
            console.log(`✓ Đã tải ${images.length} ảnh từ Cloudinary`);
            
            if (skippedFiles.length > 0) {
                console.warn(`⚠ Đã bỏ qua ${skippedFiles.length} file không hỗ trợ:`);
                skippedFiles.forEach(file => {
                    console.warn(`  - ${file.name} (${file.reason})`);
                });
            }
            
            if (images.length === 0) {
                throw new Error('Không có ảnh nào được hỗ trợ trong folder.');
            }
            
            return images;
            
        } catch (error) {
            console.error('❌ Lỗi khi tải ảnh:', error);
            throw error;
        }
    }
    
    /**
     * Get optimized thumbnail URL
     * @param {string} publicId - Cloudinary public ID
     * @param {number} width - Thumbnail width
     * @returns {string} Optimized image URL
     */
    function getThumbnailUrl(publicId, width = 800) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},q_auto,f_auto/${publicId}`;
    }
    
    /**
     * Get full image URL
     * @param {string} publicId - Cloudinary public ID
     * @returns {string} Full image URL
     */
    function getFullImageUrl(publicId) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/w_2000,q_auto,f_auto/${publicId}`;
    }
    
    /**
     * Test connection
     */
    async function testConnection() {
        try {
            validateConfig();
            
            const url = `https://res.cloudinary.com/${cloudName}/image/list/${tagName}.json`;
            const response = await fetch(url, { method: 'GET' });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✓ Kết nối Cloudinary thành công: ${data.resources.length} ảnh với tag "${tagName}"`);
            return true;
            
        } catch (error) {
            console.error('✗ Lỗi kết nối:', error.message);
            return false;
        }
    }
    
    /**
     * Get all images (alias for fetchImages for consistency)
     */
    async function getImages() {
        return await fetchImages();
    }
    
    /**
     * Upload image to Cloudinary
     * Note: This requires unsigned upload preset configured in Cloudinary
     */
    async function uploadImage(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CONFIG.CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', CONFIG.CLOUDINARY_FOLDER); // Upload to specific folder
            formData.append('tags', tagName); // Add to the same tag
            
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✓ Image uploaded:', data.public_id);
            return data;
            
        } catch (error) {
            console.error('❌ Upload error:', error);
            throw error;
        }
    }
    
    /**
     * Delete image from Cloudinary
     * Note: Client-side deletion requires Admin API which needs API secret
     * This is a placeholder - actual deletion should be done server-side
     */
    async function deleteImage(publicId) {
        // WARNING: This method cannot be implemented client-side securely
        // because it requires API secret which should never be exposed
        
        console.warn('⚠️ Client-side deletion is not secure!');
        console.warn('⚠️ Please implement server-side deletion endpoint.');
        console.warn('⚠️ For now, this is a placeholder that simulates deletion.');
        
        // Simulate deletion (for demo purposes)
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('✓ Simulated deletion of:', publicId);
                resolve({ result: 'ok' });
            }, 500);
        });
        
        // ACTUAL IMPLEMENTATION SHOULD BE:
        // Send request to YOUR server endpoint
        // Your server calls Cloudinary Admin API with API secret
        // Example:
        /*
        const response = await fetch('/api/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId })
        });
        return await response.json();
        */
    }
    
    // Public API
    return {
        init,
        fetchImages,
        getImages,
        uploadImage,
        deleteImage,
        testConnection,
        getThumbnailUrl,
        getFullImageUrl
    };
})();

