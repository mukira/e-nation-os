/**
 * Historical Data Viewer
 * View satellite imagery and data from 2015-2024
 * Track changes over time with before/after comparisons
 */

class HistoricalDataViewer {
    constructor() {
        this.availableYears = this.generateYearRange(2015, 2024);
        this.currentYear = 2024;
        this.currentMonth = new Date().getMonth() + 1;
    }

    /**
     * Generate year range
     */
    generateYearRange(start, end) {
        const years = [];
        for (let year = start; year <= end; year++) {
            years.push(year);
        }
        return years;
    }

    /**
     * Get historical satellite imagery for a location
     */
    async getHistoricalImagery(location, year, month) {
        console.log(`Fetching ${year}-${month} imagery for ${location}...`);

        // In production: Query Google Earth Engine or Sentinel Archive
        // For now: Simulate historical data

        return {
            location: location,
            date: `${year}-${String(month).padStart(2, '0')}-01`,
            year: year,
            month: month,
            imagery: {
                satellite: 'Sentinel-2',
                resolution: '10m',
                cloudCover: Math.floor(Math.random() * 30) + '%',
                available: true,
                url: `sentinel://archive/${year}/${month}/${location}`
            },
            metadata: {
                acquisitionDate: `${year}-${String(month).padStart(2, '0')}-${Math.floor(Math.random() * 28) + 1}`,
                sensor: 'MSI (Multispectral Instrument)',
                bands: 13
            }
        };
    }

    /**
     * Get historical NDVI data (vegetation health)
     */
    async getHistoricalNDVI(county, year) {
        console.log(`Fetching ${year} NDVI data for ${county}...`);

        // Simulate NDVI trend over the year
        const monthlyNDVI = [];
        const baseNDVI = 0.5 + Math.random() * 0.2;

        for (let month = 1; month <= 12; month++) {
            // Seasonal variation
            const seasonal = Math.sin((month - 3) * Math.PI / 6) * 0.15;
            const variation = (Math.random() - 0.5) * 0.1;
            const ndvi = Math.max(0.2, Math.min(0.8, baseNDVI + seasonal + variation));

            monthlyNDVI.push({
                month: month,
                monthName: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
                ndvi: parseFloat(ndvi.toFixed(3)),
                interpretation: ndvi > 0.6 ? 'Healthy' : ndvi > 0.4 ? 'Moderate' : 'Stressed',
                rainfall: Math.floor(Math.random() * 200) + 50 + ' mm'
            });
        }

        return {
            county: county,
            year: year,
            monthlyData: monthlyNDVI,
            yearlyAverage: parseFloat((monthlyNDVI.reduce((sum, m) => sum + m.ndvi, 0) / 12).toFixed(3)),
            trend: this.calculateTrend(monthlyNDVI.map(m => m.ndvi)),
            comparison: await this.compareWithPreviousYear(county, year)
        };
    }

    /**
     * Compare current year with previous year
     */
    async compareWithPreviousYear(county, currentYear) {
        if (currentYear <= 2015) return null;

        const prevData = await this.getHistoricalNDVI(county, currentYear - 1);
        const currData = await this.getHistoricalNDVI(county, currentYear);

        const change = currData.yearlyAverage - prevData.yearlyAverage;
        const percentChange = (change / prevData.yearlyAverage) * 100;

        return {
            previousYear: currentYear - 1,
            previousAverage: prevData.yearlyAverage,
            currentYear: currentYear,
            currentAverage: currData.yearlyAverage,
            change: parseFloat(change.toFixed(3)),
            percentChange: parseFloat(percentChange.toFixed(1)) + '%',
            trend: change > 0.05 ? 'IMPROVING' : change < -0.05 ? 'DECLINING' : 'STABLE',
            interpretation: change > 0 ? 'Vegetation health improved' : 'Vegetation health declined'
        };
    }

    /**
     * Get historical deforestation data
     */
    async getHistoricalDeforestation(forest, startYear, endYear) {
        console.log(`Analyzing deforestation in ${forest} from ${startYear} to ${endYear}...`);

        const yearlyData = [];
        let cumulativeLoss = 0;

        for (let year = startYear; year <= endYear; year++) {
            const annualLoss = Math.floor(Math.random() * 500) + 100; // hectares
            cumulativeLoss += annualLoss;

            yearlyData.push({
                year: year,
                annualLoss: annualLoss,
                cumulativeLoss: cumulativeLoss,
                causes: this.simulateDeforestationCauses(),
                severity: annualLoss > 400 ? 'HIGH' : annualLoss > 250 ? 'MEDIUM' : 'LOW'
            });
        }

        return {
            forest: forest,
            period: `${startYear}-${endYear}`,
            totalYears: endYear - startYear + 1,
            yearlyData: yearlyData,
            totalLoss: cumulativeLoss,
            averageAnnualLoss: Math.floor(cumulativeLoss / (endYear - startYear + 1)),
            trend: this.calculateTrend(yearlyData.map(d => d.annualLoss)),
            recommendations: this.generateForestRecommendations(yearlyData)
        };
    }

