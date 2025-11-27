/**
 * County Comparison & Performance Dashboard
 * Ranks all 47 Kenyan counties on development, agriculture, economy, and services
 * 
 * Data-driven devolution for fair budget allocation
 */

class CountyComparison {
    constructor() {
        // All 47 Kenyan counties with baseline data
        this.counties = this.initializeCounties();
    }

    /**
     * Initialize all 47 counties with simulated data
     */
    initializeCounties() {
        const counties = [
            { name: 'Nairobi', population: 4397073, area: 696 },
            { name: 'Mombasa', population: 1208333, area: 230 },
            { name: 'Kwale', population: 866820, area: 8270 },
            { name: 'Kilifi', population: 1453787, area: 12610 },
            { name: 'Tana River', population: 315943, area: 38437 },
            { name: 'Lamu', population: 143920, area: 6474 },
            { name: 'Taita Taveta', population: 340671, area: 17128 },
            { name: 'Garissa', population: 841353, area: 45720 },
            { name: 'Wajir', population: 781263, area: 56696 },
            { name: 'Mandera', population: 1025756, area: 26744 },
            { name: 'Marsabit', population: 459785, area: 66923 },
            { name: 'Isiolo', population: 268002, area: 25336 },
            { name: 'Meru', population: 1545714, area: 5235 },
            { name: 'Tharaka Nithi', population: 393177, area: 2609 },
            { name: 'Embu', population: 608599, area: 2818 },
            { name: 'Kitui', population: 1136187, area: 24385 },
            { name: 'Machakos', population: 1421932, area: 6281 },
            { name: 'Makueni', population: 987653, area: 8189 },
            { name: 'Nyandarua', population: 638289, area: 3245 },
            { name: 'Nyeri', population: 759164, area: 2361 },
            { name: 'Kirinyaga', population: 610411, area: 1478 },
            { name: 'Murang\'a', population: 1056640, area: 2325 },
            { name: 'Kiambu', population: 2417735, area: 2543 },
            { name: 'Turkana', population: 926976, area: 77000 },
            { name: 'West Pokot', population: 621241, area: 9064 },
            { name: 'Samburu', population: 310327, area: 20182 },
            { name: 'Trans Nzoia', population: 990341, area: 2469 },
            { name: 'Uasin Gishu', population: 1163186, area: 3345 },
            { name: 'Elgeyo Marakwet', population: 454480, area: 3049 },
            { name: 'Nandi', population: 885711, area: 2884 },
            { name: 'Baringo', population: 666763, area: 11015 },
            { name: 'Laikipia', population: 518560, area: 9229 },
            { name: 'Nakuru', population: 2162202, area: 7509 },
            { name: 'Narok', population: 1157873, area: 17944 },
            { name: 'Kajiado', population: 1117840, area: 21293 },
            { name: 'Kericho', population: 901777, area: 2454 },
            { name: 'Bomet', population: 875689, area: 2037 },
            { name: 'Kakamega', population: 1867579, area: 3033 },
            { name: 'Vihiga', population: 590013, area: 563 },
            { name: 'Bungoma', population: 1670570, area: 2206 },
            { name: 'Busia', population: 893681, area: 1694 },
            { name: 'Siaya', population: 993183, area: 2530 },
            { name: 'Kisumu', population: 1155574, area: 2086 },
            { name: 'Homa Bay', population: 1131950, area: 3154 },
            { name: 'Migori', population: 1116436, area: 2597 },
            { name: 'Kisii', population: 1266860, area: 1318 },
            { name: 'Nyamira', population: 605576, area: 899 }
        ];

        // Generate performance metrics for each county
        return counties.map(county => ({
            ...county,
            metrics: this.generateCountyMetrics(county)
        }));
    }

