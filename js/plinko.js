(function() {
    'use strict';

    // Matter.js aliases
    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Body = Matter.Body;
    const Events = Matter.Events;
    const Runner = Matter.Runner;
    const Composite = Matter.Composite;

    // Game state
    let engine, render, runner, world;
    let pins = [];
    let balls = [];
    let sensor;
    let pinsLastRowXCoords = [];
    let playerNames = [];
    let shuffledPlayerNames = []; // Shuffled order for display
    let binAnimationOffset = 0; // For scrolling animation

    // Canvas dimensions
    const CANVAS_WIDTH = 760;
    let CANVAS_HEIGHT = 620; // Will be adjusted based on rowCount
    const PADDING_X = 52;
    const PADDING_TOP = 36;
    let PADDING_BOTTOM = 68; // Will be adjusted based on bin height

    // Collision categories
    const PIN_CATEGORY = 0x0001;
    const BALL_CATEGORY = 0x0002;

    // Game configuration
    let rowCount = 16; // Default 16 rows
    let ballSpeed = 1; // Default speed multiplier
    let scrollSpeed = 0.5; // Default scroll speed for cards
    const PIN_RADIUS = 4; // Fixed pin size
    let BALL_RADIUS = 8; // Will be adjusted based on row count

    // Multipliers for 16 rows (17 bins) - MEDIUM risk
    const multipliers = [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110];

    // Bin colors (gradient from red to yellow to red)
    const binColors = [
        { bg: 'rgb(255, 0, 63)', shadow: 'rgb(166, 0, 4)' },
        { bg: 'rgb(255, 32, 63)', shadow: 'rgb(166, 16, 4)' },
        { bg: 'rgb(255, 64, 47)', shadow: 'rgb(166, 32, 4)' },
        { bg: 'rgb(255, 96, 31)', shadow: 'rgb(166, 48, 4)' },
        { bg: 'rgb(255, 128, 15)', shadow: 'rgb(166, 64, 4)' },
        { bg: 'rgb(255, 160, 0)', shadow: 'rgb(171, 80, 0)' },
        { bg: 'rgb(255, 176, 0)', shadow: 'rgb(171, 96, 0)' },
        { bg: 'rgb(255, 184, 0)', shadow: 'rgb(171, 105, 0)' },
        { bg: 'rgb(255, 192, 0)', shadow: 'rgb(171, 121, 0)' },
        { bg: 'rgb(255, 184, 0)', shadow: 'rgb(171, 105, 0)' },
        { bg: 'rgb(255, 176, 0)', shadow: 'rgb(171, 96, 0)' },
        { bg: 'rgb(255, 160, 0)', shadow: 'rgb(171, 80, 0)' },
        { bg: 'rgb(255, 128, 15)', shadow: 'rgb(166, 64, 4)' },
        { bg: 'rgb(255, 96, 31)', shadow: 'rgb(166, 48, 4)' },
        { bg: 'rgb(255, 64, 47)', shadow: 'rgb(166, 32, 4)' },
        { bg: 'rgb(255, 32, 63)', shadow: 'rgb(166, 16, 4)' },
        { bg: 'rgb(255, 0, 63)', shadow: 'rgb(166, 0, 4)' }
    ];

    // Ball friction parameters (tuned for 16 rows)
    const BALL_FRICTION = 0.5;
    const BALL_FRICTION_AIR = 0.0364;

    // DOM Elements
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const winnerOverlay = document.getElementById('winner-overlay');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const closeMenu = document.getElementById('close-menu');
    const navOverlay = document.getElementById('nav-overlay');
    
    const namesInput = document.getElementById('names-input');
    const startBtn = document.getElementById('start-btn');
    const dropBtn = document.getElementById('drop-btn');
    const resetBtn = document.getElementById('reset-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const winnerCloseBtn = document.getElementById('winner-close-btn');
    const winnerNameEl = document.getElementById('winner-name');
    const rowsSelect = document.getElementById('rows-select');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');
    const scrollSpeedSlider = document.getElementById('scroll-speed-slider');
    const scrollSpeedValue = document.getElementById('scroll-speed-value');

    // Initialize
    init();

    function init() {
        setupEventListeners();
    }

    function setupEventListeners() {
        // Menu toggle
        hamburgerMenu.addEventListener('click', () => {
            navMenu.classList.add('active');
            navOverlay.classList.add('active');
        });

        closeMenu.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
        });

        navOverlay.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
        });

        // Start game
        startBtn.addEventListener('click', startGame);

        // Game controls
        dropBtn.addEventListener('click', dropBall);
        resetBtn.addEventListener('click', resetGame);
        newGameBtn.addEventListener('click', showSetupScreen);
        
        // Winner overlay controls
        winnerCloseBtn.addEventListener('click', closeWinnerPopup);
        winnerOverlay.addEventListener('click', (e) => {
            // Close if clicking on overlay background (not on content)
            if (e.target === winnerOverlay) {
                closeWinnerPopup();
            }
        });
        
        // Slider controls
        speedSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            speedValue.textContent = value.toFixed(1) + 'x';
        });
        
        scrollSpeedSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            scrollSpeedValue.textContent = value.toFixed(1) + 'x';
        });

        // Allow Enter key to start game
        namesInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                startGame();
            }
        });
    }

    function startGame() {
        const input = namesInput.value.trim();
        if (!input) {
            alert('Please enter player names!');
            return;
        }

        const names = input.split('\n').filter(n => n.trim()).map(n => n.trim());
        if (names.length < 2) {
            alert('Need at least 2 players!');
            return;
        }
        if (names.length > 20) {
            alert('Maximum 20 players!');
            return;
        }

        playerNames = names;
        
        // Shuffle player names for display (but keep original order for bin detection)
        shuffledPlayerNames = [...names].sort(() => Math.random() - 0.5);
        binAnimationOffset = 0; // Reset animation
        
        // Get settings
        rowCount = parseInt(rowsSelect.value);
        ballSpeed = parseFloat(speedSlider.value);
        scrollSpeed = parseFloat(scrollSpeedSlider.value);
        
        // Calculate max bin height needed for longest name
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        let maxTextWidth = 0;
        names.forEach(name => {
            const width = ctx.measureText(name).width;
            if (width > maxTextWidth) maxTextWidth = width;
        });
        
        // Adjust PADDING_BOTTOM based on max bin height
        const baseBinHeight = 55;
        const maxBinHeight = Math.max(baseBinHeight, maxTextWidth + 20);
        PADDING_BOTTOM = maxBinHeight + 20; // Extra 20px for spacing
        
        // Adjust canvas height based on row count
        // Base height for 16 rows is 620, each additional row adds ~30px
        const baseRows = 16;
        const baseHeight = 620;
        const rowHeightIncrement = 30;
        CANVAS_HEIGHT = baseHeight + (rowCount - baseRows) * rowHeightIncrement;
        
        // Adjust ball size based on row count
        // Need to balance: big enough to bounce, small enough not to get stuck
        if (rowCount === 8) {
            BALL_RADIUS = 16; // Much larger for 8 rows to ensure good bouncing
        } else if (rowCount === 12) {
            BALL_RADIUS = 12; // Larger for 12 rows
        } else if (rowCount === 16) {
            BALL_RADIUS = 8; // Standard size for 16 rows
        } else if (rowCount === 20) {
            BALL_RADIUS = 7; // Medium for 20 rows
        } else if (rowCount === 24) {
            BALL_RADIUS = 6; // Smaller for 24 rows
        } else if (rowCount === 28) {
            BALL_RADIUS = 5; // Small for 28 rows
        } else { // 32 rows
            BALL_RADIUS = 4.5; // Very small for 32 rows
        }
        
        setupPhysics();
        setupScreen.classList.add('hidden');
        gameScreen.classList.add('active');
    }

    function setupPhysics() {
        const canvas = document.getElementById('plinko-canvas');
        
        // Set canvas size
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        
        // Create engine
        engine = Engine.create({
            timing: {
                timeScale: ballSpeed
            }
        });
        world = engine.world;
        world.gravity.y = 1 * ballSpeed;

        // Create renderer
        render = Render.create({
            canvas: canvas,
            engine: engine,
            options: {
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                wireframes: false,
                background: 'transparent',
                pixelRatio: window.devicePixelRatio || 1
            }
        });

        Render.run(render);

        // Create runner
        runner = Runner.create();
        Runner.run(runner, engine);

        // Setup game board
        placePinsAndWalls();
        createSensor();
        
        // Render bins
        Events.on(render, 'afterRender', renderBins);
    }

    function placePinsAndWalls() {
        // Clear previous pins
        if (pins.length > 0) {
            Composite.remove(world, pins);
            pins = [];
        }
        pinsLastRowXCoords = [];

        const pinDistanceX = (CANVAS_WIDTH - PADDING_X * 2) / (3 + rowCount - 1 - 1);
        const pinRadius = PIN_RADIUS;

        // Create pins
        for (let row = 0; row < rowCount; row++) {
            const rowY = PADDING_TOP + ((CANVAS_HEIGHT - PADDING_TOP - PADDING_BOTTOM) / (rowCount - 1)) * row;
            const rowPaddingX = PADDING_X + ((rowCount - 1 - row) * pinDistanceX) / 2;
            const pinsInRow = 3 + row;

            for (let col = 0; col < pinsInRow; col++) {
                const colX = rowPaddingX + ((CANVAS_WIDTH - rowPaddingX * 2) / (pinsInRow - 1)) * col;
                
                const pin = Bodies.circle(colX, rowY, pinRadius, {
                    isStatic: true,
                    render: {
                        fillStyle: '#ffffff'
                    },
                    collisionFilter: {
                        category: PIN_CATEGORY,
                        mask: BALL_CATEGORY
                    }
                });

                pins.push(pin);

                if (row === rowCount - 1) {
                    pinsLastRowXCoords.push(colX);
                }
            }
        }

        Composite.add(world, pins);

        // Create walls
        const firstPinX = pins[0].position.x;
        const leftWallAngle = Math.atan2(
            firstPinX - pinsLastRowXCoords[0],
            CANVAS_HEIGHT - PADDING_TOP - PADDING_BOTTOM
        );
        const leftWallX = firstPinX - (firstPinX - pinsLastRowXCoords[0]) / 2 - pinDistanceX * 0.25;

        const leftWall = Bodies.rectangle(
            leftWallX,
            CANVAS_HEIGHT / 2,
            10,
            CANVAS_HEIGHT,
            {
                isStatic: true,
                angle: leftWallAngle,
                render: { visible: false }
            }
        );

        const rightWall = Bodies.rectangle(
            CANVAS_WIDTH - leftWallX,
            CANVAS_HEIGHT / 2,
            10,
            CANVAS_HEIGHT,
            {
                isStatic: true,
                angle: -leftWallAngle,
                render: { visible: false }
            }
        );

        Composite.add(world, [leftWall, rightWall]);
    }

    function createSensor() {
        sensor = Bodies.rectangle(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT,
            CANVAS_WIDTH,
            10,
            {
                isSensor: true,
                isStatic: true,
                render: {
                    visible: false
                }
            }
        );

        Composite.add(world, sensor);

        Events.on(engine, 'collisionStart', ({ pairs }) => {
            pairs.forEach(({ bodyA, bodyB }) => {
                if (bodyA === sensor) {
                    handleBallEnterBin(bodyB);
                } else if (bodyB === sensor) {
                    handleBallEnterBin(bodyA);
                }
            });
        });
    }

    function dropBall() {
        const pinDistanceX = (CANVAS_WIDTH - PADDING_X * 2) / (3 + rowCount - 1 - 1);
        const ballOffsetRangeX = pinDistanceX * 0.8;
        const ballRadius = BALL_RADIUS;

        const ball = Bodies.circle(
            CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 2 * ballOffsetRangeX,
            0,
            ballRadius,
            {
                restitution: 0.8,
                friction: BALL_FRICTION,
                frictionAir: BALL_FRICTION_AIR,
                collisionFilter: {
                    category: BALL_CATEGORY,
                    mask: PIN_CATEGORY
                },
                render: {
                    fillStyle: '#ff0000'
                }
            }
        );

        Composite.add(world, ball);
        balls.push(ball);
    }

    function handleBallEnterBin(ball) {
        // Calculate which player bin the ball landed in
        const firstPinX = pinsLastRowXCoords[0];
        const lastPinX = pinsLastRowXCoords[pinsLastRowXCoords.length - 1];
        const binsWidth = lastPinX - firstPinX;
        const playerBinWidth = binsWidth / shuffledPlayerNames.length;
        
        // Find which VISUAL bin position (accounting for animation offset)
        const ballX = ball.position.x;
        const adjustedX = ballX - firstPinX + binAnimationOffset;
        
        // Handle wrapping for seamless loop
        const normalizedX = adjustedX % binsWidth;
        
        // Find which shuffled player bin
        const visualBinIndex = Math.floor(normalizedX / playerBinWidth);
        
        if (visualBinIndex >= 0 && visualBinIndex < shuffledPlayerNames.length) {
            const winnerName = shuffledPlayerNames[visualBinIndex];

            setTimeout(() => {
                winnerNameEl.textContent = winnerName;
                winnerOverlay.classList.add('active');
            }, 300);
        }

        Composite.remove(world, ball);
        const ballIndex = balls.indexOf(ball);
        if (ballIndex > -1) {
            balls.splice(ballIndex, 1);
        }
    }

    function renderBins() {
        const ctx = render.canvas.getContext('2d');
        ctx.save();

        const firstPinX = pinsLastRowXCoords[0];
        const lastPinX = pinsLastRowXCoords[pinsLastRowXCoords.length - 1];
        const binsWidth = lastPinX - firstPinX;

        // Update animation offset for scrolling effect
        binAnimationOffset += scrollSpeed; // User-configurable speed
        if (binAnimationOffset >= binsWidth) {
            binAnimationOffset = 0; // Reset when scrolled full width
        }

        // Draw player names only
        if (shuffledPlayerNames.length > 0) {
            const playerBinWidth = binsWidth / shuffledPlayerNames.length;
            const baseHeight = 55;
            const borderRadius = 12;
            const gap = 3;

            // Draw bins twice for seamless scrolling
            for (let repeat = 0; repeat < 2; repeat++) {
                for (let i = 0; i < shuffledPlayerNames.length; i++) {
                    // Calculate position with animation offset
                    const basePlayerX = firstPinX + playerBinWidth * (i + 0.5);
                    const playerX = basePlayerX + (repeat * binsWidth) - binAnimationOffset;
                    
                    // Skip if outside visible area
                    if (playerX < firstPinX - playerBinWidth || playerX > lastPinX + playerBinWidth) {
                        continue;
                    }
                    
                    const baseBinLeft = playerX - playerBinWidth / 2 + gap;
                    const baseBinWidth = playerBinWidth - gap * 2;
                    
                    // Measure text to determine if we need to extend the bin
                    const displayName = shuffledPlayerNames[i];
                    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
                    const textWidth = ctx.measureText(displayName).width;
                
                // Determine bin dimensions based on text
                let binWidth, binHeight, binLeft, binY;
                
                if (textWidth > baseBinWidth - 10) {
                    // Text is too long for horizontal - use vertical layout with taller bin
                    binWidth = baseBinWidth;
                    binHeight = Math.max(baseHeight, textWidth + 20); // Extend height to fit vertical text
                    binLeft = baseBinLeft;
                    binY = CANVAS_HEIGHT - binHeight - 8;
                } else {
                    // Text fits horizontally - use normal bin
                    binWidth = baseBinWidth;
                    binHeight = baseHeight;
                    binLeft = baseBinLeft;
                    binY = CANVAS_HEIGHT - binHeight - 8;
                }
                
                    // Calculate color based on position (gradient purple theme)
                    const normalizedPos = i / (shuffledPlayerNames.length - 1);
                    let r, g, b;
                    
                    if (normalizedPos < 0.33) {
                        // Purple to Blue
                        const t = normalizedPos / 0.33;
                        r = Math.floor(102 + (64 - 102) * t);
                        g = Math.floor(126 + (156 - 126) * t);
                        b = Math.floor(234 + (255 - 234) * t);
                    } else if (normalizedPos < 0.67) {
                        // Blue to Cyan
                        const t = (normalizedPos - 0.33) / 0.34;
                        r = Math.floor(64 + (0 - 64) * t);
                        g = Math.floor(156 + (200 - 156) * t);
                        b = 255;
                    } else {
                        // Cyan to Purple
                        const t = (normalizedPos - 0.67) / 0.33;
                        r = Math.floor(0 + (118 - 0) * t);
                        g = Math.floor(200 + (75 - 200) * t);
                        b = Math.floor(255 + (162 - 255) * t);
                    }
                
                    // Draw outer glow
                    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
                    ctx.shadowBlur = 20;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    
                    // Draw player bin background with gradient and rounded corners
                    const gradient = ctx.createLinearGradient(
                        binLeft,
                        binY,
                        binLeft,
                        binY + binHeight
                    );
                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.95)`);
                    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.85)`);
                    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.7)`);
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.roundRect(binLeft, binY, binWidth, binHeight, borderRadius);
                    ctx.fill();
                    
                    // Reset shadow for border
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    
                    // Draw inner highlight (top)
                    const highlightGradient = ctx.createLinearGradient(
                        binLeft,
                        binY,
                        binLeft,
                        binY + binHeight / 3
                    );
                    highlightGradient.addColorStop(0, `rgba(255, 255, 255, 0.3)`);
                    highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
                    
                    ctx.fillStyle = highlightGradient;
                    ctx.beginPath();
                    ctx.roundRect(binLeft, binY, binWidth, binHeight / 3, [borderRadius, borderRadius, 0, 0]);
                    ctx.fill();
                    
                    // Draw subtle border
                    ctx.strokeStyle = `rgba(${r + 50}, ${g + 50}, ${b + 50}, 0.8)`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.roundRect(binLeft, binY, binWidth, binHeight, borderRadius);
                    ctx.stroke();

                    // Draw player name - crisp and clear
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                    ctx.shadowBlur = 3;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 2;
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
                    
                    if (textWidth > baseBinWidth - 10) {
                        // Display vertically (rotated text) - bin is already extended to fit
                        ctx.save();
                        ctx.translate(playerX, binY + binHeight / 2);
                        ctx.rotate(-Math.PI / 2); // Rotate 90 degrees counter-clockwise
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(displayName, 0, 0); // Full name, no truncation
                        ctx.restore();
                    } else {
                        // Display horizontally
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(displayName, playerX, binY + binHeight / 2);
                    }
                    
                    // Reset shadow
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }
            }
        }

        ctx.restore();
    }

    function resetGame() {
        // Remove all balls
        balls.forEach(ball => {
            Composite.remove(world, ball);
        });
        balls = [];
    }
    
    function closeWinnerPopup() {
        winnerOverlay.classList.remove('active');
    }

    function showSetupScreen() {
        // Clean up physics
        if (engine) {
            World.clear(world, false);
            Engine.clear(engine);
            Render.stop(render);
            Runner.stop(runner);
        }

        gameScreen.classList.remove('active');
        setupScreen.classList.remove('hidden');
        
        pins = [];
        balls = [];
        pinsLastRowXCoords = [];
    }

})();
