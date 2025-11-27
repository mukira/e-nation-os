/**
 * GeoIntel Search Functionality
 * Fast, intelligent search across all GeoIntel features
 */

class GeoIntelSearch {
    constructor() {
        this.searchIndex = this.buildSearchIndex();
        this.searchHistory = this.loadSearchHistory();
    }

    /**
     * Build search index for fast lookups
     */
    buildSearchIndex() {
        const index = {
            counties: [
                'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta',
                'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka Nithi',
                'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
                'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia',
                'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru',
                'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
                'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'
            ],
            features: [
                { name: 'Tax Revenue Intelligence', keywords: ['tax', 'revenue', 'untaxed', 'property', 'business', 'mining', 'money'], module: 'revenue' },
                { name: 'Drought Risk Assessment', keywords: ['drought', 'dry', 'rain', 'water', 'famine', 'food', 'ndvi'], module: 'agriculture' },
                { name: 'Fire Detection', keywords: ['fire', 'wildfire', 'burn', 'smoke', 'flames'], module: 'disaster' },
                { name: 'Flood Monitoring', keywords: ['flood', 'flooding', 'water', 'river', 'overflow'], module: 'disaster' },
                { name: 'Landslide Risk', keywords: ['landslide', 'mudslide', 'slope', 'erosion'], module: 'disaster' },
                { name: 'Deforestation Alerts', keywords: ['deforestation', 'logging', 'forest', 'trees', 'clearance'], module: 'environment' },
                { name: 'Wildlife Corridors', keywords: ['wildlife', 'animals', 'corridor', 'conservation', 'elephant', 'lion'], module: 'environment' },
                { name: 'Carbon Stock', keywords: ['carbon', 'co2', 'climate', 'emissions', 'credits'], module: 'environment' },
                { name: 'Border Security', keywords: ['border', 'security', 'somalia', 'ethiopia', 'uganda', 'crossing'], module: 'border' },
                { name: 'County Comparison', keywords: ['county', 'rank', 'compare', 'performance', 'development'], module: 'comparison' },
                { name: 'Executive Dashboard', keywords: ['dashboard', 'executive', 'president', 'kpi', 'summary'], module: 'executive' }
            ],
            cities: [
                { name: 'Nairobi', county: 'Nairobi', lat: -1.2921, lon: 36.8219 },
                { name: 'Mombasa', county: 'Mombasa', lat: -4.0435, lon: 39.6682 },
                { name: 'Kisumu', county: 'Kisumu', lat: -0.0917, lon: 34.7680 },
                { name: 'Nakuru', county: 'Nakuru', lat: -0.3031, lon: 36.0800 },
                { name: 'Eldoret', county: 'Uasin Gishu', lat: 0.5143, lon: 35.2698 },
                { name: 'Thika', county: 'Kiambu', lat: -1.0332, lon: 37.0691 },
                { name: 'Malindi', county: 'Kilifi', lat: -3.2167, lon: 40.1167 }
            ],
            forests: [
                { name: 'Mau Forest Complex', area: 400000, county: 'Multiple' },
                { name: 'Mt. Kenya Forest', area: 199200, county: 'Nyeri' },
                { name: 'Aberdare Forest', area: 76700, county: 'Nyandarua' },
                { name: 'Kakamega Forest', area: 24000, county: 'Kakamega' }
            ],
            parks: [
                { name: 'Maasai Mara', county: 'Narok' },
                { name: 'Tsavo East', county: 'Taita Taveta' },
                { name: 'Tsavo West', county: 'Taita Taveta' },
                { name: 'Amboseli', county: 'Kajiado' }
            ]
        };

        return index;
    }

