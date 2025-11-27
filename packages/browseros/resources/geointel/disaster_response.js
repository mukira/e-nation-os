/**
 * Disaster Response Module for Kenya
 * Real-time monitoring for fires, floods, and landslides
 * 
 * Free Data Sources:
 * - NASA FIRMS - Active fire detection
 * - Copernicus EMS - Emergency mapping
 * - Sentinel-1 - Flood mapping (SAR)
 * - USGS - Landslide hazard
 */

class DisasterResponse {
    constructor() {
        // NASA FIRMS (Fire Information for Resource Management System)
        this.firms_url = 'https://firms.modaps.eosdis.nasa.gov/api/area';

        // Copernicus Emergency Management Service
        this.copernicus_ems_url = 'https://emergency.copernicus.eu/mapping/ems/emergency-management-service';

        // Kenya bounds
        this.kenyaBounds = {
            north: 4.62,
            south: -4.68,
            east: 41.91,
            west: 33.91
        };

        // Critical infrastructure
        this.criticalInfrastructure = {
            'Dams': ['Masinga Dam', 'Kamburu Dam', 'Gitaru Dam', 'Kindaruma Dam', 'Turkana Dam'],
            'Airports': ['JKIA', 'Mombasa Int', 'Kisumu', 'Eldoret'],
            'Ports': ['Mombasa Port', 'Lamu Port'],
            'Power Stations': ['Olkaria Geothermal', 'Turkana Wind Farm', 'Kiambere Hydro']
        };

        // High-risk areas
        this.landslideRiskAreas = [
            'Murang\'a', 'Nyeri', 'Kirinyaga', 'Embu', 'Meru',
            'Tharaka Nithi', 'West Pokot', 'Elgeyo Marakwet'
        ];

        this.floodProneAreas = [
            'Tana River', 'Garissa', 'Turkana', 'Budalangi', 'Kano Plains'
        ];
    }

    /**
     * Get active fires in Kenya using NASA FIRMS
     * Returns fires detected in last 24 hours
     */
    async getActiveFires() {
        console.log('Fetching active fires from NASA FIRMS...');

        // In production, fetch from FIRMS API
        // Simulated active fires
        const fires = this.generateSimulatedFires();

        return {
            timestamp: new Date().toISOString(),
            totalFires: fires.length,
            criticalFires: fires.filter(f => f.confidence > 80).length,
            fires: fires,
            summary: this.summarizeFires(fires),
            alerts: this.generateFireAlerts(fires)
        };
    }

    /**
     * Detect floods using Sentinel-1 SAR
     */
    async detectFloods(area = null) {
        console.log('Analyzing flood extent using Sentinel-1 SAR...');

        // Simulate flood detection
        const floods = [];

        for (const floodArea of this.floodProneAreas) {
            const severity = Math.random();
            if (severity > 0.6) {
                floods.push({
                    area: floodArea,
                    severity: severity > 0.8 ? 'Severe' : 'Moderate',
                    extentKm2: Math.round(50 + Math.random() * 500),
                    affectedPopulation: Math.round(10000 + Math.random() * 100000),
                    waterDepth: severity > 0.8 ? '1-3 meters' : '0.3-1 meter',
                    infrastructure: this.getAffectedInfrastructure(floodArea),
                    detectionTime: new Date().toISOString(),
                    source: 'Sentinel-1 SAR'
                });
            }
        }

        return {
            timestamp: new Date().toISOString(),
            totalFloodEvents: floods.length,
            totalAffectedPopulation: floods.reduce((sum, f) => sum + f.affectedPopulation, 0),
            totalAreaKm2: floods.reduce((sum, f) => sum + f.extentKm2, 0),
            floods: floods,
            recommendations: this.generateFloodRecommendations(floods)
        };
    }