    /**
     * Before/After comparison
     */
    async getBeforeAfterComparison(location, beforeYear, afterYear) {
        console.log(`Comparing ${location}: ${beforeYear} vs ${afterYear}...`);

        const before = await this.getHistoricalImagery(location, beforeYear, 6); // June
        const after = await this.getHistoricalImagery(location, afterYear, 6);

        // Detect changes
        const changes = this.detectChanges(beforeYear, afterYear);

        return {
            location: location,
            before: {
                year: beforeYear,
                imagery: before
            },
            after: {
                year: afterYear,
                imagery: after
            },
            timespan: afterYear - beforeYear + ' years',
            changes: changes,
            summary: this.summarizeChanges(changes)
        };
    }

    /**
     * Detect changes between two years
     */
    detectChanges(beforeYear, afterYear) {
        const changeTypes = [
            { type: 'Urban Expansion', area: Math.floor(Math.random() * 500) + 100, impact: 'HIGH' },
            { type: 'Forest Loss', area: Math.floor(Math.random() * 300) + 50, impact: 'MEDIUM' },
            { type: 'New Roads', length: Math.floor(Math.random() * 50) + 10 + ' km', impact: 'MEDIUM' },
            { type: 'Agriculture Expansion', area: Math.floor(Math.random() * 1000) + 200, impact: 'MEDIUM' },
            { type: 'New Buildings', count: Math.floor(Math.random() * 500) + 100, impact: 'LOW' }
        ];

        // Select 2-4 changes randomly
        const numChanges = Math.floor(Math.random() * 3) + 2;
        return changeTypes.slice(0, numChanges).map(change => ({
            ...change,
            confidence: Math.floor(Math.random() * 15 + 85) + '%'
        }));
    }

    /**
     * Summarize changes
     */
    summarizeChanges(changes) {
        const highImpact = changes.filter(c => c.impact === 'HIGH').length;
        const mediumImpact = changes.filter(c => c.impact === 'MEDIUM').length;

        let summary = `${changes.length} major changes detected. `;

        if (highImpact > 0) {
            summary += `${highImpact} high-impact changes require attention. `;
        }

        return summary;
    }

    /**
     * Get historical timeline for a location
     */
    async getTimeline(location, startYear, endYear) {
        const timeline = [];

        for (let year = startYear; year <= endYear; year++) {
            const imagery = await this.getHistoricalImagery(location, year, 6);
            timeline.push({
                year: year,
                imagery: imagery,
                snapshot: `${location} in ${year}`
            });
        }

        return {
            location: location,
            period: `${startYear}-${endYear}`,
            totalYears: timeline.length,
            timeline: timeline,
            playback: 'Use slider to view year-by-year changes'
        };
    }

    /**
     * Calculate trend direction
     */
    calculateTrend(values) {
        if (values.length < 2) return 'UNKNOWN';

        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));

        const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

        const change = ((secondAvg - firstAvg) / firstAvg) * 100;

        if (change > 5) return 'INCREASING';
        if (change < -5) return 'DECREASING';
        return 'STABLE';
    }

    /**
     * Simulate deforestation causes
     */
    simulateDeforestationCauses() {
        const causes = [
            { cause: 'Illegal Logging', percentage: 40 },
            { cause: 'Agriculture Encroachment', percentage: 30 },
            { cause: 'Charcoal Production', percentage: 20 },
            { cause: 'Infrastructure Development', percentage: 10 }
        ];

        return causes;
    }

    /**
     * Generate forest recommendations
     */
    generateForestRecommendations(yearlyData) {
        const recentTrend = this.calculateTrend(yearlyData.slice(-3).map(d => d.annualLoss));
        const recs = [];

        if (recentTrend === 'INCREASING') {
            recs.push('URGENT: Deforestation is accelerating - deploy enforcement teams');
            recs.push('Increase ranger patrols in high-loss sectors');
        } else if (recentTrend === 'STABLE') {
            recs.push('Maintain current protection measures');
        } else {
            recs.push('Conservation efforts are working - continue current approach');
        }

        recs.push('Use satellite monitoring to detect illegal activity early');

        return recs;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoricalDataViewer;
} else {
    window.HistoricalDataViewer = HistoricalDataViewer;
}
