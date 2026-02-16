/**
 * lightbox.js - Lightbox Modal Controller
 *
 * Handles the modal overlay for viewing content:
 * - Open/close with history management
 * - Incident detail views
 * - About page
 * - New/updated listings
 * - 404 handling
 *
 * Global: Lightbox
 * Depends on: App, Router, ViewState, LightboxContent, MediaControls, IncidentParser, marked
 */

const Lightbox = {
    element: null,
    bodyElement: null,
    currentSlug: null,
    currentIncidentData: null,
    savedScrollPositions: {},
    openedViaPushState: false,
    returnToNewUpdated: null,

    /**
     * Initialize lightbox
     */
    init() {
        this.element = document.getElementById('lightbox');
        this.bodyElement = document.getElementById('lightbox-body');

        this.element.querySelector('.lightbox-backdrop').addEventListener('click', () => this.close());
        this.element.querySelector('.lightbox-close').addEventListener('click', () => this.close());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });

        window.addEventListener('popstate', (e) => this.handlePopState(e));

        document.getElementById('about-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openAbout();
        });
    },

    /**
     * Handle browser back/forward
     */
    handlePopState(e) {
        if (e.state && e.state.lightbox) {
            if (e.state.slug === 'no-news-media') {
                this.showNoNewsMedia();
            } else if (e.state.slug === 'about' || Router.aboutSections.includes(e.state.slug)) {
                this.showAbout(e.state.slug === 'about' ? null : e.state.slug);
            } else if (e.state.slug && e.state.slug.startsWith('new-updated-')) {
                const dateStr = e.state.slug.replace('new-updated-', '');
                this.returnToNewUpdated = dateStr;
                this.showNewUpdated(dateStr);
            } else if (e.state.fromNewUpdated) {
                this.returnToNewUpdated = e.state.fromNewUpdated;
                this.showIncident(e.state.slug);
            } else if (e.state.slug) {
                this.returnToNewUpdated = null;
                this.showIncident(e.state.slug);
            }
        } else if (this.isOpen()) {
            const route = Router.parseUrl();
            if (route.type === 'about') {
                return;
            }
            if (route.type === 'no-news-media') {
                this.showNoNewsMedia();
                return;
            }
            this.closeLightbox();
        }
    },

    /**
     * Check if lightbox is open
     */
    isOpen() {
        return this.element.getAttribute('aria-hidden') === 'false';
    },

    /**
     * Get slug from file path
     */
    getSlugFromFilePath(filePath) {
        const filename = filePath.split('/').pop();
        return filename.replace('.md', '');
    },

    // ==================== OPEN METHODS ====================

    /**
     * Open incident detail view
     */
    async open(incident) {
        App.muteAllGalleryVideos();
        if (location.hostname === 'localhost') MediaGallery.pauseDownloads();
        this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentIncidentData = incident;
        this.currentSlug = this.getSlugFromFilePath(incident.filePath);
        const targetPath = Router.buildUrl('incident', this.currentSlug);

        if (window.location.pathname !== targetPath) {
            history.pushState({ lightbox: true, slug: this.currentSlug }, '', targetPath);
            this.openedViaPushState = true;
        } else {
            this.openedViaPushState = false;
        }

        await this.renderIncidentContent(incident);

        // Mark as viewed
        ViewState.markAsViewed(incident);
    },

    /**
     * Open about page
     */
    async openAbout(anchor) {
        this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = anchor || 'about';
        const targetPath = Router.buildUrl('about', anchor);

        if (window.location.pathname !== targetPath) {
            history.pushState({ lightbox: true, slug: this.currentSlug }, '', targetPath);
            this.openedViaPushState = true;
        } else {
            history.replaceState({ lightbox: true, slug: this.currentSlug }, '', targetPath);
            this.openedViaPushState = false;
        }

        await this.renderAboutContent();

        if (anchor) {
            const el = this.bodyElement.querySelector('#' + anchor);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    },

    /**
     * Open 404 not found view
     */
    open404(hash) {
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = hash;
        this.openedViaPushState = false;

        this.bodyElement.innerHTML = `
            <div class="not-found-content">
                <h1>Page Not Found</h1>
                <p>The incident "<strong>${hash}</strong>" doesn't exist or may have been removed.</p>
                <p><a href="#" class="not-found-home">\u2190 Return to home</a></p>
            </div>
        `;

        this.bodyElement.querySelector('.not-found-home').addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
        });
    },

    /**
     * Open new/updated listing
     */
    openNewUpdated(dateStr) {
        const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (!match) {
            this.open404InvalidDate(dateStr);
            return;
        }

        const [, month, day, year] = match;
        const datePrefix = `${year}-${month}-${day}`;

        const newIncidents = App.incidents.filter(i => i.created && i.created.startsWith(datePrefix));
        const updatedIncidents = App.incidents.filter(i =>
            i.lastUpdated && i.lastUpdated.startsWith(datePrefix) &&
            (!i.created || !i.created.startsWith(datePrefix))
        );

        if (newIncidents.length === 0 && updatedIncidents.length === 0) {
            this.openNoRecordsForDate(dateStr);
            return;
        }

        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = `new-updated-${dateStr}`;
        this.returnToNewUpdated = dateStr;

        if (window.location.hash !== '#' + this.currentSlug) {
            history.pushState({ lightbox: true, slug: this.currentSlug }, '', '#' + this.currentSlug);
            this.openedViaPushState = true;
        } else {
            history.replaceState({ lightbox: true, slug: this.currentSlug }, '', '#' + this.currentSlug);
            this.openedViaPushState = false;
        }

        this.bodyElement.innerHTML = LightboxContent.renderNewUpdatedContent(dateStr, newIncidents, updatedIncidents);
        this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());
        this.setupNewUpdatedLinks();
    },

    /**
     * Open no-news-media incidents page
     */
    openNoNewsMedia() {
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = 'no-news-media';
        const targetPath = Router.buildUrl('no-news-media');

        if (window.location.pathname !== targetPath) {
            history.pushState({ lightbox: true, slug: 'no-news-media' }, '', targetPath);
            this.openedViaPushState = true;
        } else {
            history.replaceState({ lightbox: true, slug: 'no-news-media' }, '', targetPath);
            this.openedViaPushState = false;
        }

        const noNewsMediaIncidents = App.getNoNewsMediaIncidents();
        this.bodyElement.innerHTML = this.renderNoNewsMediaContent(noNewsMediaIncidents);
        this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());
        this.setupNoNewsMediaLinks();
    },

    /**
     * Render no-news-media page content
     */
    renderNoNewsMediaContent(incidents) {
        const shareButton = LightboxContent.renderShareButton();

        let html = `
            ${shareButton}
            <div class="no-news-media-content">
                <h1>No News Media</h1>
                <p class="no-news-media-plea">These incidents currently have no news coverage (usually just social media posts). If you know of any, please <a href="mailto:mnicewitness@gmail.com">contact us</a>.</p>
        `;

        if (incidents.length === 0) {
            html += '<p class="no-news-media-empty">No incidents without news media coverage at this time.</p>';
        } else {
            html += '<ul class="no-news-media-list">';
            for (const incident of incidents) {
                const slug = App.getIncidentId(incident);
                const type = Array.isArray(incident.type) ? incident.type[0] : incident.type;
                const label = App.categoryLabels[type] || type.toUpperCase();
                const date = new Date(incident.date + 'T12:00:00');
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                html += `<li>
                    <a href="#${slug}" class="no-news-media-link" data-slug="${slug}">
                        <span class="category-label">${label}:</span> ${incident.title}
                    </a>
                    <p class="no-news-media-meta">${incident.location} &middot; ${dateStr}</p>
                    ${incident.summary ? `<p class="no-news-media-summary">${incident.summary}</p>` : ''}
                </li>`;
            }
            html += '</ul>';
        }

        html += '</div>';
        return html;
    },

    /**
     * Setup click handlers for no-news-media incident links
     */
    setupNoNewsMediaLinks() {
        this.bodyElement.querySelectorAll('.no-news-media-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const slug = link.dataset.slug;
                this.openIncidentBySlug(slug);
            });
        });
    },

    /**
     * Open invalid date error
     */
    open404InvalidDate(dateStr) {
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = `new-updated-${dateStr}`;
        this.openedViaPushState = false;

        this.bodyElement.innerHTML = `
            <div class="not-found-content">
                <h1>Invalid Date Format</h1>
                <p>The URL "<strong>#new-updated-${dateStr}</strong>" is not valid.</p>
                <p>Expected format: <code>#new-updated-MM-DD-YYYY</code></p>
                <p><a href="#" class="not-found-home">\u2190 Return to home</a></p>
            </div>
        `;

        this.bodyElement.querySelector('.not-found-home').addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
        });
    },

    /**
     * Open no records for date error
     */
    openNoRecordsForDate(dateStr) {
        const [month, day, year] = dateStr.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDate = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;

        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = `new-updated-${dateStr}`;
        this.openedViaPushState = false;

        this.bodyElement.innerHTML = `
            <div class="not-found-content">
                <h1>No Records Found</h1>
                <p>No posts were created or updated on <strong>${formattedDate}</strong>.</p>
                <p><a href="#" class="not-found-home">\u2190 Return to home</a></p>
            </div>
        `;

        this.bodyElement.querySelector('.not-found-home').addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
        });
    },

    // ==================== SHOW METHODS (for popstate) ====================

    /**
     * Show incident (for popstate)
     */
    async showIncident(slug) {
        const incident = App.incidents.find(i => {
            const incidentSlug = i.filePath.split('/').pop().replace('.md', '');
            return incidentSlug === slug;
        });

        if (incident) {
            this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
            this.element.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            this.currentIncidentData = incident;
            this.currentSlug = slug;

            await this.renderIncidentContent(incident);

            if (this.savedScrollPositions[slug]) {
                this.bodyElement.scrollTop = this.savedScrollPositions[slug];
                delete this.savedScrollPositions[slug];
            }
        } else {
            this.closeLightbox();
        }
    },

    /**
     * Show about (for popstate)
     */
    async showAbout(anchor) {
        this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = anchor || 'about';

        await this.renderAboutContent();

        // Prioritize saved scroll position (returning from incident), otherwise scroll to anchor
        // Use requestAnimationFrame to ensure DOM has rendered before scrolling
        requestAnimationFrame(() => {
            if (this.savedScrollPositions['about']) {
                this.bodyElement.scrollTop = this.savedScrollPositions['about'];
                delete this.savedScrollPositions['about'];
            } else if (anchor) {
                const el = this.bodyElement.querySelector('#' + anchor);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
        });
    },

    /**
     * Show new/updated listing (for popstate)
     */
    showNewUpdated(dateStr) {
        const match = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (!match) {
            this.closeLightbox();
            return;
        }

        const [, month, day, year] = match;
        const datePrefix = `${year}-${month}-${day}`;

        const newIncidents = App.incidents.filter(i => i.created && i.created.startsWith(datePrefix));
        const updatedIncidents = App.incidents.filter(i =>
            i.lastUpdated && i.lastUpdated.startsWith(datePrefix) &&
            (!i.created || !i.created.startsWith(datePrefix))
        );

        if (newIncidents.length === 0 && updatedIncidents.length === 0) {
            this.closeLightbox();
            return;
        }

        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = `new-updated-${dateStr}`;
        this.returnToNewUpdated = dateStr;

        this.bodyElement.innerHTML = LightboxContent.renderNewUpdatedContent(dateStr, newIncidents, updatedIncidents);
        this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());
        this.setupNewUpdatedLinks();

        if (this.savedScrollPositions[this.currentSlug]) {
            this.bodyElement.scrollTop = this.savedScrollPositions[this.currentSlug];
            delete this.savedScrollPositions[this.currentSlug];
        }
    },

    /**
     * Show no-news-media page (for popstate)
     */
    showNoNewsMedia() {
        this.element.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        this.currentSlug = 'no-news-media';

        const noNewsMediaIncidents = App.getNoNewsMediaIncidents();
        this.bodyElement.innerHTML = this.renderNoNewsMediaContent(noNewsMediaIncidents);
        this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());
        this.setupNoNewsMediaLinks();

        if (this.savedScrollPositions['no-news-media']) {
            this.bodyElement.scrollTop = this.savedScrollPositions['no-news-media'];
            delete this.savedScrollPositions['no-news-media'];
        }
    },

    // ==================== CLOSE METHODS ====================

    /**
     * Close lightbox (with history handling)
     */
    close() {
        if (this.isOpen()) {
            if (this.openedViaPushState) {
                history.back();
            } else {
                this.closeLightbox();
                const homeUrl = Router.buildUrlWithFilter('/', ViewState.sortByUpdated);
                history.replaceState(null, '', homeUrl);
            }
        }
    },

    /**
     * Close lightbox (without history handling)
     */
    closeLightbox() {
        const video = this.bodyElement.querySelector('.local-media-video');
        if (video) {
            video.pause();
            video.muted = true;
        }

        if (location.hostname === 'localhost') MediaGallery.resumeDownloads();

        this.element.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.currentSlug = null;
        this.currentIncidentData = null;
        this.savedScrollPositions = {};
        this.openedViaPushState = false;
        this.returnToNewUpdated = null;

        const route = Router.parseUrl();
        if (route.type === 'list') {
            // Preserve list view
        } else if (route.type !== 'home') {
            history.replaceState(null, '', '/');
        }
    },

    // ==================== CONTENT RENDERING ====================

    /**
     * Render incident content (fetches from state-specific URL)
     */
    async renderIncidentContent(incident) {
        // Build URL from state data source
        const baseUrl = window.StateConfig ? StateConfig.getDataUrl() : '';
        const response = await fetch(baseUrl + '/' + incident.filePath);
        const content = await response.text();
        const fullIncident = IncidentParser.parseIncident(content, incident.filePath);

        const html = LightboxContent.renderIncident(fullIncident, incident);
        this.bodyElement.innerHTML = html;

        this.setupMediaControls();
        this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());
        this.setupIncidentLinks();
    },

    /**
     * Render about content
     */
    async renderAboutContent() {
        // Fetch from state data source if available, otherwise local
        let content;
        const stateDataUrl = window.StateConfig?.getDataUrl();
        if (stateDataUrl) {
            try {
                const response = await fetch(`${stateDataUrl}/about.md`);
                if (response.ok) {
                    content = await response.text();
                }
            } catch (e) { /* fall through to local */ }
        }
        if (!content) {
            const response = await fetch('/about.md');
            content = await response.text();
        }

        const shareButton = LightboxContent.renderShareButton();
        const bodyHtml = marked.parse(content);
        this.bodyElement.innerHTML = shareButton + '<div class="about-content">' + bodyHtml + '</div>';

        this.bodyElement.querySelector('.share-btn')?.addEventListener('click', () => this.copyShareLink());
        this.setupAboutHeaderLinks();
        this.setupIncidentLinks();
        this.setupAboutScrollTracking();
    },

    // ==================== LINK HANDLERS ====================

    /**
     * Setup incident links in content
     * Handles both hash links (#slug) and path links (/entry/slug)
     */
    setupIncidentLinks() {
        // Handle hash links (#slug)
        this.bodyElement.querySelectorAll('a[href^="#"]').forEach(link => {
            if (link.classList.contains('header-link')) return;

            const slug = link.getAttribute('href').slice(1);
            if (slug && slug !== 'about' && slug !== this.currentSlug) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openIncidentBySlug(slug);
                });
            }
        });

        // Handle path-based links (/entry/slug)
        this.bodyElement.querySelectorAll('a[href^="/entry/"]').forEach(link => {
            const href = link.getAttribute('href');
            const slug = href.replace('/entry/', '');
            if (slug && slug !== this.currentSlug) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openIncidentBySlug(slug);
                });
            }
        });
    },

    /**
     * Setup new/updated listing links
     */
    setupNewUpdatedLinks() {
        this.bodyElement.querySelectorAll('.new-updated-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const slug = link.dataset.slug;
                this.openIncidentFromNewUpdated(slug);
            });
        });
    },

    /**
     * Setup about page header anchor links
     */
    setupAboutHeaderLinks() {
        this.bodyElement.querySelectorAll('.header-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = link.getAttribute('href')?.slice(1);
                if (id) {
                    const url = window.location.origin + Router.buildUrl('about', id);
                    navigator.clipboard.writeText(url);
                    history.replaceState({ lightbox: true, slug: id }, '', Router.buildUrl('about', id));
                    this.currentSlug = id;
                    link.classList.add('copied');
                    setTimeout(() => link.classList.remove('copied'), 1500);
                }
            });
        });
    },

    /**
     * Setup about page scroll tracking
     */
    setupAboutScrollTracking() {
        this.bodyElement.addEventListener('scroll', () => {
            const scrollTop = this.bodyElement.scrollTop;
            const route = Router.parseUrl();

            if (scrollTop < 100) {
                if (route.type === 'about' && route.section) {
                    history.replaceState({ lightbox: true, slug: 'about' }, '', Router.buildUrl('about'));
                    this.currentSlug = 'about';
                }
                return;
            }

            const sections = this.bodyElement.querySelectorAll('[id]');
            let currentSection = 'about';
            for (const section of sections) {
                if (section.offsetTop <= scrollTop + 150) {
                    if (Router.aboutSections.includes(section.id)) {
                        currentSection = section.id;
                    }
                }
            }

            if (this.currentSlug !== currentSection) {
                const newPath = currentSection === 'about' ? Router.buildUrl('about') : Router.buildUrl('about', currentSection);
                history.replaceState({ lightbox: true, slug: currentSection }, '', newPath);
                this.currentSlug = currentSection;
            }
        });
    },

    /**
     * Open incident by slug
     */
    async openIncidentBySlug(slug) {
        if (this.currentSlug) {
            // About page and its sections should all save under 'about'
            const isAboutPage = this.currentSlug === 'about' || Router.aboutSections.includes(this.currentSlug);
            const saveKey = isAboutPage ? 'about' : this.currentSlug;
            this.savedScrollPositions[saveKey] = this.bodyElement.scrollTop;
        }

        const incident = App.incidents.find(i => {
            const incidentSlug = i.filePath.split('/').pop().replace('.md', '');
            return incidentSlug === slug;
        });

        if (incident) {
            await this.open(incident);
        }
    },

    /**
     * Open incident from new/updated listing
     */
    async openIncidentFromNewUpdated(slug) {
        this.savedScrollPositions[this.currentSlug] = this.bodyElement.scrollTop;

        const incident = App.incidents.find(i => App.getIncidentId(i) === slug);
        if (incident) {
            this.bodyElement.innerHTML = '<div class="table-loading">Loading...</div>';
            this.currentIncidentData = incident;
            this.currentSlug = slug;

            history.pushState({ lightbox: true, slug: slug, fromNewUpdated: this.returnToNewUpdated }, '', '#' + slug);
            this.openedViaPushState = true;

            await this.renderIncidentContent(incident);
        }
    },

    // ==================== MEDIA & SHARE ====================

    /**
     * Setup media controls
     */
    setupMediaControls() {
        this.setupVideoControls();
        this.setupImageControls();
    },

    /**
     * Setup video controls in lightbox
     */
    setupVideoControls() {
        const video = this.bodyElement.querySelector('.local-media-video');
        if (!video) return;

        const container = video.closest('.local-media-container');
        const loadingOverlay = container?.querySelector('.video-loading-overlay');

        // Hide loading overlay when video can play
        if (loadingOverlay) {
            const hideOverlay = () => loadingOverlay.classList.add('hidden');
            video.addEventListener('canplay', hideOverlay, { once: true });
            if (video.readyState >= 3) hideOverlay();
        }

        MediaControls.setupVideoControls({
            video,
            container,
            playPauseBtn: this.bodyElement.querySelector('.play-pause-btn'),
            iconPlay: this.bodyElement.querySelector('.media-icon-play'),
            iconPause: this.bodyElement.querySelector('.media-icon-pause'),
            timeSlider: this.bodyElement.querySelector('.time-slider'),
            timeDisplay: this.bodyElement.querySelector('.time-display'),
            restartBtn: this.bodyElement.querySelector('.restart-btn'),
            audioToggle: this.bodyElement.querySelector('.audio-toggle'),
            fullscreenBtn: this.bodyElement.querySelector('.fullscreen-btn'),
            showEndedOverlay: true
        });
    },

    /**
     * Setup image controls in lightbox
     */
    setupImageControls() {
        const image = this.bodyElement.querySelector('.local-media-image');
        if (!image) return;

        const container = image.closest('.local-media-container');

        MediaControls.setupImageControls({
            image,
            container,
            fullscreenBtn: container?.querySelector('.fullscreen-btn')
        });
    },

    /**
     * Copy share link to clipboard
     */
    copyShareLink() {
        let url;
        if (this.currentSlug === 'no-news-media') {
            url = window.location.origin + Router.buildUrl('no-news-media');
        } else if (this.currentSlug === 'about' || Router.aboutSections.includes(this.currentSlug)) {
            url = window.location.origin + Router.buildUrl('about', this.currentSlug === 'about' ? null : this.currentSlug);
        } else if (this.currentSlug && this.currentSlug.startsWith('new-updated-')) {
            url = window.location.origin + '/#' + this.currentSlug;
        } else {
            url = window.location.origin + Router.buildUrl('incident', this.currentSlug);
        }

        navigator.clipboard.writeText(url).then(() => {
            const btn = this.bodyElement.querySelector('.share-btn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('copied');
            }, 2000);
        });
    }
};