    /**
     * Generate performance metrics for a county
     */
    generateCountyMetrics(county) {
        // Simulate metrics based on county characteristics
        const isUrban = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu'].includes(county.name);
        const isArid = ['Turkana', 'Marsabit', 'Wajir', 'Garissa', 'Mandera', 'Samburu'].includes(county.name);

        return {
            // Infrastructure (roads, buildings detected by satellite)
            infrastructure: {
                score: isUrban ? (85 + Math.random() * 10) : isArid ? (30 + Math.random() * 15) : (50 + Math.random() * 25),
                roads: Math.floor((isUrban ? 2000 : isArid ? 200 : 800) + Math.random() * 500) + ' km',
                buildings: Math.floor((isUrban ? 50000 : isArid ? 5000 : 15000) + Math.random() * 10000),
                electricity: isUrban ? '85%' : isArid ? '15%' : '45%'
            },

            // Agriculture (NDVI, crop health)
            agriculture: {
                score: isArid ? (25 + Math.random() * 15) : (60 + Math.random() * 30),
                ndvi: isArid ? 0.2 + Math.random() * 0.15 : 0.5 + Math.random() * 0.3,
                cropHealth: isArid ? 'Poor' : Math.random() > 0.5 ? 'Good' : 'Fair',
                droughtRisk: isArid ? 'HIGH' : Math.random() > 0.7 ? 'MEDIUM' : 'LOW'
            },

            // Economic Activity (nighttime lights, GDP proxy)
            economy: {
                score: isUrban ? (80 + Math.random() * 15) : isArid ? (20 + Math.random() * 15) : (45 + Math.random() * 25),
                gdpContribution: isUrban ? '15%' : isArid ? '0.5%' : '2%',
                nightLights: isUrban ? 'High' : isArid ? 'Very Low' : 'Medium',
                businesses: Math.floor((isUrban ? 10000 : isArid ? 500 : 3000) + Math.random() * 2000)
            },

            // Environment (forest cover, water)
            environment: {
                score: isUrban ? (45 + Math.random() * 15) : isArid ? (30 + Math.random() * 20) : (65 + Math.random() * 25),
                forestCover: isUrban ? '5%' : isArid ? '2%' : '20%',
                waterAccess: isUrban ? '75%' : isArid ? '35%' : '55%'
            },

            // Services (schools, hospitals from satellite imagery)
            services: {
                score: isUrban ? (75 + Math.random() * 15) : isArid ? (25 + Math.random() * 20) : (50 + Math.random() * 25),
                schools: Math.floor((isUrban ? 500 : isArid ? 50 : 200) + Math.random() * 100),
                hospitals: Math.floor((isUrban ? 50 : isArid ? 5 : 15) + Math.random() * 10)
            }
        };
    }

    /**
     * Calculate County Development Index (CDI)
     */
    calculateCDI(county) {
        const weights = {
            infrastructure: 0.25,
            agriculture: 0.20,
            economy: 0.25,
            environment: 0.15,
            services: 0.15
        };

        const scores = county.metrics;
        const cdi = (
            scores.infrastructure.score * weights.infrastructure +
            scores.agriculture.score * weights.agriculture +
            scores.economy.score * weights.economy +
            scores.environment.score * weights.environment +
            scores.services.score * weights.services
        );

        return Math.round(cdi * 10) / 10;
    }

    /**
     * Rank all counties by development
     */
    rankCounties() {
        const rankedCounties = this.counties.map(county => ({
            name: county.name,
            population: county.population,
            cdi: this.calculateCDI(county),
            metrics: county.metrics
        }));

        // Sort by CDI descending
        rankedCounties.sort((a, b) => b.cdi - a.cdi);

        // Add ranks
        return rankedCounties.map((county, index) => ({
            rank: index + 1,
            ...county,
            tier: index < 10 ? 'TOP' : index < 37 ? 'MIDDLE' : 'BOTTOM',
            trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
        }));
    }

    /**
     * Compare two counties side-by-side
     */
    compareCounties(county1Name, county2Name) {
        const county1 = this.counties.find(c => c.name === county1Name);
        const county2 = this.counties.find(c => c.name === county2Name);

        if (!county1 || !county2) {
            throw new Error('County not found');
        }

        const cdi1 = this.calculateCDI(county1);
        const cdi2 = this.calculateCDI(county2);

        return {
            county1: {
                name: county1.name,
                population: county1.population,
                cdi: cdi1,
                metrics: county1.metrics
            },
            county2: {
                name: county2.name,
                population: county2.population,
                cdi: cdi2,
                metrics: county2.metrics
            },
            winner: cdi1 > cdi2 ? county1Name : county2Name,
            gap: Math.abs(cdi1 - cdi2).toFixed(1),
            insights: this.generateComparisonInsights(county1, county2, cdi1, cdi2)
        };
    }

    /**
     * Generate insights from comparison
     */
    generateComparisonInsights(c1, c2, cdi1, cdi2) {
        const insights = [];

        // Population comparison
        if (c1.population > c2.population * 2) {
            insights.push(`${c1.name} has ${Math.round(c1.population / c2.population)}x the population of ${c2.name}`);
        }

        // Infrastructure gap
        const infraDiff = c1.metrics.infrastructure.score - c2.metrics.infrastructure.score;
        if (Math.abs(infraDiff) > 20) {
            const better = infraDiff > 0 ? c1.name : c2.name;
            insights.push(`${better} has significantly better infrastructure`);
        }

        // Agriculture comparison
        const agriDiff = c1.metrics.agriculture.score - c2.metrics.agriculture.score;
        if (Math.abs(agriDiff) > 20) {
            const better = agriDiff > 0 ? c1.name : c2.name;
            insights.push(`${better} has better agricultural productivity`);
        }

        // Economy comparison
        const econDiff = c1.metrics.economy.score - c2.metrics.economy.score;
        if (Math.abs(econDiff) > 25) {
            const better = econDiff > 0 ? c1.name : c2.name;
            insights.push(`${better} has stronger economic activity`);
        }

        return insights;
    }

