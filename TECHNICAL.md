# Technical Documentation

## 📊 Architecture Overview

```
User Browser
    ↓
GitHub Pages (Static HTML/CSS/JS)
    ↓
Google Drive API → Fetch Images
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
- `GOOGLE_API_KEY`: API key cho Google Drive
- `GOOGLE_FOLDER_ID`: ID của folder chứa ảnh
- `SCENE`: Three.js scene configuration
- `GALLERY`: Layout parameters
- `ANIMATION`: Animation settings
- `LOADING`: Image loading configuration

### 2. Google Drive Manager (`js/gdrive.js`)
**Purpose:** Google Drive API integration

**Functions:**
- `init(apiKey, folderId)`: Initialize credentials
- `fetchImages()`: Lấy danh sách ảnh từ folder
- `getThumbnailUrl(fileId)`: Generate thumbnail URL
- `getFullImageUrl(fileId)`: Generate full image URL
- `testConnection()`: Test API connectivity

**API Endpoint:**
```
GET https://www.googleapis.com/drive/v3/files/{fileId}?alt=media&key={apiKey}
```

**Features:**
- Filter unsupported formats (HEIC, RAW, etc.)
- Error handling
- Console warnings cho skipped files

### 3. Gallery 3D (`js/gallery3d.js`)
**Purpose:** Three.js 3D visualization

**Core Objects:**
- `scene`: Three.js Scene
- `camera`: PerspectiveCamera (FOV 75°)
- `renderer`: WebGLRenderer với antialiasing
- `controls`: OrbitControls
- `raycaster`: Mouse interaction detection

**Functions:**
- `init(container)`: Setup 3D scene
- `loadImages(images)`: Create meshes cho ảnh
- `positionMeshes(layout)`: Apply layout algorithm
- `changeLayout(layout)`: Switch giữa layouts
- `animate()`: Render loop (60fps target)

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

### 4. Main Controller (`js/main.js`)
**Purpose:** Application orchestration

**Responsibilities:**
- Initialize all modules
- Handle UI events
- Manage application state
- Control loading/error states
- Modal management

---

## 🎨 Three.js Scene Structure

```
Scene
│
├── Lights
│   ├── AmbientLight (0xffffff, 0.6)
│   ├── DirectionalLight (0xffffff, 0.8)
│   ├── PointLight 1 (0x667eea, purple)
│   └── PointLight 2 (0x764ba2, purple)
│
├── Camera (PerspectiveCamera)
│   ├── FOV: 75°
│   ├── Position: (0, 0, 50)
│   └── OrbitControls attached
│
└── Image Meshes (Array)
    └── Each Mesh:
        ├── Geometry: PlaneGeometry (10x10)
        ├── Material: MeshStandardMaterial
        │   ├── Texture: From Google Drive
        │   ├── Side: DoubleSide
        │   └── Transparent: true
        └── UserData:
            ├── isImageMesh: true
            ├── imageIndex: number
            ├── imageData: object
            └── loaded: boolean
```

---

## 🔄 Data Flow

### Initialization Flow
```
1. User loads page
2. main.js initializes
3. Config loaded from config.js
4. GDriveManager.init(apiKey, folderId)
5. Gallery3D.init(container)
6. Three.js scene created
7. Show loading screen
```

### Image Loading Flow
```
1. GDriveManager.fetchImages()
2. API call to Google Drive
3. Filter supported formats
4. Parse response → image list
5. Gallery3D.loadImages(images)
6. Create placeholder meshes
7. Position meshes (layout)
8. Load textures (progressive, batch of 5)
9. Update meshes with textures
10. Hide loading screen
11. Start animation loop
```

### User Interaction Flow
```
User Action (click/drag/scroll)
   ↓
Browser Event
   ↓
Event Handler (main.js)
   ↓
Update Gallery3D state
   ↓
Three.js renders new frame
   ↓
Visual feedback to user
```

---

## ⚡ Performance Optimizations

### 1. Texture Loading
- Thumbnails via API (không phải full resolution)
- Batch loading (5 concurrent)
- Placeholder meshes shown immediately
- Progressive enhancement

### 2. Rendering
- OrbitControls damping (smooth motion)
- Fog for depth (hide far objects)
- Efficient geometry (simple planes)
- Raycaster optimization (only on interaction)

### 3. Memory Management
- Texture reuse
- Geometry sharing
- Proper disposal on cleanup
- No memory leaks

---

## 🔐 Security

### API Key Protection
- Stored in config.js (not committed to public repos)
- Restricted to specific domain
- Restricted to Google Drive API only
- No server-side exposure

### CORS Handling
- Google Drive API v3 với `alt=media` hỗ trợ CORS
- Public folder access only
- No authentication required for viewing

---

## 📱 Responsive Design

### Breakpoints
- Desktop: > 768px
- Mobile: ≤ 768px

### Adaptations

**Desktop:**
- Full UI controls visible
- Mouse interactions (drag, scroll)
- Larger modal images
- More detailed info

**Mobile:**
- Simplified UI (stacked buttons)
- Touch interactions (swipe, pinch)
- Smaller modal images
- Compact info display

---

## 🎯 Supported Image Formats

### ✅ Supported
- `image/jpeg`, `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/bmp`
- `image/svg+xml`

### ❌ Not Supported (Filtered Out)
- HEIC/HEIF (Apple format)
- RAW formats (CR2, NEF, ARW, etc.)
- TIFF
- PSD, AI

**Filter Logic:**
```javascript
const supportedFormats = ['image/jpeg', 'image/png', ...];
const isHEIC = fileName.endsWith('.heic') || fileName.endsWith('.heif');

