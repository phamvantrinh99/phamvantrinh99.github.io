(function() {
    'use strict';

    // DOM Elements
    const voiceList = document.getElementById('voice-list');
    const searchInput = document.getElementById('search-input');
    const languageFilter = document.getElementById('language-filter');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const testText = document.getElementById('test-text');
    const rateSlider = document.getElementById('rate-slider');
    const pitchSlider = document.getElementById('pitch-slider');
    const volumeSlider = document.getElementById('volume-slider');
    const rateValue = document.getElementById('rate-value');
    const pitchValue = document.getElementById('pitch-value');
    const volumeValue = document.getElementById('volume-value');
    const stopAllBtn = document.getElementById('stop-all-btn');
    const testAllBtn = document.getElementById('test-all-btn');
    const userAgentSpan = document.getElementById('user-agent');
    const speechSupportSpan = document.getElementById('speech-support');
    const totalVoicesSpan = document.getElementById('total-voices');

    // State
    let allVoices = [];
    let filteredVoices = [];
    let currentFilter = 'all';
    let currentLanguage = 'all';
    let currentUtterance = null;
    let isTestingAll = false;

    /**
     * Initialize
     */
    function init() {
        setupEventListeners();
        displayBrowserInfo();
        loadVoices();
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Hamburger menu
        const hamburgerMenu = document.getElementById('hamburger-menu');
        hamburgerMenu.addEventListener('click', toggleNavMenu);

        const closeNavBtn = document.getElementById('close-menu');
        closeNavBtn.addEventListener('click', toggleNavMenu);

        const navOverlay = document.getElementById('nav-overlay');
        navOverlay.addEventListener('click', toggleNavMenu);

        // Search and filters
        searchInput.addEventListener('input', applyFilters);
        languageFilter.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            applyFilters();
        });

        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.dataset.filter;
                applyFilters();
            });
        });

        // Control sliders
        rateSlider.addEventListener('input', (e) => {
            rateValue.textContent = parseFloat(e.target.value).toFixed(1);
        });

        pitchSlider.addEventListener('input', (e) => {
            pitchValue.textContent = parseFloat(e.target.value).toFixed(1);
        });

        volumeSlider.addEventListener('input', (e) => {
            volumeValue.textContent = parseFloat(e.target.value).toFixed(1);
        });

        // Buttons
        stopAllBtn.addEventListener('click', stopAllSpeech);
        testAllBtn.addEventListener('click', testAllVoices);
    }

    /**
     * Display browser information
     */
    function displayBrowserInfo() {
        userAgentSpan.textContent = navigator.userAgent;
        
        if ('speechSynthesis' in window) {
            speechSupportSpan.textContent = '✅ Supported';
            speechSupportSpan.style.color = '#38ef7d';
        } else {
            speechSupportSpan.textContent = '❌ Not Supported';
            speechSupportSpan.style.color = '#e44d26';
            voiceList.innerHTML = '<p class="error-text">❌ Speech Synthesis is not supported in this browser.</p>';
        }
    }

    /**
     * Load voices
     */
    function loadVoices() {
        if (!('speechSynthesis' in window)) {
            return;
        }

        // Get voices
        allVoices = speechSynthesis.getVoices();

        // If no voices yet, wait for voiceschanged event
        if (allVoices.length === 0) {
            speechSynthesis.addEventListener('voiceschanged', () => {
                allVoices = speechSynthesis.getVoices();
                processVoices();
            });
        } else {
            processVoices();
        }
    }

    /**
     * Process loaded voices
     */
    function processVoices() {
        console.log(`📢 Loaded ${allVoices.length} voices`);
        
        // Update total count
        totalVoicesSpan.textContent = allVoices.length;

        // Populate language filter
        populateLanguageFilter();

        // Update filter counts
        updateFilterCounts();

        // Display voices
        applyFilters();
    }

    /**
     * Populate language filter dropdown
     */
    function populateLanguageFilter() {
        const languages = new Set();
        allVoices.forEach(voice => {
            languages.add(voice.lang);
        });

        const sortedLanguages = Array.from(languages).sort();
        
        languageFilter.innerHTML = '<option value="all">All Languages</option>';
        sortedLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = `${lang} (${getLanguageName(lang)})`;
            languageFilter.appendChild(option);
        });
    }

    /**
     * Get human-readable language name
     */
    function getLanguageName(langCode) {
        try {
            const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
            return displayNames.of(langCode.split('-')[0]) || langCode;
        } catch (error) {
            return langCode;
        }
    }

    /**
     * Update filter counts
     */
    function updateFilterCounts() {
        const localCount = allVoices.filter(v => v.localService).length;
        const remoteCount = allVoices.filter(v => !v.localService).length;

        document.getElementById('count-all').textContent = allVoices.length;
        document.getElementById('count-local').textContent = localCount;
        document.getElementById('count-remote').textContent = remoteCount;
    }

    /**
     * Apply filters
     */
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        filteredVoices = allVoices.filter(voice => {
            // Filter by type (local/remote)
            if (currentFilter === 'local' && !voice.localService) return false;
            if (currentFilter === 'remote' && voice.localService) return false;

            // Filter by language
            if (currentLanguage !== 'all' && voice.lang !== currentLanguage) return false;

            // Filter by search term
            if (searchTerm) {
                const matchName = voice.name.toLowerCase().includes(searchTerm);
                const matchLang = voice.lang.toLowerCase().includes(searchTerm);
                if (!matchName && !matchLang) return false;
            }

            return true;
        });

        displayVoices(filteredVoices);
    }

    /**
     * Display voices
     */
    function displayVoices(voices) {
        if (voices.length === 0) {
            voiceList.innerHTML = '<p class="empty-text">No voices found matching your filters.</p>';
            return;
        }

        voiceList.innerHTML = '';
        voices.forEach((voice, index) => {
            const card = createVoiceCard(voice, index);
            voiceList.appendChild(card);
        });
    }

    /**
     * Create voice card
     */
    function createVoiceCard(voice, index) {
        const card = document.createElement('div');
        card.className = 'voice-card';
        card.dataset.voiceIndex = index;

        const badge = voice.localService ? 
            '<span class="voice-badge local">Local</span>' : 
            '<span class="voice-badge remote">Remote</span>';

        card.innerHTML = `
            <div class="voice-header">
                <div class="voice-name">${voice.name}</div>
                ${badge}
            </div>
            <div class="voice-info">
                <div class="voice-info-row">
                    <span class="voice-info-label">Language:</span>
                    <span class="voice-lang">${voice.lang}</span>
                </div>
                <div class="voice-info-row">
                    <span class="voice-info-label">Default:</span>
                    <span>${voice.default ? '✅ Yes' : '❌ No'}</span>
                </div>
                <div class="voice-info-row">
                    <span class="voice-info-label">URI:</span>
                    <span style="font-size: 11px; word-break: break-all;">${voice.voiceURI || 'N/A'}</span>
                </div>
            </div>
            <div class="voice-actions">
                <button class="voice-btn voice-btn-play" data-voice-index="${index}">
                    ▶️ Test Voice
                </button>
            </div>
        `;

        // Add event listener to play button
        const playBtn = card.querySelector('.voice-btn-play');
        playBtn.addEventListener('click', () => speakWithVoice(voice, card));

        return card;
    }

    /**
     * Speak with specific voice
     */
    function speakWithVoice(voice, cardElement) {
        // Stop current speech
        stopAllSpeech();

        const text = testText.value.trim() || `Hello, I am ${voice.name}`;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.rate = parseFloat(rateSlider.value);
        utterance.pitch = parseFloat(pitchSlider.value);
        utterance.volume = parseFloat(volumeSlider.value);

        // Event handlers
        utterance.onstart = () => {
            cardElement.classList.add('speaking');
            console.log(`🎤 Speaking with: ${voice.name}`);
        };

        utterance.onend = () => {
            cardElement.classList.remove('speaking');
            console.log(`✅ Finished: ${voice.name}`);
        };

        utterance.onerror = (event) => {
            cardElement.classList.remove('speaking');
            console.error(`❌ Error with ${voice.name}:`, event.error);
        };

        currentUtterance = utterance;
        speechSynthesis.speak(utterance);
    }

    /**
     * Stop all speech
     */
    function stopAllSpeech() {
        speechSynthesis.cancel();
        
        // Remove speaking class from all cards
        document.querySelectorAll('.voice-card.speaking').forEach(card => {
            card.classList.remove('speaking');
        });

        currentUtterance = null;
        isTestingAll = false;
        testAllBtn.textContent = '🎵 Test All Voices';
        testAllBtn.disabled = false;
    }

    /**
     * Test all voices sequentially
     */
    async function testAllVoices() {
        if (isTestingAll) {
            stopAllSpeech();
            return;
        }

        isTestingAll = true;
        testAllBtn.textContent = '⏹️ Stop Testing';
        
        const text = testText.value.trim() || 'Testing voice';

        for (let i = 0; i < filteredVoices.length; i++) {
            if (!isTestingAll) break;

            const voice = filteredVoices[i];
            const card = document.querySelector(`[data-voice-index="${i}"]`);

            await new Promise((resolve) => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = voice;
                utterance.rate = parseFloat(rateSlider.value);
                utterance.pitch = parseFloat(pitchSlider.value);
                utterance.volume = parseFloat(volumeSlider.value);

                utterance.onstart = () => {
                    if (card) card.classList.add('speaking');
                    console.log(`🎤 Testing ${i + 1}/${filteredVoices.length}: ${voice.name}`);
                };

                utterance.onend = () => {
                    if (card) card.classList.remove('speaking');
                    resolve();
                };

                utterance.onerror = () => {
                    if (card) card.classList.remove('speaking');
                    resolve();
                };

                speechSynthesis.speak(utterance);
            });

            // Small delay between voices
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        isTestingAll = false;
        testAllBtn.textContent = '🎵 Test All Voices';
    }

    /**
     * Toggle navigation menu
     */
    function toggleNavMenu() {
        const hamburgerMenu = document.getElementById('hamburger-menu');
        const navMenu = document.getElementById('nav-menu');
        const navOverlay = document.getElementById('nav-overlay');
        hamburgerMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');
    }

    // Initialize on load
    init();
})();