    /**
     * Generate fair budget allocation based on CDI
     */
    generateBudgetAllocation(totalBudget = 370000000000) { // KES 370B (example)
        const ranked = this.rankCounties();
        const allocations = [];

        // Equitable allocation formula
        // - Base allocation: Equal share for all (40%)
        // - Population-based: Based on population (30%)
        // - Development gap: More for bottom counties (30%)

        const baseAmount = (totalBudget * 0.40) / 47; // KES 3.15B per county
        const populationPool = totalBudget * 0.30;
        const developmentPool = totalBudget * 0.30;

        const totalPopulation = this.counties.reduce((sum, c) => sum + c.population, 0);

        ranked.forEach(county => {
            // Base allocation
            let allocation = baseAmount;

            // Population-based allocation
            const popRatio = county.population / totalPopulation;
            allocation += populationPool * popRatio;

            // Development gap allocation (inverse of CDI)
            const maxCDI = Math.max(...ranked.map(c => c.cdi));
            const developmentGap = (maxCDI - county.cdi) / maxCDI;
            allocation += developmentPool * (developmentGap / ranked.length);

            allocations.push({
                rank: county.rank,
                county: county.name,
                cdi: county.cdi,
                population: county.population,
                allocation: Math.round(allocation),
                perCapita: Math.round(allocation / county.population),
                tier: county.tier
            });
        });

        return {
            totalBudget: totalBudget,
            allocations: allocations,
            formula: {
                base: '40% equal share',
                population: '30% by population',
                development: '30% inverse of CDI (more for bottom counties)'
            },
            fairnessScore: this.calculateFairnessScore(allocations)
        };
    }

    /**
     * Calculate fairness score (lower variance = more fair)
     */
    calculateFairnessScore(allocations) {
        const perCapitaValues = allocations.map(a => a.perCapita);
        const mean = perCapitaValues.reduce((sum, val) => sum + val, 0) / perCapitaValues.length;
        const variance = perCapitaValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / perCapitaValues.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / mean;

        // Lower CV = more fair (0-0.2 = excellent, 0.2-0.4 = good, >0.4 = needs improvement)
        return {
            score: coefficientOfVariation < 0.2 ? 'EXCELLENT' : coefficientOfVariation < 0.4 ? 'GOOD' : 'NEEDS IMPROVEMENT',
            coefficient: coefficientOfVariation.toFixed(3),
            interpretation: 'Lower variation = more equitable distribution'
        };
    }

    /**
     * Get performance dashboard for all counties
     */
    getPerformanceDashboard() {
        const ranked = this.rankCounties();

        return {
            totalCounties: 47,
            lastUpdate: new Date().toISOString().split('T')[0],
            topPerformers: ranked.slice(0, 10),
            bottomPerformers: ranked.slice(-10).reverse(),
            allCounties: ranked,
            summary: {
                averageCDI: (ranked.reduce((sum, c) => sum + c.cdi, 0) / 47).toFixed(1),
                topCDI: ranked[0].cdi,
                bottomCDI: ranked[46].cdi,
                gap: (ranked[0].cdi - ranked[46].cdi).toFixed(1)
            },
            recommendations: this.getDashboardRecommendations(ranked)
        };
    }

    /**
     * Generate recommendations from dashboard
     */
    getDashboardRecommendations(ranked) {
        const bottom10 = ranked.slice(-10);
        const top10 = ranked.slice(0, 10);

        const recs = [];

        // Focus on bottom performers
        recs.push(`Bottom 10 counties need targeted development: ${bottom10.map(c => c.name).join(', ')}`);

        // Identify common challenges
        const aridCounties = bottom10.filter(c =>
            ['Turkana', 'Marsabit', 'Wajir', 'Garissa', 'Mandera'].includes(c.name)
        );

        if (aridCounties.length > 0) {
            recs.push(`${aridCounties.length} arid counties require drought interventions and water infrastructure`);
        }

        // Top performers
        recs.push(`Learn from top performers: ${top10.slice(0, 3).map(c => c.name).join(', ')}`);

        recs.push('Allocate 30% of development budget to bottom-performing counties');
        recs.push('Focus on infrastructure in counties with CDI < 40');

        return recs;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CountyComparison;
} else {
    window.CountyComparison = CountyComparison;
}