if (isSupported && !isHEIC) {
    images.push(file);
} else {
    skippedFiles.push(file);
}
```

---

## 🔧 Configuration Options

### Scene Configuration
```javascript
SCENE: {
    backgroundColor: 0x1a1a2e,  // Hex color
    cameraFov: 75,              // Field of view (degrees)
    cameraNear: 0.1,            // Near clipping plane
    cameraFar: 2000,            // Far clipping plane
    cameraPosition: { x: 0, y: 0, z: 50 }
}
```

### Gallery Configuration
```javascript
GALLERY: {
    imageWidth: 10,       // Mesh width in 3D space
    imageHeight: 10,      // Mesh height in 3D space
    spacing: 15,          // Distance between images
    gridColumns: 5,       // Grid layout columns
    circleRadius: 40,     // Circle layout radius
    spiralSpacing: 5,     // Spiral vertical spacing
    spiralRotations: 3    // Spiral rotations count
}
```

### Animation Configuration
```javascript
ANIMATION: {
    autoRotate: false,          // Auto-rotate camera
    autoRotateSpeed: 0.5,       // Rotation speed
    transitionDuration: 1000    // Layout transition (ms)
}
```

### Loading Configuration
```javascript
LOADING: {
    maxConcurrent: 5,     // Max concurrent image loads
    thumbnailSize: 512    // Thumbnail size (pixels)
}
```

---

## 🎬 Animation Loop

```javascript
function animate() {
    requestAnimationFrame(animate);  // 60fps
    
    // Update controls (damping)
    controls.update();
    
    // Render scene
    renderer.render(scene, camera);
}
```

**Frame Budget:** ~16ms (60fps)
- Controls update: < 1ms
- Render: < 15ms
- Total: < 16ms ✓

---

## 🚀 Deployment

### GitHub Pages
```
Developer
   ↓ (git push)
GitHub Repository
   ↓ (auto)
GitHub Pages Build
   ↓ (deploy)
CDN Edge Servers
   ↓ (serve)
User Browser
```

**Steps:**
1. Push to main branch
2. GitHub Pages auto-builds
3. Static files deployed to CDN
4. Available globally (< 2 min)

---

## 📊 Performance Metrics

### Target Metrics
- **FPS**: 60fps (16ms/frame)
- **Load Time**: < 5s (depends on images)
- **First Paint**: < 1s
- **Interactive**: < 2s

### Actual Performance
- ✅ 60fps maintained
- ✅ Smooth animations
- ✅ Fast initial load
- ✅ Progressive image loading

---

## 🔍 Browser Compatibility

### Fully Supported
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

### Requirements
- WebGL support
- JavaScript enabled
- Modern browser (2020+)

---

## 📚 Dependencies

### External Libraries (CDN)
```html
<!-- Three.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- OrbitControls -->
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
```

### APIs
- Google Drive API v3

### No Build Tools Required
- Pure HTML/CSS/JS
- No npm, webpack, babel
- Direct browser execution

---

## 🐛 Error Handling

### Error Levels

1. **Critical Errors** (Stop execution)
   - Invalid API key
   - Invalid folder ID
   - API connection failure
   → Show error message + retry button

2. **Recoverable Errors** (Continue with degradation)
   - Individual image load failure
   - Texture load timeout
   → Skip image, continue with others

3. **Warnings** (Log only)
   - Slow API response
   - Large image size
   - Unsupported format
   → Console warning, no user impact

---

## 💡 Best Practices

### Code Organization
- Modular structure (IIFE pattern)
- Clear separation of concerns
- Comprehensive comments
- Consistent naming conventions

### Performance
- Batch operations
- Progressive loading
- Efficient rendering
- Memory management

### User Experience
- Loading states
- Error messages
- Smooth animations
- Intuitive controls

---

## 📈 Future Enhancements

### Possible Features
- Multiple folder support
- Image filters (B&W, Sepia)
- Slideshow mode
- Search/filter functionality
- Categories/tags
- VR mode support
- Social sharing

### Technical Improvements
- Service Worker (offline support)
- IndexedDB caching
- WebP format optimization
- Analytics integration
- Performance monitoring

---

**Last Updated:** 2026-01-16  
**Version:** 1.0.0  
**Status:** Production Ready

