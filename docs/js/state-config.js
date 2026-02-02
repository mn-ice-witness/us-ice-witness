/**
 * State Configuration Module
 * Handles subdomain-based state routing and data fetching
 *
 * URL patterns:
 *   co.ice-witness.org/list, co.ice-witness.org/entry/xxx  → Colorado
 *   al.ice-witness.org/list, al.ice-witness.org/entry/xxx  → Alabama
 *   me.ice-witness.org/list, me.ice-witness.org/entry/xxx  → Maine
 *
 * State is detected from subdomain, not URL path.
 * Data is fetched from {state}-ice-witness.pages.dev
 */

// Detect if we're on a dev/preview deployment
// Dev deployments use dev.{state}-ice-witness.pages.dev for data
const isDevEnvironment = window.location.hostname.startsWith('dev.') ||
                         (window.location.hostname.endsWith('.pages.dev') &&
                          !window.location.hostname.match(/^[a-z]{2}-ice-witness\.pages\.dev$/));

// Build data URL for a state - uses dev prefix on dev environments
function buildStateDataUrl(stateCode) {
    // MN always uses production (mn-ice-witness.org is always available)
    if (stateCode === 'mn') {
        return 'https://mn-ice-witness.org';
    }
    // Other states use pages.dev with dev prefix when in dev environment
    const prefix = isDevEnvironment ? 'dev.' : '';
    return `https://${prefix}${stateCode}-ice-witness.pages.dev`;
}

const StateConfig = {
    // Available states and their data sources
    states: {
        'co': {
            code: 'CO',
            name: 'Colorado',
            dataUrl: buildStateDataUrl('co'),
            email: 'tips@ice-witness.org'
        },
        'al': {
            code: 'AL',
            name: 'Alabama',
            dataUrl: buildStateDataUrl('al'),
            email: 'tips@ice-witness.org'
        },
        'me': {
            code: 'ME',
            name: 'Maine',
            dataUrl: buildStateDataUrl('me'),
            email: 'tips@ice-witness.org'
        }
    },

    currentState: null,

    /**
     * Initialize - detect state from subdomain and apply config
     */
    init() {
        this.currentState = this.detectStateFromHostname();
        if (this.currentState) {
            this.applyConfig();
        }
        return this.currentState;
    },

    /**
     * Detect state from hostname (subdomain)
     * co.ice-witness.org → 'co'
     * al.ice-witness.org → 'al'
     * co-ice-witness.pages.dev → 'co'
     * dev.co-ice-witness.pages.dev → 'co'
     */
    detectStateFromHostname() {
        const hostname = window.location.hostname;

        // Pattern: {state}.ice-witness.org
        const subdomainMatch = hostname.match(/^([a-z]{2})\.ice-witness\.org$/i);
        if (subdomainMatch && this.states[subdomainMatch[1].toLowerCase()]) {
            return subdomainMatch[1].toLowerCase();
        }

        // Pattern: {state}-ice-witness.pages.dev or dev.{state}-ice-witness.pages.dev
        const pagesMatch = hostname.match(/^(?:dev\.)?([a-z]{2})-ice-witness\.pages\.dev$/i);
        if (pagesMatch && this.states[pagesMatch[1].toLowerCase()]) {
            return pagesMatch[1].toLowerCase();
        }

        // Localhost development - check for state in URL path as fallback
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            const pathMatch = window.location.pathname.match(/^\/([a-z]{2})\//i);
            if (pathMatch && this.states[pathMatch[1].toLowerCase()]) {
                return pathMatch[1].toLowerCase();
            }
        }

        return null;
    },

    /**
     * Get current state config
     */
    get() {
        return this.states[this.currentState];
    },

    /**
     * Get data URL for current state
     */
    getDataUrl() {
        const config = this.get();
        return config ? config.dataUrl : '';
    },

    /**
     * Get incidents summary URL for current state
     */
    getIncidentsSummaryUrl() {
        return `${this.getDataUrl()}/data/incidents-summary.json`;
    },

    /**
     * Get incident markdown URL
     */
    getIncidentUrl(slug) {
        // Incidents are stored by month folder
        // slug format: 2026-01-15-incident-name
        const match = slug.match(/^(\d{4}-\d{2})/);
        if (match) {
            return `${this.getDataUrl()}/incidents/${match[1]}/${slug}/index.md`;
        }
        return `${this.getDataUrl()}/incidents/${slug}/index.md`;
    },

    /**
     * Get media URL for current state
     */
    getMediaUrl(filename) {
        return `${this.getDataUrl()}/media/${filename}`;
    },

    /**
     * Apply state config to the page
     */
    applyConfig() {
        const config = this.get();
        if (!config) return;

        // Update page title
        document.title = `${config.code} ICE Witness - ICE Incidents in ${config.name}`;

        // Update header elements
        const stateCodeEl = document.getElementById('state-code');
        if (stateCodeEl) stateCodeEl.textContent = config.code + ' ';

        const stateNameEl = document.getElementById('state-name');
        if (stateNameEl) stateNameEl.textContent = config.name;

        // Update footer email
        const footerEmail = document.getElementById('footer-email');
        if (footerEmail) {
            footerEmail.href = `mailto:${config.email}`;
        }

        // Update meta tags
        const metaDesc = document.getElementById('meta-description');
        if (metaDesc) {
            metaDesc.content = `Up-to-date sourced listing of ICE and CBP civil rights incidents in ${config.name}. Each incident includes multiple news sources.`;
        }

        // Update canonical URL
        const canonical = document.getElementById('canonical-link');
        if (canonical) {
            canonical.href = `https://${this.currentState}.ice-witness.org/`;
        }

        // Update OG URL
        const ogUrl = document.getElementById('og-url');
        if (ogUrl) {
            ogUrl.content = `https://${this.currentState}.ice-witness.org/`;
        }
    }
};

// Export globally
window.StateConfig = StateConfig;
