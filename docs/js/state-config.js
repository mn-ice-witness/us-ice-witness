/**
 * State Configuration Module
 * Handles URL-based state routing and data fetching
 *
 * URL patterns:
 *   /mn/list, /mn/entry/xxx  → Minnesota
 *   /co/list, /co/entry/xxx  → Colorado
 *   /al/list, /al/entry/xxx  → Alabama
 *   / or /list               → Default to first state (MN)
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
        'mn': {
            code: 'MN',
            name: 'Minnesota',
            dataUrl: buildStateDataUrl('mn'),
            email: 'mnicewitness@gmail.com'
        },
        'co': {
            code: 'CO',
            name: 'Colorado',
            dataUrl: buildStateDataUrl('co'),
            email: 'tips@us-ice-witness.org'
        },
        'al': {
            code: 'AL',
            name: 'Alabama',
            dataUrl: buildStateDataUrl('al'),
            email: 'tips@us-ice-witness.org'
        },
        'me': {
            code: 'ME',
            name: 'Maine',
            dataUrl: buildStateDataUrl('me'),
            email: 'tips@us-ice-witness.org'
        },
        'wa': {
            code: 'WA',
            name: 'Washington',
            dataUrl: buildStateDataUrl('wa'),
            email: 'tips@us-ice-witness.org'
        }
    },

    defaultState: 'mn',
    currentState: null,

    /**
     * Initialize - detect state from URL and apply config
     */
    init() {
        this.currentState = this.detectStateFromUrl();
        this.applyConfig();
        this.setupStateSelector();
        return this.currentState;
    },

    /**
     * Detect state from URL path
     * /mn/list → 'mn', /co/entry/xxx → 'co', / → default
     */
    detectStateFromUrl() {
        const path = window.location.pathname;
        const match = path.match(/^\/([a-z]{2})\//i);
        if (match && this.states[match[1].toLowerCase()]) {
            return match[1].toLowerCase();
        }
        return this.defaultState;
    },

    /**
     * Get current state config
     */
    get() {
        return this.states[this.currentState] || this.states[this.defaultState];
    },

    /**
     * Get data URL for current state
     */
    getDataUrl() {
        return this.get().dataUrl;
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

        // Update page title
        document.title = `${config.code} ICE Witness - ICE Incidents in ${config.name}`;

        // Update header elements
        const stateCodeEl = document.getElementById('state-code');
        if (stateCodeEl) stateCodeEl.textContent = config.code;

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
    },

    /**
     * Setup state selector dropdown
     */
    setupStateSelector() {
        const selector = document.getElementById('state-selector');
        if (!selector) return;

        // Clear existing options and rebuild
        selector.innerHTML = '<option value="">Other States</option>';

        Object.entries(this.states).forEach(([key, state]) => {
            const option = document.createElement('option');
            option.value = `/${key}/list`;
            option.textContent = state.code;
            if (key === this.currentState) {
                option.disabled = true;
                option.textContent = `${state.code} (current)`;
            }
            selector.appendChild(option);
        });

        // Handle state selection - navigate to that state
        selector.addEventListener('change', (e) => {
            if (e.target.value) {
                window.location.href = e.target.value;
            }
            e.target.selectedIndex = 0;
        });
    },

    /**
     * Build URL for a route within current state
     */
    buildUrl(route) {
        return `/${this.currentState}${route}`;
    }
};

// Export globally
window.StateConfig = StateConfig;
