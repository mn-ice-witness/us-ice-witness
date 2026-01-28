/**
 * router.js - URL Routing Module
 *
 * Handles path-based URL routing with legacy hash URL support.
 * Builds clean URLs like /entry/slug, /about/section, /list/category.
 *
 * Global: Router
 * Depends on: Nothing (standalone, but uses App.aboutSections at runtime)
 */

const Router = {
    // Section hashes for list view categories
    sectionHashes: ['citizens', 'observers', 'immigrants', 'schools', 'response'],

    // About page section anchors
    aboutSections: ['federal-position', 'the-data', 'what-this-site-documents', 'purpose', 'sources-used', 'investigations', 'operation-parris', 'trustworthiness', 'legal-observation'],

    /**
     * Get current state prefix for URLs
     * @returns {string} State prefix like '/mn' or empty string
     */
    getStatePrefix() {
        if (window.StateConfig && StateConfig.currentState) {
            return '/' + StateConfig.currentState;
        }
        return '';
    },

    /**
     * Build a clean path-based URL with state prefix
     * @param {string} type - 'incident', 'about', 'list', 'media', 'unverified', or 'home'
     * @param {string|null} slug - Optional slug/section/category
     * @returns {string} URL path
     */
    buildUrl(type, slug = null) {
        const prefix = this.getStatePrefix();
        switch (type) {
            case 'incident':
                return `${prefix}/entry/${slug}`;
            case 'about':
                return slug ? `${prefix}/about/${slug}` : `${prefix}/about`;
            case 'list':
                return slug ? `${prefix}/list/${slug}` : `${prefix}/list`;
            case 'media':
                return `${prefix}/media`;
            case 'new-updated':
                return `${prefix}/new-updated/${slug}`;
            case 'unverified':
                return `${prefix}/unverified`;
            case 'home':
            default:
                return prefix || '/';
        }
    },

    /**
     * Strip state prefix from path (e.g., '/mn/list' -> '/list')
     * @param {string} path - URL path
     * @returns {string} Path without state prefix
     */
    stripStatePrefix(path) {
        const match = path.match(/^\/([a-z]{2})(\/.*)?$/i);
        if (match && window.StateConfig && StateConfig.states[match[1].toLowerCase()]) {
            return match[2] || '/';
        }
        return path;
    },

    /**
     * Parse current URL into a route object
     * Supports both path-based URLs and legacy hash URLs
     * @param {URL|Location} url - URL to parse (defaults to window.location)
     * @returns {Object} Route object with type, slug/section/category, filter, and legacy flag
     */
    parseUrl(url = window.location) {
        const rawPath = url.pathname;
        const path = this.stripStatePrefix(rawPath);
        const hash = url.hash.slice(1);
        const filter = this.parseFilter(url);

        // Check path-based routes first
        if (path.startsWith('/entry/')) {
            return { type: 'incident', slug: path.replace('/entry/', ''), filter };
        }
        if (path.startsWith('/about')) {
            const section = path.replace('/about', '').replace(/^\//, '') || null;
            return { type: 'about', section, filter };
        }
        if (path.startsWith('/list')) {
            const category = path.replace('/list', '').replace(/^\//, '') || null;
            return { type: 'list', category, filter };
        }
        if (path === '/media') {
            return { type: 'media', filter };
        }
        if (path.startsWith('/new-updated/')) {
            return { type: 'new-updated', dateStr: path.replace('/new-updated/', ''), filter };
        }
        if (path.startsWith('/summaries/')) {
            // Convert YYYY-MM-DD to MM-DD-YYYY for lightbox
            const isoDate = path.replace('/summaries/', '').replace(/\/$/, '');
            const parts = isoDate.split('-');
            if (parts.length === 3) {
                const dateStr = `${parts[1]}-${parts[2]}-${parts[0]}`;
                return { type: 'new-updated', dateStr, filter };
            }
        }
        if (path === '/unverified') {
            return { type: 'unverified', filter };
        }

        // Fall back to hash-based routes for backwards compatibility
        if (hash) {
            if (hash === 'about' || this.aboutSections.includes(hash)) {
                return { type: 'about', section: hash === 'about' ? null : hash, legacy: true, filter };
            }
            if (hash === 'list') {
                return { type: 'list', category: null, legacy: true, filter };
            }
            if (this.sectionHashes.includes(hash)) {
                return { type: 'list', category: hash, legacy: true, filter };
            }
            if (hash === 'media') {
                return { type: 'media', legacy: true, filter };
            }
            if (hash.startsWith('new-updated-')) {
                return { type: 'new-updated', dateStr: hash.replace('new-updated-', ''), legacy: true, filter };
            }
            // Assume it's an incident slug
            return { type: 'incident', slug: hash, legacy: true, filter };
        }

        // Default to home
        return { type: 'home', filter };
    },

    /**
     * Parse filter parameter from URL
     * @param {URL|Location} url - URL to parse
     * @returns {string|null} Filter value or null
     */
    parseFilter(url = window.location) {
        const params = new URLSearchParams(url.search);
        return params.get('filter');
    },

    /**
     * Check if new/updated filter is active in URL
     * @param {URL|Location} url - URL to check
     * @returns {boolean}
     */
    hasNewFilter(url = window.location) {
        return this.parseFilter(url) === 'new';
    },

    /**
     * Build URL with optional filter parameter
     * @param {string} basePath - The base path
     * @param {boolean} includeFilter - Whether to include ?filter=new
     * @returns {string}
     */
    buildUrlWithFilter(basePath, includeFilter) {
        return includeFilter ? `${basePath}?filter=new` : basePath;
    },

    /**
     * Redirect legacy hash URLs to clean path URLs
     * @param {Object} route - Route object from parseUrl
     */
    upgradeLegacyUrl(route) {
        if (!route.legacy) return;

        let newPath;
        switch (route.type) {
            case 'incident':
                newPath = this.buildUrl('incident', route.slug);
                break;
            case 'about':
                newPath = this.buildUrl('about', route.section);
                break;
            case 'list':
                newPath = this.buildUrl('list', route.category);
                break;
            case 'media':
                newPath = this.buildUrl('media');
                break;
            case 'new-updated':
                newPath = this.buildUrl('new-updated', route.dateStr);
                break;
            default:
                newPath = '/';
        }
        history.replaceState(null, '', newPath);
    }
};
