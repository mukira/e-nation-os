// Border Control Module
// Simulates Passport MRZ Scanning and Interpol Watchlist Checks

export class BorderControl {
    constructor() {
        this.active = false;
        this.scanning = false;
    }

    toggle(state) {
        this.active = state;
        return this.active;
    }

    // Mock Scan Logic
    async scanPassport() {
        this.scanning = true;

        // Simulate OCR processing delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        this.scanning = false;

        // Return mock passport data
        return this.getMockPassportResult();
    }

    getMockPassportResult() {
        const scenarios = [
            {
                status: "CLEAN",
                mrz: "P<KENOTIENO<<JAMES<<<<<<<<<<<<<<<<<<<<<<<<<<\nA123456784KEN8801015M2801015<<<<<<<<<<<<<<04",
                data: {
                    name: "JAMES OTIENO",
                    nationality: "KENYAN",
                    dob: "01 JAN 1988",
                    sex: "M",
                    passportNo: "A12345678",
                    expiry: "01 JAN 2028"
                },
                interpol: {
                    match: false,
                    status: "NO RECORDS FOUND"
                }
            },
            {
                status: "ALERT",
                mrz: "P<GBRSMITH<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<<<<\nB987654321GBR8005125M2505125<<<<<<<<<<<<<<06",
                data: {
                    name: "JOHN SMITH",
                    nationality: "BRITISH",
                    dob: "12 MAY 1980",
                    sex: "M",
                    passportNo: "B98765432",
                    expiry: "12 MAY 2025"
                },
                interpol: {
                    match: true,
                    status: "RED NOTICE: FINANCIAL FRAUD",
                    action: "DETAIN IMMEDIATELY"
                }
            }
        ];
        return scenarios[Math.floor(Math.random() * scenarios.length)];
    }
}