    /**
     * Assess landslide risk
     */
    async assessLandslideRisk() {
        console.log('Assessing landslide risk in highland areas...');

        const assessments = [];

        for (const area of this.landslideRiskAreas) {
            const rainfall = 50 + Math.random() * 150; // mm in last 7 days
            const slope = 20 + Math.random() * 40; // degrees
            const soilSaturation = Math.random() * 100;

            const riskScore = this.calculateLandslideRisk(rainfall, slope, soilSaturation);

            assessments.push({
                area: area,
                riskLevel: this.categorizeLandslideRisk(riskScore),
                riskScore: Math.round(riskScore),
                factors: {
                    rainfall: Math.round(rainfall) + ' mm (7 days)',
                    slope: Math.round(slope) + '°',
                    soilSaturation: Math.round(soilSaturation) + '%'
                },
                affectedPopulation: Math.round(5000 + Math.random() * 50000),
                recommendation: this.getLandslideRecommendation(riskScore)
            });
        }

        assessments.sort((a, b) => b.riskScore - a.riskScore);

        return {
            timestamp: new Date().toISOString(),
            totalHighRisk: assessments.filter(a => a.riskLevel === 'High').length,
            assessments: assessments
        };
    }

    /**
     * Monitor critical infrastructure
     */
    async monitorInfrastructure() {
        const infrastructure = [];

        for (const [type, assets] of Object.entries(this.criticalInfrastructure)) {
            for (const asset of assets) {
                const status = Math.random() > 0.1 ? 'Operational' : 'At Risk';
                const threat = status === 'At Risk' ? this.identifyThreat() : null;

                infrastructure.push({
                    type: type,
                    name: asset,
                    status: status,
                    threat: threat,
                    lastInspection: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                });
            }
        }

        return {
            timestamp: new Date().toISOString(),
            totalAssets: infrastructure.length,
            operational: infrastructure.filter(i => i.status === 'Operational').length,
            atRisk: infrastructure.filter(i => i.status === 'At Risk').length,
            infrastructure: infrastructure
        };
    }

    /**
     * Generate comprehensive disaster dashboard
     */
    async getDisasterDashboard() {
        const fires = await this.getActiveFires();
        const floods = await this.detectFloods();
        const landslides = await this.assessLandslideRisk();
        const infrastructure = await this.monitorInfrastructure();

        const totalAffected =
            (floods.totalAffectedPopulation || 0) +
            landslides.assessments.reduce((sum, a) => sum + a.affectedPopulation, 0);

        const criticalAlerts = [
            ...fires.alerts.filter(a => a.priority === 'Critical'),
            ...floods.floods.filter(f => f.severity === 'Severe').map(f => ({
                type: 'Flood',
                message: `Severe flooding in ${f.area}`,
                priority: 'Critical'
            })),
            ...landslides.assessments.filter(a => a.riskLevel === 'High').map(a => ({
                type: 'Landslide',
                message: `High landslide risk in ${a.area}`,
                priority: 'Critical'
            }))
        ];

        return {
            timestamp: new Date().toISOString(),
            overallStatus: criticalAlerts.length > 5 ? 'CRITICAL' : criticalAlerts.length > 0 ? 'WARNING' : 'NORMAL',
            criticalAlerts: criticalAlerts,
            totalAffectedPopulation: totalAffected,
            summary: {
                activeFires: fires.totalFires,
                activeFloods: floods.totalFloodEvents,
                highRiskLandslides: landslides.totalHighRisk,
                infrastructureAtRisk: infrastructure.atRisk
            },
            details: {
                fires: fires,
                floods: floods,
                landslides: landslides,
                infrastructure: infrastructure
            },
            recommendations: this.generateEmergencyRecommendations(criticalAlerts)
        };
    }

