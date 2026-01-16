/**
 * Three.js 3D Gallery Module
 * Handles 3D scene, camera, rendering, and image display
 */

const Gallery3D = (() => {
    // Three.js core objects
    let scene, camera, renderer, controls;
    let container;
    
    // Gallery objects
    let imageMeshes = [];
    let images = [];
    let currentLayout = 'grid';
    
    // Animation
    let animationId;
    
    // Raycaster for mouse interaction
    let raycaster, mouse;
    
    /**
     * Initialize Three.js scene
     */
    function init(containerElement) {
        container = containerElement;
        
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(CONFIG.SCENE.backgroundColor);
        scene.fog = new THREE.Fog(CONFIG.SCENE.backgroundColor, 50, 200);
        
        // Create camera
        camera = new THREE.PerspectiveCamera(
            CONFIG.SCENE.cameraFov,
            window.innerWidth / window.innerHeight,
            CONFIG.SCENE.cameraNear,
            CONFIG.SCENE.cameraFar
        );
        camera.position.set(
            CONFIG.SCENE.cameraPosition.x,
            CONFIG.SCENE.cameraPosition.y,
            CONFIG.SCENE.cameraPosition.z
        );
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // Add orbit controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 20;
        controls.maxDistance = 200;
        controls.maxPolarAngle = Math.PI;
        controls.autoRotate = CONFIG.ANIMATION.autoRotate;
        controls.autoRotateSpeed = CONFIG.ANIMATION.autoRotateSpeed;
        
        // Add lights
        addLights();
        
        // Setup raycaster for mouse interaction
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
        
        // Event listeners
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('click', onMouseClick);
        window.addEventListener('mousemove', onMouseMove);
        
        console.log('✓ Three.js scene initialized');
    }
    
    /**
     * Add lights to scene
     */
    function addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);
        
        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0x667eea, 1, 100);
        pointLight1.position.set(20, 20, 20);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x764ba2, 1, 100);
        pointLight2.position.set(-20, -20, 20);
        scene.add(pointLight2);
    }
    
    /**
     * Load images and create meshes
     */
    async function loadImages(imageList) {
        images = imageList;
        imageMeshes = [];
        
        // Clear existing meshes
        scene.children.forEach(child => {
            if (child.userData.isImageMesh) {
                scene.remove(child);
            }
        });
        
        // Create placeholder meshes first
        for (let i = 0; i < images.length; i++) {
            const mesh = createPlaceholderMesh(i);
            imageMeshes.push(mesh);
            scene.add(mesh);
        }
        
        // Position meshes according to current layout
        positionMeshes(currentLayout);
        
        // Load textures asynchronously
        await loadTextures();
        
        console.log(`✓ Đã tạo ${imageMeshes.length} image meshes`);
    }
    
    /**
     * Create placeholder mesh
     */
    function createPlaceholderMesh(index) {
        const geometry = new THREE.PlaneGeometry(
            CONFIG.GALLERY.imageWidth,
            CONFIG.GALLERY.imageHeight
        );
        
        // Placeholder material (gradient)
        const material = new THREE.MeshStandardMaterial({
            color: 0x333333,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.userData = {
            isImageMesh: true,
            imageIndex: index,
            imageData: images[index],
            loaded: false
        };
        
        return mesh;
    }
    
    /**
     * Load textures for all images
     * Cloudinary URLs work directly - NO CORS!
     */
    async function loadTextures() {
        const loadPromises = [];
        
        for (let i = 0; i < imageMeshes.length; i++) {
            const promise = loadImageTexture(images[i].thumbnailUrl, i);
            loadPromises.push(promise);
            
            // Load in batches to avoid overwhelming the browser
            if ((i + 1) % CONFIG.LOADING.maxConcurrent === 0) {
                await Promise.all(loadPromises.splice(0, CONFIG.LOADING.maxConcurrent));
            }
        }
        
        // Wait for remaining images
        await Promise.all(loadPromises);
    }
    
    /**
     * Load single image texture from Cloudinary URL (no CORS!)
     */
    async function loadImageTexture(imageUrl, index) {
        return new Promise((resolve) => {
            try {
                // Load image directly from Cloudinary CDN - NO CORS!
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = () => {
                    // Create texture from image
                    const texture = new THREE.Texture(img);
                    texture.needsUpdate = true;
                    
                    // Apply to mesh
                    const mesh = imageMeshes[index];
                    mesh.material.map = texture;
                    mesh.material.color.setHex(0xffffff);
                    mesh.material.needsUpdate = true;
                    mesh.userData.loaded = true;
                    
                    // Update progress
                    const progress = ((index + 1) / imageMeshes.length) * 100;
                    updateLoadingProgress(progress);
                    
                    console.log(`✓ Loaded ${index + 1}/${imageMeshes.length}`);
                    resolve();
                };
                
                img.onerror = (error) => {
                    console.warn(`❌ Failed to load image ${index}:`, error);
                    resolve(); // Still resolve to continue
                };
                
                img.src = imageUrl;
                
            } catch (error) {
                console.warn(`❌ Error loading image ${index}:`, error);
                resolve(); // Still resolve to continue
            }
        });
    }
    
    /**
     * Position meshes according to layout
     */
    function positionMeshes(layout) {
        currentLayout = layout;
        
        switch (layout) {
            case 'grid':
                positionGrid();
                break;
            case 'circle':
                positionCircle();
                break;
            case 'spiral':
                positionSpiral();
                break;
        }
    }
    
    /**
     * Grid layout
     */
    function positionGrid() {
        const cols = CONFIG.GALLERY.gridColumns;
        const spacing = CONFIG.GALLERY.spacing;
        
        imageMeshes.forEach((mesh, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            const x = (col - cols / 2) * spacing;
            const y = -(row * spacing);
            const z = 0;
            
            animatePosition(mesh, x, y, z);
        });
    }
    
    /**
     * Circle layout
     */
    function positionCircle() {
        const radius = CONFIG.GALLERY.circleRadius;
        const count = imageMeshes.length;
        
        imageMeshes.forEach((mesh, i) => {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = 0;
            const z = Math.sin(angle) * radius;
            
            animatePosition(mesh, x, y, z);
            
            // Rotate to face center
            mesh.lookAt(0, 0, 0);
        });
    }
    
    /**
     * Spiral layout
     */
    function positionSpiral() {
        const spacing = CONFIG.GALLERY.spiralSpacing;
        const rotations = CONFIG.GALLERY.spiralRotations;
        
        imageMeshes.forEach((mesh, i) => {
            const t = i / imageMeshes.length;
            const angle = t * Math.PI * 2 * rotations;
            const radius = t * 50;
            
            const x = Math.cos(angle) * radius;
            const y = (i - imageMeshes.length / 2) * spacing;
            const z = Math.sin(angle) * radius;
            
            animatePosition(mesh, x, y, z);
        });
    }
    
    /**
     * Animate mesh position
     */
    function animatePosition(mesh, x, y, z) {
        // Simple animation using lerp
        const duration = CONFIG.ANIMATION.transitionDuration;
        const startPos = mesh.position.clone();
        const endPos = new THREE.Vector3(x, y, z);
        const startTime = Date.now();
        
        function animate() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out-cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            
            mesh.position.lerpVectors(startPos, endPos, eased);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        animate();
    }
    
    /**
     * Animation loop
     */
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        // Update controls
        controls.update();
        
        // Render scene
        renderer.render(scene, camera);
    }
    
    /**
     * Start animation loop
     */
    function start() {
        animate();
    }
    
    /**
     * Stop animation loop
     */
    function stop() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    }
    
    /**
     * Handle window resize
     */
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Handle mouse move (for hover effects)
     */
    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycast to find hovered mesh
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(imageMeshes);
        
        // Reset all meshes
        imageMeshes.forEach(mesh => {
            mesh.scale.set(1, 1, 1);
        });
        
        // Highlight hovered mesh
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            mesh.scale.set(1.1, 1.1, 1.1);
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'default';
        }
    }
    
    /**
     * Handle mouse click
     */
    function onMouseClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(imageMeshes);
        
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            const imageData = mesh.userData.imageData;
            const imageIndex = mesh.userData.imageIndex;
            
            // Trigger event for modal
            window.dispatchEvent(new CustomEvent('imageClicked', {
                detail: { imageData, imageIndex }
            }));
        }
    }
    
    /**
     * Update loading progress
     */
    function updateLoadingProgress(progress) {
        window.dispatchEvent(new CustomEvent('loadingProgress', {
            detail: { progress }
        }));
    }
    
    /**
     * Change layout
     */
    function changeLayout(layout) {
        positionMeshes(layout);
    }
    
    /**
     * Get current images
     */
    function getImages() {
        return images;
    }
    
    // Public API
    return {
        init,
        loadImages,
        start,
        stop,
        changeLayout,
        getImages
    };
})();

