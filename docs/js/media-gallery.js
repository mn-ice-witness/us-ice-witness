/**
 * media-gallery.js - Media Gallery Rendering
 *
 * Handles the video/image card gallery:
 * - Multi-column masonry layout
 * - Scroll-to-play video autoplay
 * - Card rendering with controls
 * - Custom media ordering
 *
 * Global: MediaGallery
 * Depends on: App (for incidents, media URLs), MediaControls, ViewState, Lightbox
 */

const MediaGallery = {
    /**
     * Get number of columns based on viewport width
     */
    getColumnCount() {
        const width = window.innerWidth;
        if (width <= 600) return 1;
        if (width <= 900) return 2;
        return 3;
    },

    /**
     * Render the media gallery
     */
    async render() {
        const gallery = document.getElementById('media-gallery');
        let mediaIncidents = App.getFilteredIncidents().filter(i => i.hasLocalMedia);

        if (mediaIncidents.length === 0) {
            const hasSearch = typeof Search !== 'undefined' && Search.query;
            const msg = hasSearch ? 'No media matches your search.' : 'No media available yet. Check back soon.';
            gallery.innerHTML = `<div class="gallery-empty">${msg}</div>`;
            return;
        }

        // Sort by updated date or custom order
        if (ViewState.sortByUpdated) {
            mediaIncidents = [...mediaIncidents].sort((a, b) => {
                const dateA = a.lastUpdated || a.date;
                const dateB = b.lastUpdated || b.date;
                return dateB.localeCompare(dateA);
            });
        } else {
            mediaIncidents = await this.sortByOrder(mediaIncidents);
        }

        const columnCount = this.getColumnCount();

        // Create cards with estimated heights
        const cards = mediaIncidents.map(incident => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = this.renderCard(incident);
            const cardEl = wrapper.firstElementChild;

            this.setupCardControls(cardEl);
            cardEl.addEventListener('click', () => Lightbox.open(incident));

            const estimatedHeight = incident.aspectRatio ? (1 / incident.aspectRatio) : 1;
            return { element: cardEl, height: estimatedHeight };
        });

        // Create columns
        const columns = [];
        for (let i = 0; i < columnCount; i++) {
            columns.push({ element: document.createElement('div'), cards: [], height: 0 });
            columns[i].element.className = 'gallery-column';
        }

        // Distribute cards round-robin
        cards.forEach((card, index) => {
            const columnIndex = index % columnCount;
            columns[columnIndex].cards.push(card);
            columns[columnIndex].height += card.height;
        });

        // Balance columns by moving cards from tallest to shortest
        if (columnCount > 1) {
            let iterations = 0;
            const maxIterations = cards.length * 2;

            while (iterations < maxIterations) {
                iterations++;

                let tallest = columns[0], shortest = columns[0];
                for (const col of columns) {
                    if (col.height > tallest.height) tallest = col;
                    if (col.height < shortest.height) shortest = col;
                }

                if (tallest === shortest || tallest.cards.length === 0) break;

                const lastCard = tallest.cards[tallest.cards.length - 1];

                if (tallest.height - shortest.height > lastCard.height) {
                    tallest.cards.pop();
                    tallest.height -= lastCard.height;
                    shortest.cards.push(lastCard);
                    shortest.height += lastCard.height;
                } else {
                    break;
                }
            }
        }

        // Append cards to columns
        for (const col of columns) {
            for (const card of col.cards) {
                col.element.appendChild(card.element);
            }
        }

        // Build gallery
        gallery.innerHTML = '';

        const mediaNote = document.createElement('div');
        mediaNote.className = 'media-gallery-note';
        mediaNote.innerHTML = 'Videos are clips edited to key moments. Tap video for sources and full context.';
        gallery.appendChild(mediaNote);

        columns.forEach(col => gallery.appendChild(col.element));

        const footer = document.createElement('div');
        footer.className = 'media-gallery-footer';
        footer.innerHTML = '<a href="#list">Click here for a list of all incidents</a>';
        footer.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            ViewState.switchView('list');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        gallery.appendChild(footer);

        this.setupScrollToPlay(gallery);
    },

    /**
     * Setup IntersectionObserver for scroll-to-play
     */
    setupScrollToPlay(gallery) {
        const videos = gallery.querySelectorAll('.media-card-video');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target;
                if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { threshold: [0, 0.4, 0.6, 1] });

        videos.forEach(video => observer.observe(video));
    },

    /**
     * Sort media by custom order from media-order.md
     */
    async sortByOrder(mediaIncidents) {
        try {
            const response = await fetch(App.getMediaUrl('/data/media-order.md'));
            if (!response.ok) return mediaIncidents;

            const text = await response.text();
            const lines = text.split('\n')
                .map(line => line.trim())
                .filter(line => line && !line.startsWith('#'));

            return mediaIncidents.sort((a, b) => {
                const slugA = a.filePath.split('/').pop().replace('.md', '');
                const slugB = b.filePath.split('/').pop().replace('.md', '');
                const indexA = lines.findIndex(line => slugA.includes(line) || line.includes(slugA));
                const indexB = lines.findIndex(line => slugB.includes(line) || line.includes(slugB));

                if (indexA >= 0 && indexB >= 0) return indexA - indexB;
                if (indexA >= 0) return -1;
                if (indexB >= 0) return 1;
                return 0;
            });
        } catch {
            return mediaIncidents;
        }
    },

    /**
     * Render a media card
     */
    renderCard(incident) {
        const type = Array.isArray(incident.type) ? incident.type[0] : incident.type;
        const label = App.categoryLabels[type] || type.toUpperCase();
        const categoryPrefix = `<span class="category-label">${label}:</span> `;

        const mediaUrl = App.getMediaUrl(incident.localMediaPath, incident.mediaVersion);

        let mediaElement;
        let videoControls = '';

        if (incident.localMediaType === 'video') {
            const videoSrc = mediaUrl + '#t=0.001';
            const posterUrl = incident.localMediaOgPath ? App.getMediaUrl(incident.localMediaOgPath, incident.mediaVersion) : '';
            const posterAttr = posterUrl ? ` poster="${posterUrl}"` : '';
            // Spinner disabled - draws eye when multiple videos loading. Poster image provides loading feedback.
            mediaElement = `<video class="media-card-video" src="${videoSrc}"${posterAttr} muted loop playsinline preload="metadata" disableRemotePlayback></video>`;
            videoControls = `
                <div class="media-controls">
                    <button class="media-control-btn play-pause-btn" aria-label="Play/Pause">
                        <svg class="media-icon-pause" viewBox="0 0 24 24" width="24" height="24"><use href="#icon-pause"/></svg>
                        <svg class="media-icon-play" viewBox="0 0 24 24" width="24" height="24" style="display:none"><use href="#icon-play"/></svg>
                    </button>
                    <div class="time-slider-container">
                        <input type="range" class="time-slider" min="0" max="100" value="0" step="0.1" aria-label="Video progress">
                    </div>
                    <button class="media-control-btn restart-btn" aria-label="Restart">
                        <svg viewBox="0 0 24 24" width="24" height="24"><use href="#icon-restart"/></svg>
                    </button>
                    <button class="media-control-btn audio-toggle muted" aria-label="Toggle sound">
                        <svg class="speaker-icon" viewBox="0 0 24 24" width="24" height="24"><use href="#icon-speaker"/></svg>
                        <svg class="mute-x" viewBox="0 0 24 24" width="24" height="24"><use href="#icon-mute-x"/></svg>
                    </button>
                    <button class="media-control-btn fullscreen-btn" aria-label="Fullscreen">
                        <svg class="fullscreen-enter" viewBox="0 0 24 24" width="24" height="24"><use href="#icon-fullscreen-enter"/></svg>
                        <svg class="fullscreen-exit" viewBox="0 0 24 24" width="24" height="24" style="display:none"><use href="#icon-fullscreen-exit"/></svg>
                    </button>
                </div>
            `;
        } else {
            mediaElement = `<img class="media-card-image" src="${mediaUrl}" alt="${incident.title}">`;
            videoControls = `
                <div class="media-controls">
                    <button class="media-control-btn fullscreen-btn" aria-label="Fullscreen">
                        <svg class="fullscreen-enter" viewBox="0 0 24 24" width="24" height="24"><use href="#icon-fullscreen-enter"/></svg>
                        <svg class="fullscreen-exit" viewBox="0 0 24 24" width="24" height="24" style="display:none"><use href="#icon-fullscreen-exit"/></svg>
                    </button>
                </div>
            `;
        }

        // Format incident date (when it occurred)
        const incidentDate = new Date(incident.date + 'T12:00:00');
        const incidentDateStr = incidentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const timestampLabel = App.getTimestampLabel(incident);
        const metaLine = timestampLabel ? `Occurred ${incidentDateStr}&nbsp;&nbsp;&nbsp;&nbsp;<span class="media-card-added">|&nbsp;&nbsp;&nbsp;&nbsp;${timestampLabel}</span>` : `Occurred ${incidentDateStr}`;

        return `
            <article class="media-card" role="button" tabindex="0">
                <div class="media-card-media">
                    ${mediaElement}
                    ${videoControls}
                </div>
                <div class="media-card-info">
                    <h3 class="media-card-title">${categoryPrefix}${incident.title}</h3>
                    <span class="media-card-timestamp">${metaLine}</span>
                </div>
            </article>
        `;
    },

    /**
     * Setup controls for a media card
     */
    setupCardControls(cardEl) {
        const video = cardEl.querySelector('.media-card-video');
        const image = cardEl.querySelector('.media-card-image');

        if (video) {
            this.setupVideoCardControls(cardEl, video);
        } else if (image) {
            this.setupImageCardControls(cardEl, image);
        }
    },

    /**
     * Setup video controls for a gallery card
     */
    setupVideoCardControls(cardEl, video) {
        const container = cardEl.querySelector('.media-card-media');

        // Spinner disabled - see renderCard() comment
        // const loadingOverlay = cardEl.querySelector('.video-loading-overlay');
        // if (loadingOverlay) {
        //     const hideOverlay = () => loadingOverlay.classList.add('hidden');
        //     video.addEventListener('canplay', hideOverlay, { once: true });
        //     if (video.readyState >= 3) hideOverlay();
        // }

        MediaControls.setupVideoControls({
            video,
            container,
            playPauseBtn: cardEl.querySelector('.play-pause-btn'),
            iconPlay: cardEl.querySelector('.media-icon-play'),
            iconPause: cardEl.querySelector('.media-icon-pause'),
            timeSlider: cardEl.querySelector('.time-slider'),
            restartBtn: cardEl.querySelector('.restart-btn'),
            audioToggle: cardEl.querySelector('.audio-toggle'),
            fullscreenBtn: cardEl.querySelector('.fullscreen-btn'),
            showEndedOverlay: false
        });
    },

    /**
     * Setup image controls for a gallery card
     */
    setupImageCardControls(cardEl, image) {
        const container = cardEl.querySelector('.media-card-media');

        MediaControls.setupImageControls({
            image,
            container,
            fullscreenBtn: cardEl.querySelector('.fullscreen-btn')
        });
    },

    /**
     * Mute all videos in the gallery
     */
    muteAll() {
        document.querySelectorAll('.media-card-video').forEach(video => {
            video.muted = true;
        });
        document.querySelectorAll('.media-card .audio-toggle').forEach(btn => {
            btn.classList.add('muted');
        });
    }
};
