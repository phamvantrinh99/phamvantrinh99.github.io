(function() {
    'use strict';

    const particlesContainer = document.getElementById('particles-container');
    const particleCount = 100; // Số lượng particles
    const colors = ['purple', 'blue', 'cyan', 'white', 'pink'];
    
    console.log('🎨 Particles Plinko initialized');

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
        
        // Random size (3px to 10px)
        const size = Math.random() * 7 + 3;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random starting position anywhere on screen
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        particle.style.left = `${startX}%`;
        particle.style.top = `${startY}%`;
        
        // Random movement direction and distance
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 80 + 40;
        
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        particle.style.setProperty('--end-x', `${endX}vw`);
        particle.style.setProperty('--end-y', `${endY}vh`);
        
        // Animation duration (12s to 30s)
        const duration = Math.random() * 18 + 12;
        particle.style.animationDuration = `${duration}s, ${duration * 0.5}s`;
        
        // Random delay
        const delay = Math.random() * 10;
        particle.style.animationDelay = `${delay}s`;
        
        // Random max opacity (0.7 to 1.0)
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

