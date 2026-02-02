/**
 * splash.js - Splash Screen Animation
 *
 * Handles the animated intro screen with:
 * - 24-hour cooldown between shows
 * - Click/swipe to dismiss
 * - Title click to replay
 *
 * Global: Splash
 * Depends on: Nothing (standalone)
 */

const Splash = {
    element: null,
    DURATION_MS: 3500,
    COOLDOWN_MS: 24 * 60 * 60 * 1000, // 24 hours

    /**
     * Initialize splash screen
     */
    init() {
        this.element = document.getElementById('splash');
        if (!this.element) return;

        this.setupTitleReplay();
        this.checkCooldownAndShow();
        this.setupDismissHandlers();
    },

    /**
     * Close the splash screen
     */
    close() {
        if (this.element) {
            this.element.classList.add('hidden');
        }
    },

    /**
     * Show the splash screen (reset animations)
     */
    show() {
        if (!this.element) return;

        document.documentElement.classList.remove('skip-splash');

        // Reset animations
        const animated = this.element.querySelectorAll('.splash-image, .splash-overlay, .splash-progress');
        animated.forEach(el => {
            el.style.animation = 'none';
            el.offsetHeight; // Force reflow
            el.style.animation = '';
        });

        this.element.classList.remove('hidden');
        setTimeout(() => this.close(), this.DURATION_MS);
    },

    /**
     * Setup title click to replay splash
     */
    setupTitleReplay() {
        const titleLink = document.getElementById('title-link');
        if (titleLink) {
            titleLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.show();
            });
        }
    },

    /**
     * Check cooldown and show if appropriate
     */
    checkCooldownAndShow() {
        const lastSplash = localStorage.getItem('splashLastShown');
        const now = Date.now();

        if (lastSplash && (now - parseInt(lastSplash, 10)) < this.COOLDOWN_MS) {
            // Within cooldown - hide immediately
            this.element.classList.add('hidden');
            return;
        }

        // Show splash and record time
        localStorage.setItem('splashLastShown', now.toString());
        setTimeout(() => this.close(), this.DURATION_MS);
    },

    /**
     * Setup click and swipe handlers to dismiss
     */
    setupDismissHandlers() {
        // Click to dismiss
        this.element.addEventListener('click', () => this.close());

        // Swipe to dismiss
        let touchStartY = 0;

        this.element.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.element.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const swipeDistance = touchStartY - touchEndY;
            if (Math.abs(swipeDistance) > 50) {
                this.close();
            }
        }, { passive: true });
    }
};