    /**
     * Search across all categories
     */
    search(query) {
        if (!query || query.length < 2) {
            return { results: [], suggestions: this.getPopularSearches() };
        }

        const lowerQuery = query.toLowerCase().trim();
        const results = [];

        // Search counties
        this.searchIndex.counties.forEach(county => {
            if (county.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'county',
                    name: county,
                    match: 'County',
                    action: () => this.loadCounty(county),
                    icon: '📍'
                });
            }
        });

        // Search features
        this.searchIndex.features.forEach(feature => {
            const nameMatch = feature.name.toLowerCase().includes(lowerQuery);
            const keywordMatch = feature.keywords.some(kw => kw.includes(lowerQuery));

            if (nameMatch || keywordMatch) {
                results.push({
                    type: 'feature',
                    name: feature.name,
                    match: 'Feature',
                    module: feature.module,
                    action: () => this.loadFeature(feature.module),
                    icon: this.getFeatureIcon(feature.module)
                });
            }
        });

        // Search cities
        this.searchIndex.cities.forEach(city => {
            if (city.name.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'city',
                    name: city.name,
                    match: `City in ${city.county}`,
                    coordinates: { lat: city.lat, lon: city.lon },
                    action: () => this.loadCity(city),
                    icon: '🏙️'
                });
            }
        });

        // Search forests
        this.searchIndex.forests.forEach(forest => {
            if (forest.name.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'forest',
                    name: forest.name,
                    match: `Forest - ${(forest.area / 1000).toFixed(0)}K ha`,
                    action: () => this.loadForest(forest),
                    icon: '🌳'
                });
            }
        });

        // Search parks
        this.searchIndex.parks.forEach(park => {
            if (park.name.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'park',
                    name: park.name,
                    match: `National Park in ${park.county}`,
                    action: () => this.loadPark(park),
                    icon: '🦁'
                });
            }
        });

        // Save to history
        if (results.length > 0) {
            this.saveSearch(query);
        }

        return {
            query: query,
            results: results,
            count: results.length,
            suggestions: results.length === 0 ? this.getSuggestions(lowerQuery) : []
        };
    }

    /**
     * Get feature icon
     */
    getFeatureIcon(module) {
        const icons = {
            'revenue': '💰',
            'agriculture': '🌾',
            'disaster': '🚨',
            'environment': '🌳',
            'border': '🛡️',
            'comparison': '📊',
            'executive': '📈'
        };
        return icons[module] || '🔍';
    }

    /**
     * Get search suggestions
     */
    getSuggestions(query) {
        const suggestions = [
            'Try searching for: Nairobi, Mombasa, Turkana',
            'Search features: drought, fire, flood, tax revenue',
            'Find forests: Mau Forest, Mt. Kenya, Kakamega',
            'Check parks: Maasai Mara, Tsavo, Amboseli'
        ];

        // Smart suggestions based on partial input
        if (query.startsWith('d')) {
            return ['Did you mean: Drought, Disaster, Deforestation?'];
        } else if (query.startsWith('f')) {
            return ['Did you mean: Fire, Flood, Forest?'];
        } else if (query.startsWith('t')) {
            return ['Did you mean: Tax Revenue, Turkana, Tsavo?'];
        }

        return suggestions;
    }

    /**
     * Get popular searches
     */
    getPopularSearches() {
        return [
            { query: 'Nairobi revenue', icon: '💰' },
            { query: 'Turkana drought', icon: '🌾' },
            { query: 'Mau Forest', icon: '🌳' },
            { query: 'Border security', icon: '🛡️' },
            { query: 'County comparison', icon: '📊' }
        ];
    }

    /**
     * Load county data
     */
    loadCounty(county) {
        console.log(`Loading ${county} data...`);
        // Trigger county selection in GeoIntel
        if (window.switchModule) {
            window.switchModule('agriculture');
            const countySelect = document.getElementById('agriCounty');
            if (countySelect) {
                countySelect.value = county;
                countySelect.dispatchEvent(new Event('change'));
            }
        }
    }

    /**
     * Load feature module
     */
    loadFeature(module) {
        console.log(`Loading ${module} module...`);
        if (window.switchModule) {
            window.switchModule(module);
        }
    }

    /**
     * Load city
     */
    loadCity(city) {
        console.log(`Loading ${city.name}...`);
        // Center map on city if map exists
        if (window.map) {
            window.map.flyTo([city.lat, city.lon], 12);
        }
    }

    /**
     * Load forest
     */
    loadForest(forest) {
        console.log(`Loading ${forest.name}...`);
        if (window.switchModule) {
            window.switchModule('environment');
            const forestSelect = document.getElementById('forestSelect');
            if (forestSelect) {
                forestSelect.value = forest.name;
            }
        }
    }

    /**
     * Load park
     */
    loadPark(park) {
        console.log(`Loading ${park.name}...`);
        // Load park on map
    }

    /**
     * Save search to history
     */
    saveSearch(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            if (this.searchHistory.length > 10) {
                this.searchHistory.pop();
            }
            localStorage.setItem('geointel_search_history', JSON.stringify(this.searchHistory));
        }
    }

    /**
     * Load search history
     */
    loadSearchHistory() {
        try {
            const history = localStorage.getItem('geointel_search_history');
            return history ? JSON.parse(history) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Clear search history
     */
    clearHistory() {
        this.searchHistory = [];
        localStorage.removeItem('geointel_search_history');
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeoIntelSearch;
} else {
    window.GeoIntelSearch = GeoIntelSearch;
}
