const IncidentParser = {
    parseFrontMatter(content) {
        const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = content.match(frontMatterRegex);

        if (!match) {
            return { meta: {}, body: content };
        }

        const frontMatter = match[1];
        const body = content.slice(match[0].length).trim();
        const meta = {};

        frontMatter.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) return;

            const key = line.slice(0, colonIndex).trim();
            const value = line.slice(colonIndex + 1).trim();
            meta[key] = value;
        });

        return { meta, body };
    },

    extractSummary(body) {
        const summaryMatch = body.match(/## Summary\n+([\s\S]*?)(?=\n## |$)/);
        if (summaryMatch) {
            return summaryMatch[1].trim().split('\n')[0];
        }

        const firstParagraph = body.split('\n\n')[0];
        if (firstParagraph && !firstParagraph.startsWith('#')) {
            return firstParagraph.replace(/^#.*\n/, '').trim();
        }

        return '';
    },

    extractTitle(body) {
        const titleMatch = body.match(/^# (.+)$/m);
        return titleMatch ? titleMatch[1].trim() : 'Untitled Incident';
    },

    parseIncident(content, filePath) {
        const { meta, body } = this.parseFrontMatter(content);
        const title = this.extractTitle(body);
        const summary = this.extractSummary(body);

        return {
            filePath,
            title,
            summary,
            body,
            date: meta.date || 'Unknown',
            time: meta.time || 'unknown',
            location: meta.location || 'Unknown location',
            city: meta.city || 'Minneapolis',
            type: meta.type || 'unknown',
            status: meta.status || 'unknown',
            affectedIndividualCitizenship: meta.affected_individual_citizenship || 'unknown',
            injuries: meta.injuries || 'unknown',
            trustworthiness: meta.trustworthiness || 'unverified',
            lastUpdated: meta.last_updated || meta.date || 'Unknown'
        };
    },

    formatTypeLabel(type) {
        const labels = {
            'citizens': 'Citizen/Resident',
            'observers': 'Observer/Protester',
            'immigrants': 'Immigrant',
            'schools-hospitals': 'Schools/Hospitals',
            'response': 'Official Response'
        };
        return labels[type] || type;
    },

    formatCitizenshipLabel(citizenship) {
        const labels = {
            'us-citizen': 'Citizen',
            'legal-resident': 'Legal Resident',
            'asylum-seeker': 'Immigrant Pending Status',
            'undocumented': 'Immigrant',
            'unknown': ''
        };
        return labels[citizenship] || citizenship;
    },

    formatTrustLabel(trust) {
        const labels = {
            'high': 'High Trust',
            'medium': 'Medium Trust',
            'low': 'Low Trust',
            'unverified': 'Unverified'
        };
        return labels[trust] || trust;
    },

    formatDate(dateStr) {
        if (!dateStr || dateStr === 'Unknown') return dateStr;
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
};
