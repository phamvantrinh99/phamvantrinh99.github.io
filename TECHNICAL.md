# Technical Documentation

## 📊 Architecture Overview

```
User Browser
    ↓
GitHub Pages (Static HTML/CSS/JS)
    ↓
Cloudinary CDN → Fetch Images (NO CORS!)
    ↓
Three.js Renderer → 3D Gallery
    ↓
OrbitControls → User Interactions
```

---

## 🏗️ System Components

### 1. Config Module (`js/config.js`)
**Purpose:** Centralized configuration

**Key Settings:**
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_FOLDER_NAME`: Folder name chứa ảnh
- `SCENE`: Three.js scene configuration
- `GALLERY`: Layout parameters
- `ANIMATION`: Animation settings
- `LOADING`: Image loading configuration

**Example:**
```javascript
const CONFIG = {
    CLOUDINARY_CLOUD_NAME: 'my-cloud',
    CLOUDINARY_FOLDER_NAME: 'gallery',
    SCENE: {
        backgroundColor: 0x1a1a2e,
        cameraFov: 75,
        // ...
    }
};
```

### 2. Cloudinary Manager (`js/cloudinary.js`)
**Purpose:** Cloudinary CDN integration

**Functions:**
- `init(cloudName, folderName)`: Initialize configuration
- `fetchImages()`: Lấy danh sách ảnh từ folder
- `getThumbnailUrl(publicId, width)`: Generate optimized thumbnail URL
- `getFullImageUrl(publicId)`: Generate full image URL
- `testConnection()`: Test connection

**API Endpoint:**
```
GET https://res.cloudinary.com/{cloud_name}/image/list/{folder_name}.json
```

**Response Format:**
```json
{
  "resources": [
    {
      "public_id": "folder/image1",
      "format": "jpg",
      "width": 1920,
      "height": 1080,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Features:**
- ✅ No API key needed
- ✅ No CORS issues
- ✅ Auto optimization (q_auto, f_auto)
- ✅ Filter unsupported formats
- ✅ Error handling

**Image URL Format:**
```
https://res.cloudinary.com/{cloud}/image/upload/w_{width},q_auto,f_auto/{public_id}.{format}
```

**Transformations:**
- `w_800` - Width 800px
- `q_auto` - Auto quality
- `f_auto` - Auto format (WebP cho Chrome, JPEG cho Safari)

### 3. Gallery 3D (`js/gallery3d.js`)
**Purpose:** Three.js 3D visualization

**Core Objects:**
- `scene`: Three.js Scene
- `camera`: PerspectiveCamera (FOV 75°)
- `renderer`: WebGLRenderer với antialiasing
- `controls`: OrbitControls
- `raycaster`: Mouse interaction detection
- `particles`: Particle system cho effects
- `lights`: Animated lights

**Functions:**
- `init(container)`: Setup 3D scene
- `loadImages(images)`: Create meshes cho ảnh
- `loadTextures()`: Load image textures từ Cloudinary
- `positionMeshes(layout)`: Apply layout algorithm
- `changeLayout(layout)`: Switch giữa layouts
- `animate()`: Render loop (60fps target)

**Image Loading:**
```javascript
// Load directly from Cloudinary CDN - NO CORS!
const img = new Image();
img.crossOrigin = 'anonymous';
img.src = cloudinaryUrl; // https://res.cloudinary.com/...

img.onload = () => {
    const texture = new THREE.Texture(img);
    texture.needsUpdate = true;
    mesh.material.map = texture;
};
```

**Layouts:**

1. **Grid Layout**
```javascript
x = (col - cols/2) * spacing
y = -(row * spacing)
z = 0
```

2. **Circle Layout**
```javascript
angle = (i / count) * 2π
x = cos(angle) * radius
y = 0
z = sin(angle) * radius
```

3. **Spiral Layout**
```javascript
t = i / count
angle = t * 2π * rotations
radius = t * 50
x = cos(angle) * radius
y = (i - count/2) * spacing
z = sin(angle) * radius
```

**Visual Effects:**
- Particle system (floating particles)
- Animated lights (color changing)
- Image glow on hover
- Smooth transitions

### 4. Main Controller (`js/main.js`)
**Purpose:** Application orchestration

**Responsibilities:**
- Initialize all modules
- Coordinate data flow
- Handle UI events
- Manage application state
- Error handling

**Initialization Flow:**
```
1. Get DOM elements
2. Setup event listeners
3. Initialize CloudinaryManager
4. Initialize Gallery3D
5. Test connection
6. Fetch images
7. Load images into 3D scene
8. Start animation loop
```

**Event Handling:**
- Layout button clicks
- Modal open/close
- Keyboard navigation
- Image click events
- Toggle panel

---

## 🔄 Data Flow

### Image Loading Process

```
1. User loads page
   ↓
2. CloudinaryManager.init()
   ↓
3. CloudinaryManager.fetchImages()
   → GET https://res.cloudinary.com/{cloud}/image/list/{folder}.json
   ↓
4. Parse JSON response
   → Filter supported formats
   → Generate optimized URLs
   ↓
5. Gallery3D.loadImages()
   → Create placeholder meshes
   → Position in layout
   ↓
6. Gallery3D.loadTextures()
   → Load images from Cloudinary CDN (parallel)
   → Create THREE.Texture
   → Apply to meshes
   ↓
7. Gallery3D.start()
   → Start animation loop
   → Enable interactions
```

### User Interaction Flow

```
User clicks image
   ↓
Raycaster detects intersection
   ↓
Dispatch 'imageClicked' event
   ↓
Main.js shows modal
   → Load full resolution image
   → Display metadata
```

---

## 🎨 Styling & UI

### CSS Architecture

**Files:**
- `css/style.css`: Main stylesheet

**Key Components:**
1. **Loading Screen**
   - Animated spinner
   - Progress bar
   - Fade out transition

2. **Control Panel**
   - Transparent background (rgba)
   - Bottom-right positioning
   - Toggle button
   - Hover effects

3. **Modal**
   - Full-screen overlay
   - Image centering
   - Navigation buttons
   - Keyboard support

4. **Animations**
   - Background gradient animation
   - Button hover effects
   - Fade in/out transitions
   - Particle movements

### Responsive Design

**Breakpoints:**
- Desktop: > 768px
- Mobile: ≤ 768px

**Mobile Optimizations:**
- Touch-friendly controls
- Adjusted camera distance
- Simplified particle effects
- Smaller UI elements

---

## ⚡ Performance Optimizations

### Image Loading

1. **Parallel Loading**
   - `maxConcurrent: 5` images at a time
   - Batch processing to avoid overwhelming browser

2. **Cloudinary Optimizations**
   - Auto quality (`q_auto`)
   - Auto format (`f_auto`)
   - Responsive sizing (`w_800` for thumbnails)
   - CDN caching

3. **Progressive Loading**
   - Load thumbnails first (800px)
   - Full resolution on modal open (2000px)

### Three.js Optimizations

1. **Geometry Reuse**
   - Single PlaneGeometry for all images
   - Shared material properties

2. **Render Optimization**
   - Only render when needed
   - RequestAnimationFrame for smooth 60fps

3. **Memory Management**
   - Dispose old textures
   - Clean up on layout change

### Browser Compatibility

**Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- WebGL
- ES6 (const, let, arrow functions)
- Fetch API
- Promises/Async-Await

---

## 🔒 Security

### No API Keys Required

Cloudinary public images không cần authentication:
- ✅ Cloud name là public information
- ✅ Folder list endpoint là public
- ✅ Image URLs là public
- ❌ Không expose sensitive data

### CORS Policy

Cloudinary CDN headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

→ No CORS issues!

### Content Security Policy

Recommended CSP headers:
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;
img-src 'self' https://res.cloudinary.com;
style-src 'self' 'unsafe-inline';
```

---

## 🐛 Error Handling

### CloudinaryManager Errors

1. **Invalid Configuration**
```javascript
if (!cloudName || cloudName === 'YOUR_CLOUD_NAME') {
    throw new Error('Vui lòng cấu hình Cloud Name');
}
```

2. **Network Errors**
```javascript
if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
}
```

3. **Empty Folder**
```javascript
if (images.length === 0) {
    throw new Error('Không có ảnh nào trong folder');
}
```

### Gallery3D Errors

1. **WebGL Not Supported**
```javascript
if (!renderer.capabilities.isWebGL2) {
    console.warn('WebGL 2.0 not supported');
}
```

2. **Image Load Failure**
```javascript
img.onerror = () => {
    console.warn(`Failed to load image ${index}`);
    resolve(); // Continue with other images
};
```

### User-Friendly Messages

All errors show in UI:
```javascript
showError(error.message);
// Displays error message with retry button
```

---

## 📊 Monitoring & Debugging

### Console Logging

**Levels:**
- `console.log()`: Success messages (✓)
- `console.warn()`: Warnings (⚠)
- `console.error()`: Errors (✗)

**Example Output:**
```
🚀 Khởi động ứng dụng...
✓ Kết nối Cloudinary thành công: 7 ảnh
✓ Đã tải 7 ảnh từ Cloudinary
✓ Loaded 1/7
✓ Loaded 2/7
...
✓ Ứng dụng đã sẵn sàng!
```

### Performance Metrics

Monitor in DevTools:
- FPS (target: 60fps)
- Memory usage
- Network requests
- Image load times

---

## 🚀 Deployment

### GitHub Pages Setup

1. **Repository Settings**
   - Settings → Pages
   - Source: main branch
   - Folder: / (root)

2. **Custom Domain** (Optional)
   - Add CNAME file
   - Configure DNS

3. **HTTPS**
   - Automatically enabled by GitHub

### Build Process

No build step required! Pure static files:
- HTML
- CSS
- JavaScript (ES6)

### Cache Strategy

**GitHub Pages:**
- Static files cached by CDN
- `Cache-Control: max-age=600`

**Cloudinary:**
- Images cached globally
- CDN edge locations
- Automatic cache invalidation

---

## 📈 Scalability

### Image Limits

**Cloudinary Free Tier:**
- 25GB storage
- 25GB bandwidth/month
- Unlimited transformations

**Practical Limits:**
- ~5000 images (5MB average)
- ~5000 visitors/month (5MB per visit)

### Performance at Scale

**100 images:**
- Load time: ~5-10 seconds
- Memory: ~200MB
- FPS: 60fps stable

**500 images:**
- Load time: ~20-30 seconds
- Memory: ~800MB
- FPS: 50-60fps

**Recommendations:**
- Use pagination for >200 images
- Implement lazy loading
- Consider multiple folders

---

## 🔧 Maintenance

### Adding New Images

1. Upload to Cloudinary folder
2. Reload page
3. Auto-detected!

### Updating Configuration

Edit `js/config.js`:
- Change folder name
- Adjust layout parameters
- Modify loading settings

### Monitoring

Check Cloudinary Dashboard:
- Bandwidth usage
- Storage usage
- Transformation credits

---

## 📚 Dependencies

### External Libraries

1. **Three.js r128**
   - Source: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
   - Size: ~600KB
   - License: MIT

2. **OrbitControls**
   - Source: https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js
   - Size: ~20KB
   - License: MIT

### No Build Tools Required

- ❌ No npm/yarn
- ❌ No webpack/vite
- ❌ No transpilation
- ✅ Pure ES6 modules

---

## 🎓 Learning Resources

### Three.js
- Official Docs: https://threejs.org/docs/
- Examples: https://threejs.org/examples/

### Cloudinary
- Documentation: https://cloudinary.com/documentation
- Transformations: https://cloudinary.com/documentation/image_transformations

### WebGL
- MDN WebGL: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API

---

**Last Updated:** 2026-01-16  
**Version:** 2.0.0 (Cloudinary)
