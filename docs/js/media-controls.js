/**
 * media-controls.js - Shared Video/Image Control Handlers
 *
 * Provides unified control setup for video and image players.
 * Used by both media gallery cards and lightbox detail view.
 *
 * Global: MediaControls
 * Depends on: Nothing (standalone)
 */

const MediaControls = {
    /**
     * Format seconds to MM:SS display
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Update fullscreen enter/exit icons
     */
    updateFullscreenIcons(enterIcon, exitIcon, isFullscreen) {
        if (enterIcon) enterIcon.style.display = isFullscreen ? 'none' : '';
        if (exitIcon) exitIcon.style.display = isFullscreen ? '' : 'none';
    },

    /**
     * Check if element is in fullscreen mode
     */
    isFullscreen(element) {
        return document.fullscreenElement === element || document.webkitFullscreenElement === element;
    },

    /**
     * Check if any element is in fullscreen
     */
    isAnyFullscreen() {
        return document.fullscreenElement || document.webkitFullscreenElement;
    },

    /**
     * Request fullscreen on element
     */
    requestFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen({ navigationUI: 'hide' });
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
    },

    /**
     * Exit fullscreen
     */
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    },

    /**
     * Setup video controls for a video element
     * @param {Object} options
     * @param {HTMLVideoElement} options.video - The video element
     * @param {HTMLElement} options.container - Container for fullscreen
     * @param {HTMLElement} options.playPauseBtn - Play/pause button
     * @param {HTMLElement} options.iconPlay - Play icon
     * @param {HTMLElement} options.iconPause - Pause icon
     * @param {HTMLInputElement} options.timeSlider - Time scrubber
     * @param {HTMLElement} options.timeDisplay - Time text display (optional)
     * @param {HTMLElement} options.restartBtn - Restart button (optional)
     * @param {HTMLElement} options.audioToggle - Mute toggle button (optional)
     * @param {HTMLElement} options.fullscreenBtn - Fullscreen button (optional)
     * @param {boolean} options.showEndedOverlay - Show "scroll for sources" overlay on end
     */
    setupVideoControls(options) {
        const {
            video,
            container,
            playPauseBtn,
            iconPlay,
            iconPause,
            timeSlider,
            timeDisplay,
            restartBtn,
            audioToggle,
            fullscreenBtn,
            showEndedOverlay = false
        } = options;

        const showPlayIcon = () => {
            if (iconPlay) iconPlay.style.display = '';
            if (iconPause) iconPause.style.display = 'none';
        };

        const showPauseIcon = () => {
            if (iconPlay) iconPlay.style.display = 'none';
            if (iconPause) iconPause.style.display = '';
        };

        const clearEndedState = () => {
            video.style.filter = '';
            const overlay = container?.querySelector('.video-ended-overlay');
            if (overlay) overlay.remove();
            const restartPrompt = container?.querySelector('.fullscreen-restart-prompt');
            if (restartPrompt) restartPrompt.remove();
        };

        const restartVideo = () => {
            clearEndedState();
            video.currentTime = 0;
            video.play();
            showPauseIcon();
        };

        const togglePlayPause = () => {
            if (video.paused) {
                clearEndedState();
                video.play();
                showPauseIcon();
            } else {
                video.pause();
                showPlayIcon();
            }
        };

        // Play/pause button
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePlayPause();
            });
        }

        // Click video to toggle play/pause
        video.addEventListener('click', togglePlayPause);

        // Play/pause state sync
        video.addEventListener('play', showPauseIcon);
        video.addEventListener('pause', showPlayIcon);

        // Time slider
        if (timeSlider) {
            video.addEventListener('loadedmetadata', () => {
                timeSlider.max = video.duration;
                if (timeDisplay) {
                    timeDisplay.textContent = `0:00 / ${this.formatTime(video.duration)}`;
                }
            });

            video.addEventListener('timeupdate', () => {
                if (!timeSlider.dataset.dragging) {
                    timeSlider.value = video.currentTime;
                }
                if (timeDisplay) {
                    timeDisplay.textContent = `${this.formatTime(video.currentTime)} / ${this.formatTime(video.duration || 0)}`;
                }
            });

            timeSlider.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                timeSlider.dataset.dragging = 'true';
            });
            timeSlider.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                timeSlider.dataset.dragging = 'true';
            });
            timeSlider.addEventListener('input', (e) => {
                e.stopPropagation();
                video.currentTime = parseFloat(timeSlider.value);
            });
            timeSlider.addEventListener('mouseup', () => delete timeSlider.dataset.dragging);
            timeSlider.addEventListener('touchend', () => delete timeSlider.dataset.dragging);
            timeSlider.addEventListener('click', (e) => e.stopPropagation());
        }

        // Video ended state
        video.addEventListener('ended', () => {
            showPlayIcon();
            if (container) {
                video.style.filter = 'grayscale(80%) brightness(0.7)';

                if (this.isFullscreen(container)) {
                    if (!container.querySelector('.fullscreen-restart-prompt')) {
                        const prompt = document.createElement('div');
                        prompt.className = 'fullscreen-restart-prompt';
                        prompt.innerHTML = '<button class="restart-prompt-btn">Tap to replay</button>';
                        prompt.querySelector('.restart-prompt-btn').addEventListener('click', restartVideo);
                        container.appendChild(prompt);
                    }
                } else if (showEndedOverlay) {
                    if (!container.querySelector('.video-ended-overlay')) {
                        const overlay = document.createElement('div');
                        overlay.className = 'video-ended-overlay';
                        overlay.innerHTML = '<span>scroll for sources below</span>';
                        container.appendChild(overlay);
                    }
                }
            }
        });

        // Restart button
        if (restartBtn) {
            restartBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                restartVideo();
            });
        }

        // Audio toggle
        if (audioToggle) {
            audioToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                video.muted = !video.muted;
                audioToggle.classList.toggle('muted', video.muted);
            });
        }

        // Fullscreen button
        if (fullscreenBtn) {
            const enterIcon = fullscreenBtn.querySelector('.fullscreen-enter');
            const exitIcon = fullscreenBtn.querySelector('.fullscreen-exit');

            const onFullscreenChange = () => {
                const isFs = this.isFullscreen(container);
                if (!isFs) {
                    container.classList.remove('fullscreen-exiting');
                }
                this.updateFullscreenIcons(enterIcon, exitIcon, isFs);
            };

            fullscreenBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.isFullscreen(container)) {
                    container.classList.add('fullscreen-exiting');
                    this.exitFullscreen();
                } else {
                    // Try container first, fall back to video for iOS
                    if (container.requestFullscreen || container.webkitRequestFullscreen) {
                        this.requestFullscreen(container);
                    } else if (video.webkitEnterFullscreen) {
                        video.webkitEnterFullscreen();
                    }
                }
            });

            document.addEventListener('fullscreenchange', onFullscreenChange);
            document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        }
    },

    /**
     * Setup image fullscreen controls
     * @param {Object} options
     * @param {HTMLImageElement} options.image - The image element
     * @param {HTMLElement} options.container - Container for fullscreen
     * @param {HTMLElement} options.fullscreenBtn - Fullscreen button
     */
    setupImageControls(options) {
        const { image, container, fullscreenBtn } = options;

        if (!fullscreenBtn) return;

        const enterIcon = fullscreenBtn.querySelector('.fullscreen-enter');
        const exitIcon = fullscreenBtn.querySelector('.fullscreen-exit');

        const onFullscreenChange = () => {
            const isFs = this.isFullscreen(container);
            if (!isFs) {
                container.classList.remove('fullscreen-exiting');
            }
            this.updateFullscreenIcons(enterIcon, exitIcon, isFs);
        };

        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.isFullscreen(container)) {
                container.classList.add('fullscreen-exiting');
                this.exitFullscreen();
            } else {
                this.requestFullscreen(container);
            }
        });

        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    }
};
