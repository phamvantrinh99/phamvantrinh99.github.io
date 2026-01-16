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
    let galleryGroup; // Group to hold all images for gallery rotation
    
    // Animation
    let animationId;
    let clock = new THREE.Clock();
    
    // Raycaster for mouse interaction
    let raycaster, mouse;
    
    // Effects
    let particles, particleSystem;
    let hoveredMesh = null;
    
    // Control parameters
    let controlParams = {
        particleCount: 1000,
        particleSpeed: 1.0,
        glowIntensity: 1.5,
        autoRotateImages: false,
        rotationSpeed: 1.0,
        autoRotateGallery: false,
        galleryRotationSpeed: 0.5
    };
    
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
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
        
        // Add particle system
        addParticles();
        
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
     * Add enhanced particle system
     */
    function addParticles() {
        const particleCount = controlParams.particleCount;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Random positions in a sphere
            const radius = 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Random colors (blue/purple/white)
            const colorChoice = Math.random();
            if (colorChoice < 0.33) {
                colors[i * 3] = 0.3 + Math.random() * 0.3;     // R
                colors[i * 3 + 1] = 0.5 + Math.random() * 0.5; // G
                colors[i * 3 + 2] = 1.0;                        // B
            } else if (colorChoice < 0.66) {
                colors[i * 3] = 0.8 + Math.random() * 0.2;     // R
                colors[i * 3 + 1] = 0.3 + Math.random() * 0.3; // G
                colors[i * 3 + 2] = 1.0;                        // B
            } else {
                colors[i * 3] = 1.0;                            // R
                colors[i * 3 + 1] = 1.0;                        // G
                colors[i * 3 + 2] = 1.0;                        // B
            }
            
            // Random sizes - to nhỏ khác nhau
            sizes[i] = Math.random() * 4 + 1; // Size từ 1 đến 5
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create circular particle texture
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Draw circular gradient
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        const particlesMaterial = new THREE.PointsMaterial({
            size: 2,
            map: texture,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });
        
        particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particleSystem);
    }
    
    /**
     * Add lights to scene
     */
    function addLights() {
        // Ambient light (reduced for better image visibility)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Directional light with shadows (reduced)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

    }
    
    /**
     * Load images and create meshes
     */
    async function loadImages(imageList) {
        images = imageList;
        imageMeshes = [];
        
        // Clear existing gallery group
        if (galleryGroup) {
            scene.remove(galleryGroup);
        }
        
        // Create new gallery group for rotation
        galleryGroup = new THREE.Group();
        scene.add(galleryGroup);
        
        // Create placeholder meshes first
        for (let i = 0; i < images.length; i++) {
            const mesh = createPlaceholderMesh(i);
            imageMeshes.push(mesh);
            galleryGroup.add(mesh); // Add to group instead of scene
        }
        
        // Position meshes according to current layout
        positionMeshes(currentLayout);
        
        // Load textures asynchronously
        await loadTextures();
        
        console.log(`✓ Đã tạo ${imageMeshes.length} image meshes`);
    }
    
    /**
     * Create 3D frame mesh with depth
     */
    function createPlaceholderMesh(index) {
        // Create group for image + frame
        const group = new THREE.Group();
        
        // Main image plane
        const geometry = new THREE.PlaneGeometry(
            CONFIG.GALLERY.imageWidth,
            CONFIG.GALLERY.imageHeight
        );
        
        // Enhanced material (will be replaced by texture)
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: false,
            metalness: 0,
            roughness: 1
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        
        // Add frame depth
        const frameDepth = 0.3;
        const frameThickness = 0.2;
        
        // Back panel
        const backGeometry = new THREE.PlaneGeometry(
            CONFIG.GALLERY.imageWidth + frameThickness,
            CONFIG.GALLERY.imageHeight + frameThickness
        );
        const backMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.5,
            roughness: 0.5
        });
        const backMesh = new THREE.Mesh(backGeometry, backMaterial);
        backMesh.position.z = -frameDepth;
        backMesh.castShadow = true;
        group.add(backMesh);
        
        // Frame edges
        const edgeMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.6,
            roughness: 0.3
        });
        
        // Top edge
        const topEdge = new THREE.BoxGeometry(
            CONFIG.GALLERY.imageWidth + frameThickness,
            frameThickness,
            frameDepth
        );
        const topMesh = new THREE.Mesh(topEdge, edgeMaterial);
        topMesh.position.y = CONFIG.GALLERY.imageHeight / 2 + frameThickness / 2;
        topMesh.position.z = -frameDepth / 2;
        topMesh.castShadow = true;
        group.add(topMesh);
        
        // Bottom edge
        const bottomMesh = new THREE.Mesh(topEdge, edgeMaterial);
        bottomMesh.position.y = -CONFIG.GALLERY.imageHeight / 2 - frameThickness / 2;
        bottomMesh.position.z = -frameDepth / 2;
        bottomMesh.castShadow = true;
        group.add(bottomMesh);
        
        // Left edge
        const sideEdge = new THREE.BoxGeometry(
            frameThickness,
            CONFIG.GALLERY.imageHeight,
            frameDepth
        );
        const leftMesh = new THREE.Mesh(sideEdge, edgeMaterial);
        leftMesh.position.x = -CONFIG.GALLERY.imageWidth / 2 - frameThickness / 2;
        leftMesh.position.z = -frameDepth / 2;
        leftMesh.castShadow = true;
        group.add(leftMesh);
        
        // Right edge
        const rightMesh = new THREE.Mesh(sideEdge, edgeMaterial);
        rightMesh.position.x = CONFIG.GALLERY.imageWidth / 2 + frameThickness / 2;
        rightMesh.position.z = -frameDepth / 2;
        rightMesh.castShadow = true;
        group.add(rightMesh);
        
        group.userData = {
            isImageMesh: true,
            imageIndex: index,
            imageData: images[index],
            loaded: false,
            mainMesh: mesh,
            originalScale: { x: 1, y: 1, z: 1 },
            floatOffset: Math.random() * Math.PI * 2
        };
        
        return group;
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
                    
                    // Apply to mesh (group structure)
                    const group = imageMeshes[index];
                    if (!group || !group.userData.mainMesh) {
                        console.error(`❌ Group or mainMesh not found for index ${index}`);
                        resolve();
                        return;
                    }
                    
                    const mainMesh = group.userData.mainMesh;
                    
                    // Create new material with texture
                    mainMesh.material = new THREE.MeshStandardMaterial({
                        map: texture,
                        side: THREE.DoubleSide,
                        metalness: 0,
                        roughness: 1,
                        emissive: 0x111111,
                        emissiveIntensity: 0.05,
                        emissiveMap: texture
                    });
                    
                    group.userData.loaded = true;
                    
                    // Update progress
                    const progress = ((index + 1) / imageMeshes.length) * 100;
                    updateLoadingProgress(progress);
                    
                    console.log(`✓ Loaded ${index + 1}/${imageMeshes.length}`, texture);
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
     * Position meshes according to layout with smooth transitions
     */
    function positionMeshes(layout) {
        currentLayout = layout;
        
        // Smooth camera transition
        const targetCameraPos = layout === 'grid' ? 
            { x: 0, y: 0, z: 50 } : 
            layout === 'circle' ? 
            { x: 0, y: 20, z: 60 } : 
            { x: 0, y: 30, z: 70 };
        
        animateCameraTo(targetCameraPos, 1000);
        
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
            case 'wave':
                positionWave();
                break;
            case 'helix':
                positionHelix();
                break;
            case 'sphere':
                positionSphere();
                break;
            case 'wall':
                positionWall();
                break;
        }
    }
    
    /**
     * Animate camera to target position
     */
    function animateCameraTo(target, duration) {
        const start = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        };
        const startTime = Date.now();
        
        function updateCamera() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeInOutCubic)
            const eased = progress < 0.5 ?
                4 * progress * progress * progress :
                1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            camera.position.x = start.x + (target.x - start.x) * eased;
            camera.position.y = start.y + (target.y - start.y) * eased;
            camera.position.z = start.z + (target.z - start.z) * eased;
            
            if (progress < 1) {
                requestAnimationFrame(updateCamera);
            }
        }
        
        updateCamera();
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
            const z = i * 0.01; // Small z offset to prevent z-fighting
            
            animatePosition(mesh, x, y, z);
            
            // Reset rotation for grid
            mesh.rotation.x = 0;
            mesh.rotation.y = 0;
            mesh.rotation.z = 0;
            
            // Disable floating animation for grid
            mesh.userData.disableFloat = true;
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
            
            // Rotate to face center but keep upright
            mesh.rotation.y = -angle;
            mesh.rotation.x = 0;
            mesh.rotation.z = 0;
            
            // Disable floating animation for circle (keep all at same height)
            mesh.userData.disableFloat = true;
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
            
            // Rotate to face center but keep upright
            mesh.rotation.y = -angle;
            mesh.rotation.x = 0;
            mesh.rotation.z = 0;
            
            // Enable floating animation for spiral
            mesh.userData.disableFloat = false;
        });
    }
    
    /**
     * Wave layout - Images arranged in a sine wave pattern
     */
    function positionWave() {
        const cols = 8;
        const spacing = 15;
        const waveHeight = 10;
        const waveFrequency = 0.5;
        
        imageMeshes.forEach((mesh, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            const x = (col - cols / 2) * spacing;
            const z = row * spacing;
            const y = Math.sin((col + row) * waveFrequency) * waveHeight;
            
            animatePosition(mesh, x, y, z);
            
            // Keep upright
            mesh.rotation.x = 0;
            mesh.rotation.y = 0;
            mesh.rotation.z = 0;
            
            // Enable floating for wave effect
            mesh.userData.disableFloat = false;
        });
    }
    
    /**
     * Helix layout - DNA double helix structure
     */
    function positionHelix() {
        const radius = 20;
        const height = 8;
        const rotations = 4;
        
        imageMeshes.forEach((mesh, i) => {
            const t = i / imageMeshes.length;
            const angle = t * Math.PI * 2 * rotations;
            
            // Create double helix by alternating sides
            const side = i % 2 === 0 ? 1 : -1;
            const x = Math.cos(angle) * radius * side;
            const y = (i - imageMeshes.length / 2) * height;
            const z = Math.sin(angle) * radius * side;
            
            animatePosition(mesh, x, y, z);
            
            // Rotate to face outward
            mesh.rotation.y = -angle + (side === 1 ? 0 : Math.PI);
            mesh.rotation.x = 0;
            mesh.rotation.z = 0;
            
            // Enable floating
            mesh.userData.disableFloat = false;
        });
    }
    
    /**
     * Sphere layout - Images arranged on a sphere surface
     */
    function positionSphere() {
        const radius = 40;
        const count = imageMeshes.length;
        
        imageMeshes.forEach((mesh, i) => {
            // Fibonacci sphere distribution for even spacing
            const phi = Math.acos(1 - 2 * (i + 0.5) / count);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            animatePosition(mesh, x, y, z);
            
            // Rotate to face outward from center
            mesh.lookAt(0, 0, 0);
            mesh.rotation.y += Math.PI;
            
            // Disable floating for sphere
            mesh.userData.disableFloat = true;
        });
    }
    
    /**
     * Wall layout - Images on a curved wall
     */
    function positionWall() {
        const cols = 6;
        const rows = Math.ceil(imageMeshes.length / cols);
        const spacing = 15;
        const curveRadius = 50;
        
        imageMeshes.forEach((mesh, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            
            // Calculate angle for curved wall
            const angle = ((col - cols / 2) / cols) * Math.PI * 0.8;
            
            const x = Math.sin(angle) * curveRadius;
            const y = (row - rows / 2) * spacing;
            const z = Math.cos(angle) * curveRadius - curveRadius;
            
            animatePosition(mesh, x, y, z);
            
            // Rotate to face center
            mesh.rotation.y = -angle;
            mesh.rotation.x = 0;
            mesh.rotation.z = 0;
            
            // Disable floating for wall
            mesh.userData.disableFloat = true;
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
     * Animation loop with enhanced effects
     */
    function animate() {
        animationId = requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        
        // Animate particles
        if (particleSystem) {
            const speed = controlParams.particleSpeed;
            particleSystem.rotation.y = elapsedTime * 0.05 * speed;
            particleSystem.rotation.x = Math.sin(elapsedTime * 0.1 * speed) * 0.1;
            
            // Pulse particles
            const positions = particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const pulse = Math.sin(elapsedTime * 2 * speed + i) * 0.5;
                positions[i + 1] += pulse * 0.01 * speed;
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Rotate entire gallery (all images together)
        if (controlParams.autoRotateGallery && galleryGroup) {
            galleryGroup.rotation.y = elapsedTime * 0.2 * controlParams.galleryRotationSpeed;
        }
        
        // Animate image groups
        imageMeshes.forEach((group, index) => {
            if (group.userData.loaded) {
                // Floating animation (only if not disabled)
                if (!group.userData.disableFloat) {
                    const floatOffset = group.userData.floatOffset;
                    const baseY = group.userData.baseY || group.position.y;
                    group.position.y = baseY + Math.sin(elapsedTime * 0.5 + floatOffset) * 0.3;
                    
                    // Store base position
                    if (!group.userData.baseY) {
                        group.userData.baseY = group.position.y;
                    }
                }
                
                // Auto-rotate images (spin on Y axis)
                if (controlParams.autoRotateImages) {
                    const rotationOffset = group.userData.floatOffset || 0;
                    const baseRotationY = group.userData.baseRotationY || 0;
                    
                    // Store base rotation on first frame
                    if (group.userData.baseRotationY === undefined) {
                        group.userData.baseRotationY = group.rotation.y;
                    }
                    
                    // Smooth rotation
                    group.rotation.y = baseRotationY + (elapsedTime * 0.3 * controlParams.rotationSpeed);
                }
                
                // Enhanced hover effect
                if (group === hoveredMesh) {
                    // Larger scale for more obvious effect
                    const targetScale = 1.3;
                    group.scale.x += (targetScale - group.scale.x) * 0.2;
                    group.scale.y += (targetScale - group.scale.y) * 0.2;
                    group.scale.z += (targetScale - group.scale.z) * 0.2;
                    
                    // Stronger tilt effect
                    group.rotation.y += (0.15 - group.rotation.y) * 0.15;
                    
                    // Add glow to main mesh
                    const mainMesh = group.userData.mainMesh;
                    if (mainMesh && mainMesh.material) {
                        mainMesh.material.emissiveIntensity = Math.min(
                            mainMesh.material.emissiveIntensity + 0.03, 
                            0.3
                        );
                    }
                } else {
                    // Reset to normal
                    group.scale.x += (1.0 - group.scale.x) * 0.15;
                    group.scale.y += (1.0 - group.scale.y) * 0.15;
                    group.scale.z += (1.0 - group.scale.z) * 0.15;
                    group.rotation.y += (0 - group.rotation.y) * 0.15;
                    
                    // Reset glow
                    const mainMesh = group.userData.mainMesh;
                    if (mainMesh && mainMesh.material) {
                        mainMesh.material.emissiveIntensity = Math.max(
                            mainMesh.material.emissiveIntensity - 0.02, 
                            0.05
                        );
                    }
                }
            }
        });
        
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
        // Check if mouse is over UI controls - prevent hover effects
        const uiControls = document.getElementById('ui-controls');
        if (uiControls && uiControls.contains(event.target)) {
            if (hoveredMesh) {
                hoveredMesh = null;
                document.body.style.cursor = 'default';
            }
            return; // Don't process hover if it's on UI
        }
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Raycast to find hovered group (need to check children)
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(imageMeshes, true);
        
        // Update hovered mesh
        if (intersects.length > 0) {
            // Get the parent group
            let newHovered = intersects[0].object;
            while (newHovered.parent && !newHovered.userData.isImageMesh) {
                newHovered = newHovered.parent;
            }
            
            if (newHovered !== hoveredMesh && newHovered.userData.isImageMesh) {
                hoveredMesh = newHovered;
                document.body.style.cursor = 'pointer';
            }
        } else {
            if (hoveredMesh) {
                hoveredMesh = null;
                document.body.style.cursor = 'default';
            }
        }
    }
    
    /**
     * Handle mouse click
     */
    function onMouseClick(event) {
        // Check if click is on UI controls - prevent click-through
        const uiControls = document.getElementById('ui-controls');
        if (uiControls && uiControls.contains(event.target)) {
            return; // Don't process click if it's on UI
        }
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(imageMeshes, true);
        
        if (intersects.length > 0) {
            // Get the parent group
            let clickedObject = intersects[0].object;
            while (clickedObject.parent && !clickedObject.userData.isImageMesh) {
                clickedObject = clickedObject.parent;
            }
            
            if (clickedObject.userData.isImageMesh) {
                const imageData = clickedObject.userData.imageData;
                const imageIndex = clickedObject.userData.imageIndex;
                
                // Trigger event for modal
                window.dispatchEvent(new CustomEvent('imageClicked', {
                    detail: { imageData, imageIndex }
                }));
            }
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
    
    /**
     * Update control parameters
     */
    function updateControls(params) {
        Object.assign(controlParams, params);
        
        // Apply particle count change
        if (params.particleCount !== undefined && particleSystem) {
            scene.remove(particleSystem);
            addParticles();
        }
        
        // Apply glow intensity to all lights
        if (params.glowIntensity !== undefined) {
            scene.children.forEach(child => {
                if (child.isLight) {
                    child.intensity = params.glowIntensity;
                }
            });
        }
        
        // Toggle particle visibility
        if (params.particleVisible !== undefined && particleSystem) {
            particleSystem.visible = params.particleVisible;
        }
    }
    
    /**
     * Get control parameters
     */
    function getControlParams() {
        return controlParams;
    }
    
    // Public API
    return {
        init,
        loadImages,
        start,
        stop,
        changeLayout,
        getImages,
        updateControls,
        getControlParams
    };
})();

