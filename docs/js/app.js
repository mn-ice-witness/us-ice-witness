/**
 * app.js - Main Application Controller
 *
 * Coordinates all modules and handles:
 * - Initialization and data loading
 * - Search/filter logic
 * - List view rendering
 * - Route handling
 *
 * Global: App
 * Depends on: Router, ViewState, Splash, MediaGallery, Lightbox, Search, IncidentParser
 */

const App = {
    incidents: [],
    isScrollingToSection: false,

    // Category labels for display
    categoryLabels: {
        'citizens': 'CITIZENS',
        'observers': 'OBSERVERS',
        'immigrants': 'IMMIGRANTS',
        'schools-hospitals': 'SCHOOLS',
        'response': 'RESPONSE',
        'fatal': 'FATAL'
    },

    // Section configuration - populated from HTML on init
    sections: [],

    // Read section titles/descriptions from HTML (single source of truth)
    initSections() {
        // Maps data type -> HTML element ID
        const typeToId = {
            'citizens': 'citizens',
            'observers': 'observers',
            'immigrants': 'immigrants',
            'schools-hospitals': 'schools',
            'response': 'response'
        };
        this.sections = Object.entries(typeToId).map(([type, id]) => {
            const el = document.getElementById(id);
            if (!el) return { type, title: type, desc: '' };
            return {
                type,
                title: el.querySelector('.section-title')?.textContent || type,
                desc: el.querySelector('.section-desc')?.textContent || ''
            };
        });
    },

    // Delegate to Router
    get sectionHashes() { return Router.sectionHashes; },
    get aboutSections() { return Router.aboutSections; },

    /**
     * Initialize the application
     */
    async init() {
        // Load state configuration first
        if (window.StateConfig) {
            await window.StateConfig.init();
        }
        this.initSections();
        await this.loadIncidents();

        // Initialize modules
        ViewState.init();
        Lightbox.init();
        Splash.init();

        // Setup section navigation
        this.initSectionNav();
        this.initScrollUrlClear();

        // Set scroll offset CSS variable and update on resize
        this.updateScrollOffset();
        window.addEventListener('resize', () => this.updateScrollOffset());

        // Handle initial route
        this.handleInitialRoute();

        // Sync URL with filter state
        ViewState.syncUrlWithFilterState();

        // Render based on route
        const route = Router.parseUrl();
        if (route.type === 'list' || route.category) {
            ViewState.switchView('list', true);
        } else if (route.type === 'media') {
            ViewState.switchView('media', true);
        } else {
            ViewState.switchView(ViewState.getPreferredView(), true);
        }

        // Preload strategies tested and removed - browser handles video loading natively
        // via scroll-to-play triggering video.play() at 40% visibility
    },

    /**
     * Load incidents from JSON (fetches from state-specific URL)
     */
    async loadIncidents() {
        const url = window.StateConfig ? StateConfig.getIncidentsSummaryUrl() : '/data/incidents-summary.json';
        const response = await fetch(url);
        const data = await response.json();
        this.incidents = data.incidents || [];
        this.updateStats();
    },

    /**
     * Update stats ribbon
     */
    updateStats() {
        const totalEl = document.getElementById('total-incidents');
        const fatalEl = document.getElementById('fatal-count');

        if (totalEl) totalEl.textContent = this.incidents.length;
        if (fatalEl) {
            const fatal = this.incidents.filter(i =>
                (Array.isArray(i.type) && i.type.includes('fatal')) || i.type === 'fatal'
            ).length;
            fatalEl.textContent = fatal;
        }
    },

    // ==================== ROUTING ====================

    /**
     * Delegate URL building to Router
     */
    buildUrl(type, slug) {
        return Router.buildUrl(type, slug);
    },

    /**
     * Delegate URL parsing to Router
     */
    parseUrl(url) {
        return Router.parseUrl(url);
    },

    /**
     * Handle initial route on page load
     */
    handleInitialRoute() {
        const route = Router.parseUrl();
        Router.upgradeLegacyUrl(route);

        // Redirect bare '/' to preferred view
        if (route.type === 'home') {
            const preferredView = ViewState.getPreferredView();
            const newPath = Router.buildUrl(preferredView);
            history.replaceState(null, '', newPath);
            route.type = preferredView;
        }

        this.openFromRoute(route);
    },

    /**
     * Open content based on route
     */
    openFromRoute(route) {
        // Handle filter=new param (applies to any route type)
        if (route.filter === 'new') {
            ViewState.enableSortByUpdated();
        }

        switch (route.type) {
            case 'incident':
                const incident = this.incidents.find(i => {
                    const slug = i.filePath.split('/').pop().replace('.md', '');
                    return slug === route.slug;
                });
                if (incident) {
                    Lightbox.open(incident);
                } else {
                    Lightbox.open404(route.slug);
                }
                break;

            case 'about':
                Lightbox.openAbout(route.section);
                break;

            case 'new-updated':
                Lightbox.openNewUpdated(route.dateStr);
                break;

            case 'no-news-media':
                Lightbox.openNoNewsMedia();
                break;

            case 'list':
                ViewState.switchView('list', true);
                if (route.category) {
                    ViewState.disableSortByUpdated();
                    this.scrollToSection(route.category);
                }
                break;

            case 'media':
                ViewState.switchView('media', true);
                break;

            case 'home':
            default:
                break;
        }
    },

    /**
     * Get total height of sticky elements at top of page
     * Calculates dynamically based on rendered elements
     */
    getStickyOffset() {
        let offset = 0;
        const viewToggle = document.querySelector('.view-toggle');
        const sectionNav = document.querySelector('.section-nav');
        if (viewToggle) offset += viewToggle.offsetHeight;
        if (sectionNav && getComputedStyle(sectionNav).position === 'sticky') {
            offset += sectionNav.offsetHeight;
        }
        return offset;
    },

    /**
     * Update CSS custom property for scroll-padding-top
     */
    updateScrollOffset() {
        const offset = this.getStickyOffset();
        document.documentElement.style.setProperty('--scroll-offset', offset + 'px');
    },

    /**
     * Scroll to a section in list view
     * Maps URL category names to section type IDs (e.g., 'schools' -> 'schools-hospitals')
     * Sets isScrollingToSection flag to prevent scroll listener from clearing URL during programmatic scroll
     */
    scrollToSection(category) {
        const sectionId = this.categoryToSectionId(category);
        this.isScrollingToSection = true;
        setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (!el) return;
            const offset = this.getStickyOffset();
            const targetY = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: targetY, behavior: 'smooth' });
            setTimeout(() => { this.isScrollingToSection = false; }, 1500);
        }, 100);
    },

    /**
     * Map URL category to section type ID
     */
    categoryToSectionId(category) {
        if (category === 'schools') return 'schools-hospitals';
        return category;
    },

    // ==================== SEARCH & FILTER ====================

    /**
     * Simple stemmer for search
     */
    stem(word) {
        if (word.length <= 4) return word;
        return word
            .replace(/ies$/i, 'y')
            .replace(/ied$/i, 'y')
            .replace(/es$/i, '')
            .replace(/ed$/i, '')
            .replace(/ing$/i, '')
            .replace(/s$/i, '');
    },

    /**
     * Get filtered incidents based on search query (excludes no-news-media)
     */
    getFilteredIncidents() {
        const query = (typeof Search !== 'undefined' && Search.query) ? Search.query.toLowerCase().trim() : '';
        // Filter out no-news-media incidents from main display
        const verified = this.incidents.filter(i => i.trustworthiness !== 'no-news-media');
        if (!query) return verified;

        const terms = query.split(/\s+/).filter(t => t.length > 0);
        const stemmedTerms = terms.map(t => this.stem(t));

        return verified.filter(incident => {
            const searchText = [
                incident.title,
                incident.summary,
                incident.location,
                incident.city
            ].join(' ').toLowerCase();

            const words = searchText.match(/\b\w+\b/g) || [];
            const stemmedWords = new Set(words.map(w => this.stem(w)));

            return stemmedTerms.every(stemmedTerm => stemmedWords.has(stemmedTerm));
        });
    },

    /**
     * Get no-news-media incidents sorted by update date
     */
    getNoNewsMediaIncidents() {
        return this.incidents
            .filter(i => i.trustworthiness === 'no-news-media')
            .sort((a, b) => {
                const dateA = a.lastUpdated || a.created || a.date;
                const dateB = b.lastUpdated || b.created || b.date;
                return dateB.localeCompare(dateA);
            });
    },

    // ==================== INCIDENT HELPERS ====================

    /**
     * Get incident ID from incident object
     */
    getIncidentId(incident) {
        return incident.filePath.split('/').pop().replace('.md', '');
    },

    /**
     * Get media URL with optional version for cache busting
     * Prepends state-specific data URL
     */
    getMediaUrl(path, version) {
        if (!path) return path;
        const baseUrl = window.StateConfig ? StateConfig.getDataUrl() : '';
        const cleanPath = path.startsWith('/') ? path : '/' + path;
        const fullPath = baseUrl + cleanPath;
        return version ? `${fullPath}?v=${version}` : fullPath;
    },

    /**
     * Mute all gallery videos (when opening lightbox)
     */
    muteAllGalleryVideos() {
        MediaGallery.muteAll();
    },

    // ==================== RENDERING ====================

    /**
     * Render media gallery (delegates to MediaGallery)
     */
    renderMediaGallery() {
        MediaGallery.render();
    },

    /**
     * Initialize section navigation
     */
    initSectionNav() {
        const nav = document.getElementById('section-nav');
        if (!nav) return;

        nav.querySelectorAll('.nav-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                const href = pill.getAttribute('href');

                // Handle no-news-media link specially
                if (href === '/no-news-media') {
                    Lightbox.openNoNewsMedia();
                    return;
                }

                const section = href.slice(1);

                // Ensure list view
                if (ViewState.currentView !== 'list') {
                    ViewState.switchView('list', true);
                }

                // Disable sort by updated for category navigation
                ViewState.disableSortByUpdated();

                // Update URL
                history.replaceState({}, '', Router.buildUrl('list', section));

                // Scroll to section
                this.scrollToSection(section);
            });
        });

        // Handle dropdown (for narrow phones)
        const dropdown = document.getElementById('category-dropdown');
        if (dropdown) {
            dropdown.addEventListener('change', (e) => {
                const value = e.target.value;
                if (!value) return;

                const section = value.slice(1);

                // Ensure list view
                if (ViewState.currentView !== 'list') {
                    ViewState.switchView('list', true);
                }

                // Disable sort by updated for category navigation
                ViewState.disableSortByUpdated();

                // Update URL
                history.replaceState({}, '', Router.buildUrl('list', section));

                // Scroll to section
                this.scrollToSection(section);

                // Reset dropdown to placeholder
                e.target.value = '';
            });
        }
    },

    /**
     * Clear category from URL when user scrolls manually
     */
    initScrollUrlClear() {
        window.addEventListener('scroll', () => {
            if (this.isScrollingToSection || ViewState.currentView !== 'list') return;
            const route = Router.parseUrl();
            if (route.type === 'list' && route.category) {
                history.replaceState({}, '', Router.buildUrl('list'));
            }
        }, { passive: true });
    },

    /**
     * Render the incident list
     */
    render() {
        const container = document.getElementById('list-view');
        if (!container) return;

        const filtered = this.getFilteredIncidents();

        // Update search result count
        const countEl = document.querySelector('.search-results-count');
        if (countEl && Search.query) {
            countEl.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`;
        }

        // Clear existing sections
        container.querySelectorAll('.incident-section').forEach(el => el.remove());

        // Sort by updated if enabled
        if (ViewState.sortByUpdated) {
            const sorted = [...filtered].sort((a, b) => {
                const dateA = a.lastUpdated || a.date;
                const dateB = b.lastUpdated || b.date;
                return dateB.localeCompare(dateA);
            });
            this.renderFlatList(container, sorted);
            return;
        }

        // Group by type and render sections
        this.sections.forEach(section => {
            const sectionIncidents = filtered.filter(i => {
                const types = Array.isArray(i.type) ? i.type : [i.type];
                return types.includes(section.type);
            });

            if (sectionIncidents.length === 0) return;

            const sectionEl = document.createElement('section');
            sectionEl.id = section.type;
            sectionEl.className = 'incident-section';
            sectionEl.innerHTML = `
                <header class="section-header" role="button" tabindex="0" aria-expanded="true">
                    <div class="section-marker marker-${section.type}"></div>
                    <div class="section-header-content">
                        <h2 class="section-title">${section.title} <span class="section-count">(${sectionIncidents.length})</span></h2>
                        <p class="section-desc">${section.desc}</p>
                    </div>
                    <svg class="section-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </header>
                <div class="incident-table">
                    ${sectionIncidents.map(i => this.renderRow(i)).join('')}
                </div>
            `;

            container.appendChild(sectionEl);
        });

        this.setupRowHandlers(container);
        this.setupSectionCollapseHandlers(container);
    },

    /**
     * Render flat list (sorted by updated)
     */
    renderFlatList(container, incidents) {
        const section = document.createElement('section');
        section.className = 'incident-section flat-list';
        section.innerHTML = `
            <div class="incident-table">
                ${incidents.map(i => this.renderRow(i, true)).join('')}
            </div>
        `;
        container.appendChild(section);
        this.setupRowHandlers(container);
    },

    /**
     * Format date for display (e.g., "Jan 25")
     */
    formatDate(isoTimestamp) {
        if (!isoTimestamp) return null;
        const date = new Date(isoTimestamp.includes('T') ? isoTimestamp : isoTimestamp + 'T12:00:00');
        if (isNaN(date.getTime())) return null;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    /**
     * Get upload/update label for an incident (date only, no time)
     */
    getTimestampLabel(incident) {
        const created = incident.created;
        const lastUpdated = incident.lastUpdated;

        if (lastUpdated && created && lastUpdated !== created) {
            return 'Updated ' + this.formatDate(lastUpdated);
        }

        if (created) {
            return 'Added ' + this.formatDate(created);
        }

        return null;
    },

    /**
     * Render a single incident row
     */
    renderRow(incident, showCategory = false) {
        const id = this.getIncidentId(incident);
        const viewed = ViewState.isViewed(incident);

        const types = Array.isArray(incident.type) ? incident.type : [incident.type];
        const primaryType = types[0];
        const label = this.categoryLabels[primaryType] || primaryType.toUpperCase();

        const categoryPrefix = showCategory ? `<span class="category-label">${label}:</span> ` : '';

        const mediaIcon = incident.hasLocalMedia ? `
            <svg class="media-icon" viewBox="0 0 24 24" width="16" height="16"><use href="#icon-camera"/></svg>
        ` : '';

        const incidentDate = new Date(incident.date + 'T12:00:00');
        const incidentDateStr = incidentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const timestampLabel = this.getTimestampLabel(incident);
        const metaLine = timestampLabel ? `Occurred ${incidentDateStr}&nbsp;&nbsp;&nbsp;&nbsp;<span class="row-added">|&nbsp;&nbsp;&nbsp;&nbsp;${timestampLabel}</span>` : `Occurred ${incidentDateStr}`;

        return `
            <article class="incident-row${viewed ? ' viewed' : ''}" data-incident-id="${id}" role="button" tabindex="0">
                <div class="row-content">
                    <h3 class="row-title">${categoryPrefix}${incident.title}</h3>
                    <span class="row-timestamp">${metaLine}</span>
                </div>
                <div class="row-meta">
                    ${mediaIcon}
                </div>
            </article>
        `;
    },

    /**
     * Setup click handlers for rows
     */
    setupRowHandlers(container) {
        container.querySelectorAll('.incident-row').forEach(row => {
            const id = row.dataset.incidentId;
            const incident = this.incidents.find(i => this.getIncidentId(i) === id);

            if (incident) {
                row.addEventListener('click', () => Lightbox.open(incident));
                row.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        Lightbox.open(incident);
                    }
                });
            }
        });
    },

    /**
     * Setup collapse/expand handlers for section headers
     */
    setupSectionCollapseHandlers(container) {
        container.querySelectorAll('.section-header').forEach(header => {
            const toggleCollapse = () => {
                const section = header.closest('.incident-section');
                const isCollapsed = section.classList.toggle('collapsed');
                header.setAttribute('aria-expanded', !isCollapsed);
            };

            header.addEventListener('click', toggleCollapse);
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCollapse();
                }
            });
        });
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
