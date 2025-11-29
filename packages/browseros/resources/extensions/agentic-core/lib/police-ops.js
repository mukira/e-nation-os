// Police Field Ops Module
// Simulates Facial Recognition and ALPR (License Plate Scanning)

export class PoliceOps {
    constructor() {
        this.active = false;
        this.mode = 'face'; // 'face' or 'plate'
        this.scanning = false;
    }

    toggle(state) {
        this.active = state;
        return this.active;
    }

    // Mock Scan Logic
    async scan(type) {
        this.scanning = true;

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        this.scanning = false;

        // Return mock data based on type
        if (type === 'face') {
            return this.getMockFaceResult();
        } else {
            return this.getMockPlateResult();
        }
    }

    getMockFaceResult() {
        const scenarios = [
            {
                match: true,
                confidence: 0.98,
                name: "JOHN DOE (ALIAS: 'THE GHOST')",
                id: "ID-99283-X",
                status: "WANTED",
                warrants: ["Grand Theft Auto", "Cybercrime"],
                riskLevel: "HIGH"
            },
            {
                match: true,
                confidence: 0.89,
                name: "JANE SMITH",
                id: "ID-11234-Y",
                status: "CLEAN",
                warrants: [],
                riskLevel: "LOW"
            },
            {
                match: false,
                confidence: 0.12,
                status: "NO MATCH FOUND"
            }
        ];
        return scenarios[Math.floor(Math.random() * scenarios.length)];
    }

    getMockPlateResult() {
        const scenarios = [
            {
                match: true,
                plate: "KCD 123X",
                model: "TOYOTA LAND CRUISER (BLACK)",
                owner: "GOVERNMENT OF KENYA",
                status: "STOLEN",
                flag: "INTERPOL RED NOTICE"
            },
            {
                match: true,
                plate: "KBA 456Y",
                model: "SUBARU IMPREZA (BLUE)",
                owner: "PRIVATE CITIZEN",
                status: "CLEAN",
                flag: "NONE"
            }
        ];
        return scenarios[Math.floor(Math.random() * scenarios.length)];
    }
}
