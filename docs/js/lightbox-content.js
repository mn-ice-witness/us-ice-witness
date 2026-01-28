/**
 * lightbox-content.js - Lightbox Content Rendering
 *
 * Handles rendering content for the lightbox:
 * - Incident details with local media
 * - About page
 * - New/updated listings
 * - Video/image HTML generation
 *
 * Global: LightboxContent
 * Depends on: App (for incident data, media URLs), IncidentParser, marked (CDN)
 */

const LightboxContent = {
    /**
     * Trust level explanations
     */
    trustExplanations: {
        high: '3+ independent sources with video/photo evidence',
        medium: '2 sources or official statements',
        low: 'Single source or social media only',
        unverified: 'Reported but not yet confirmed'
    },

    /**
     * Get explanation for trust level
     */
    getTrustExplanation(level) {
        return this.trustExplanations[level] || '';
    },

    /**
     * Render local media (video or image) for an incident
     */
    renderLocalMedia(summaryData) {
        if (!summaryData || !summaryData.hasLocalMedia) return '';

        const posterUrl = summaryData.localMediaOgPath ? App.getMediaUrl(summaryData.localMediaOgPath, summaryData.mediaVersion) : '';

        const mediaFiles = summaryData.localMediaFiles || [];
        if (mediaFiles.length === 0) {
            const mediaUrl = App.getMediaUrl(summaryData.localMediaPath, summaryData.mediaVersion);
            if (summaryData.localMediaType === 'video') {
                return this.renderVideoElement(mediaUrl, posterUrl);
            } else if (summaryData.localMediaType === 'image') {
                return this.renderImageElement(mediaUrl);
            }
            return '';
        }

        let html = '';
        for (const media of mediaFiles) {
            const mediaUrl = App.getMediaUrl(media.path, summaryData.mediaVersion);
            if (media.type === 'video') {
                html += this.renderVideoElement(mediaUrl, posterUrl);
            } else if (media.type === 'image') {
                html += this.renderImageElement(mediaUrl);
            }
        }
        return html;
    },

    /**
     * Render a video element with controls
     */
    renderVideoElement(mediaUrl, posterUrl = '') {
        const posterAttr = posterUrl ? ` poster="${posterUrl}"` : '';
        return `
            <div class="local-media-container">
                <video class="local-media-video" autoplay muted playsinline disableRemotePlayback${posterAttr}>
                    <source src="${mediaUrl}" type="video/mp4">
                </video>
                <div class="video-loading-overlay"><div class="video-loading-spinner"></div></div>
                <div class="media-controls">
                    <button class="media-control-btn play-pause-btn" aria-label="Play/Pause">
                        <svg class="media-icon-pause" viewBox="0 0 24 24" width="24" height="24"><use href="#icon-pause"/></svg>
                        <svg class="media-icon-play" viewBox="0 0 24 24" width="24" height="24" style="display:none"><use href="#icon-play"/></svg>
                    </button>
                    <div class="time-slider-container">
                        <input type="range" class="time-slider" min="0" max="100" value="0" step="0.1" aria-label="Video progress">
                        <span class="time-display">0:00 / 0:00</span>
                    </div>
                    <button class="media-control-btn restart-btn" aria-label="Restart">
                        <svg viewBox="0 0 24 24" width="24" height="24"><use href="#icon-restart"/></svg>
                    </button>
                    <button class="media-control-btn audio-toggle muted" aria-label="Toggle sound">
                        <svg class="speaker-icon" viewBox="0 0 24 24" width="24" height="24"><use href="#icon-speaker"/></svg>
                        <svg class="mute-x" viewBox="0 0 24 24" width="24" height="24"><use href="#icon-mute-x"/></svg>
                    </button>
                    <button class="media-control-btn fullscreen-btn" aria-label="Toggle fullscreen">
                        <svg class="fullscreen-enter" viewBox="0 0 24 24" width="24" height="24"><use href="#icon-fullscreen-enter"/></svg>
                        <svg class="fullscreen-exit" viewBox="0 0 24 24" width="24" height="24" style="display:none"><use href="#icon-fullscreen-exit"/></svg>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render an image element with fullscreen control
     */
    renderImageElement(mediaUrl) {
        return `
            <div class="local-media-container local-media-container-image">
                <img class="local-media-image" src="${mediaUrl}" alt="Incident media">
                <div class="media-controls">
                    <button class="media-control-btn fullscreen-btn" aria-label="Toggle fullscreen">
                        <svg class="fullscreen-enter" viewBox="0 0 24 24" width="24" height="24"><use href="#icon-fullscreen-enter"/></svg>
                        <svg class="fullscreen-exit" viewBox="0 0 24 24" width="24" height="24" style="display:none"><use href="#icon-fullscreen-exit"/></svg>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Format timestamp for incident page display
     */
    formatTimestampForPage(isoTimestamp) {
        if (!isoTimestamp) return null;
        const date = new Date(isoTimestamp);
        if (isNaN(date.getTime())) return null;

        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12 || 12;

        return `${month} ${day}, ${hours}:${minutes}${ampm}`;
    },

    /**
     * Get upload/update info for incident page
     */
    getIncidentTimestampInfo(summaryData) {
        if (!summaryData) return { uploadLabel: null, updateLabel: null };

        const created = summaryData.created;
        const lastUpdated = summaryData.lastUpdated;

        let uploadLabel = null;
        let updateLabel = null;

        if (created) {
            uploadLabel = 'Added: ' + this.formatTimestampForPage(created);
        }

        // Show update time if different from created
        if (lastUpdated && created && lastUpdated !== created) {
            if (lastUpdated.includes('T')) {
                updateLabel = 'Updated: ' + this.formatTimestampForPage(lastUpdated);
            } else {
                const date = new Date(lastUpdated + 'T12:00:00');
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                const day = date.getDate();
                updateLabel = `Updated: ${month} ${day}`;
            }
        }

        return { uploadLabel, updateLabel };
    },

    /**
     * Render full incident content
     */
    renderIncident(incident, summaryData = null) {
        const shareButton = `
            <button class="share-btn" aria-label="Copy link to share">
                <svg class="share-icon" viewBox="0 0 24 24" width="16" height="16"><use href="#icon-link"/></svg>
                Copy Link
            </button>
        `;

        const localMedia = this.renderLocalMedia(summaryData);

        const timestampInfo = this.getIncidentTimestampInfo(summaryData);
        let timestampHtml = '';
        if (timestampInfo.uploadLabel || timestampInfo.updateLabel) {
            const parts = [];
            if (timestampInfo.uploadLabel) parts.push(timestampInfo.uploadLabel);
            if (timestampInfo.updateLabel) parts.push(timestampInfo.updateLabel);
            timestampHtml = `<div class="lightbox-timestamps">${parts.join(' · ')}</div>`;
        }

        const header = `
            <div class="lightbox-header">
                ${shareButton}
            </div>
            <div class="lightbox-meta">
                <span class="tag tag-type" data-type="${incident.type}">${IncidentParser.formatTypeLabel(incident.type)}</span>
                <span class="tag">${incident.location}</span>
                <span class="tag">${IncidentParser.formatDate(incident.date)}</span>
            </div>
            ${timestampHtml}
        `;

        const trustFooter = `
            <div class="incident-trust-footer">
                <svg class="trust-icon" viewBox="0 0 24 24" width="16" height="16"><use href="#icon-trust"/></svg>
                <span class="trust-badge trust-${incident.trustworthiness}">${incident.trustworthiness.toUpperCase()}</span>
                <span class="trust-explanation">${this.getTrustExplanation(incident.trustworthiness)}</span>
            </div>
        `;

        let bodyHtml = marked.parse(incident.body);
        bodyHtml = this.embedVideos(bodyHtml);

        // Insert local media after the H1 title
        bodyHtml = bodyHtml.replace(/(<\/h1>)/, `$1${localMedia}`);

        return header + bodyHtml + trustFooter;
    },

    /**
     * Embed YouTube videos from markdown links
     */
    embedVideos(html) {
        // [YouTube](https://www.youtube.com/watch?v=...)
        html = html.replace(
            /\[YouTube\]\((https:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+))\)/g,
            '<div class="incident-video"><iframe src="https://www.youtube.com/embed/$2" allowfullscreen></iframe></div>'
        );

        // [YouTube](https://youtu.be/...)
        html = html.replace(
            /\[YouTube\]\((https:\/\/youtu\.be\/([a-zA-Z0-9_-]+))\)/g,
            '<div class="incident-video"><iframe src="https://www.youtube.com/embed/$2" allowfullscreen></iframe></div>'
        );

        return html;
    },

    /**
     * Render new/updated listing content
     */
    renderNewUpdatedContent(dateStr, newIncidents, updatedIncidents) {
        const [month, day, year] = dateStr.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const formattedDate = `${monthNames[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;

        const truncateSummary = (text) => {
            if (!text) return '';
            if (text.length <= 200) return text;
            return text.substring(0, 197) + '...';
        };

        let html = `
            <div class="lightbox-header">
                <button class="share-btn" aria-label="Copy link to share">
                    <svg class="share-icon" viewBox="0 0 24 24" width="16" height="16"><use href="#icon-link"/></svg>
                    Copy Link
                </button>
            </div>
            <div class="new-updated-content">
                <h1>New & Updated Incidents</h1>
                <p class="new-updated-date">${formattedDate}</p>
        `;

        if (newIncidents.length > 0) {
            html += '<h2>New</h2><ul class="new-updated-list">';
            for (const incident of newIncidents) {
                const slug = ViewState.getIncidentId(incident);
                const type = Array.isArray(incident.type) ? incident.type[0] : incident.type;
                const label = App.categoryLabels[type] || type.toUpperCase();
                const summary = truncateSummary(incident.summary);
                html += `<li>
                    <a href="#${slug}" class="new-updated-link" data-slug="${slug}">
                        <span class="category-label">${label}:</span> ${incident.title}
                    </a>
                    <p class="new-updated-summary">${summary}</p>
                </li>`;
            }
            html += '</ul>';
        }

        if (updatedIncidents.length > 0) {
            html += '<h2>Updated</h2><ul class="new-updated-list">';
            for (const incident of updatedIncidents) {
                const slug = ViewState.getIncidentId(incident);
                const type = Array.isArray(incident.type) ? incident.type[0] : incident.type;
                const label = App.categoryLabels[type] || type.toUpperCase();
                const displayText = truncateSummary(incident.latestUpdate || incident.summary);
                html += `<li>
                    <a href="#${slug}" class="new-updated-link" data-slug="${slug}">
                        <span class="category-label">${label}:</span> ${incident.title}
                    </a>
                    <p class="new-updated-summary">${displayText}</p>
                </li>`;
            }
            html += '</ul>';
        }

        html += '</div>';
        return html;
    },

    /**
     * Render share button HTML
     */
    renderShareButton() {
        return `
            <div class="lightbox-header">
                <button class="share-btn" aria-label="Copy link to share">
                    <svg class="share-icon" viewBox="0 0 24 24" width="16" height="16"><use href="#icon-link"/></svg>
                    Copy Link
                </button>
            </div>
        `;
    }
};