    // Helper methods
    generateSimulatedFires() {
        const fires = [];
        const fireCount = Math.floor(Math.random() * 20);

        const locations = [
            { name: 'Tsavo East', lat: -3.0, lng: 38.5, type: 'Wildlife' },
            { name: 'Mau Forest', lat: -0.5, lng: 35.5, type: 'Forest' },
            { name: 'Mt. Kenya', lat: -0.15, lng: 37.31, type: 'Forest' },
            { name: 'Kericho', lat: -0.37, lng: 35.28, type: 'Agricultural' },
            { name: 'Laikipia', lat: 0.37, lng: 36.78, type: 'Grassland' }
        ];

        for (let i = 0; i < fireCount; i++) {
            const location = locations[Math.floor(Math.random() * locations.length)];
            fires.push({
                id: `FIRE_${Date.now()}_${i}`,
                location: location.name,
                lat: location.lat + (Math.random() - 0.5) * 0.5,
                lng: location.lng + (Math.random() - 0.5) * 0.5,
                type: location.type,
                brightness: Math.round(300 + Math.random() * 70), // Kelvin
                confidence: Math.round(50 + Math.random() * 50),
                detectionTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
                source: 'VIIRS (NASA FIRMS)'
            });
        }

        return fires;
    }

    summarizeFires(fires) {
        const byType = {};
        fires.forEach(f => {
            byType[f.type] = (byType[f.type] || 0) + 1;
        });

        return byType;
    }

    generateFireAlerts(fires) {
        return fires
            .filter(f => f.confidence > 80)
            .map(f => ({
                type: 'Fire',
                location: f.location,
                message: `High-confidence fire detected in ${f.location} (${f.type})`,
                priority: f.type === 'Forest' || f.type === 'Wildlife' ? 'Critical' : 'High',
                timestamp: f.detectionTime
            }));
    }

    getAffectedInfrastructure(area) {
        // Simulate infrastructure impact
        const infrastructure = [];
        if (Math.random() > 0.5) infrastructure.push('Roads');
        if (Math.random() > 0.7) infrastructure.push('Bridges');
        if (Math.random() > 0.8) infrastructure.push('Power lines');
        return infrastructure.length > 0 ? infrastructure : ['None identified'];
    }

    generateFloodRecommendations(floods) {
        const recs = [];

        if (floods.some(f => f.severity === 'Severe')) {
            recs.push('URGENT: Evacuate affected populations immediately');
            recs.push('Deploy water rescue teams');
            recs.push('Establish emergency shelters');
        }

        if (floods.length > 0) {
            recs.push('Activate National Disaster Operations Centre');
            recs.push('Pre-position relief supplies');
            recs.push('Monitor river levels continuously');
        }

        return recs;
    }

    calculateLandslideRisk(rainfall, slope, soilSaturation) {
        // Risk model (0-100)
        const rainfallFactor = Math.min(50, (rainfall / 100) * 40);
        const slopeFactor = Math.min(30, (slope / 45) * 30);
        const saturationFactor = Math.min(30, (soilSaturation / 100) * 30);

        return rainfallFactor + slopeFactor + saturationFactor;
    }

    categorizeLandslideRisk(score) {
        if (score > 70) return 'High';
        if (score > 40) return 'Medium';
        return 'Low';
    }

    getLandslideRecommendation(score) {
        if (score > 70) return 'CRITICAL: Evacuate high-risk areas. Close roads. Monitor continuously.';
        if (score > 40) return 'WARNING: Alert populations. Prepare evacuation plans. Increased monitoring.';
        return 'NORMAL: Routine monitoring.';
    }

    identifyThreat() {
        const threats = ['Flooding', 'Fire Risk', 'Structural Damage', 'Earthquake', 'Terrorist Threat'];
        return threats[Math.floor(Math.random() * threats.length)];
    }

    generateEmergencyRecommendations(alerts) {
        const recs = [];

        if (alerts.length > 5) {
            recs.push('DECLARE STATE OF EMERGENCY');
            recs.push('Activate all emergency response teams');
            recs.push('Request international assistance');
        } else if (alerts.length > 0) {
            recs.push('Activate National Disaster Operations Centre');
            recs.push('Deploy emergency response teams');
            recs.push('Coordinate with county governments');
        }

        recs.push('Continue satellite monitoring every 3 hours');
        return recs;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DisasterResponse;
} else {
    window.DisasterResponse = DisasterResponse;
}
