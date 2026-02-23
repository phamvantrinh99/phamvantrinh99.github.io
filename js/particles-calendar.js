(function() {
    'use strict';

    const particlesContainer = document.querySelector('.particles-container');
    const particleCount = 100; // Số lượng particles
    const colors = ['purple', 'blue', 'cyan', 'white', 'pink'];
    
    if (!particlesContainer) {
        console.log('⚠️ Particles container not found, skipping particle effects');
        return;
    }
    
    console.log('🎨 Particles Calendar initialized');

    /**
     * Create particles
     */
    function createParticles() {
        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }
    }

    /**
     * Create a single particle
     */
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random color
        const colorClass = colors[Math.floor(Math.random() * colors.length)];
        particle.classList.add(colorClass);
        
        // Random size (6px to 20px) - much larger
        const size = Math.random() * 14 + 6;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random starting position anywhere on screen
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        particle.style.left = `${startX}%`;
        particle.style.top = `${startY}%`;
        
        // Random movement direction and distance
        // Create varied movement patterns across the screen
        const angle = Math.random() * Math.PI * 2; // Random angle in radians
        const distance = Math.random() * 80 + 40; // 40-120vw distance
        
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        particle.style.setProperty('--end-x', `${endX}vw`);
        particle.style.setProperty('--end-y', `${endY}vh`);
        
        // Smooth animation duration (12s to 30s) - slower for smoother movement
        const duration = Math.random() * 18 + 12;
        particle.style.animationDuration = `${duration}s, ${duration * 0.5}s`;
        
        // Random delay
        const delay = Math.random() * 10;
        particle.style.animationDelay = `${delay}s`;
        
        // Random max opacity (0.7 to 1.0) - much brighter
        const maxOpacity = Math.random() * 0.3 + 0.7;
        particle.style.setProperty('--max-opacity', maxOpacity);
        
        particlesContainer.appendChild(particle);
        
        // Remove and recreate particle after animation completes
        setTimeout(() => {
            particle.remove();
            createParticle();
        }, (duration + delay) * 1000);
    }

    /**
     * Initialize particles on load
     */
    function init() {
        createParticles();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

