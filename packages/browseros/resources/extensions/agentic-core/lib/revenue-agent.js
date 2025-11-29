// Revenue Agent Module (KRA)
// Simulates TIN Verification and Duty Calculation

export class RevenueAgent {
    constructor() {
        this.active = false;
    }

    toggle(state) {
        this.active = state;
        return this.active;
    }

    // Mock TIN Verification
    async verifyTIN(tin) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const tinRegex = /^P05\d{8}[A-Z]$/;
        if (!tinRegex.test(tin)) {
            return {
                valid: false,
                status: "INVALID FORMAT",
                message: "TIN must start with P05 and end with a letter."
            };
        }

        // Mock Database Logic
        const mockDb = {
            "P051234567A": { status: "ACTIVE", name: "JOHN DOE TRADING", compliance: "COMPLIANT" },
            "P059876543Z": { status: "SUSPENDED", name: "SHADY IMPORTS LTD", compliance: "NON-COMPLIANT (MISSING RETURNS)" }
        };

        const record = mockDb[tin];
        if (record) {
            return { valid: true, ...record };
        } else {
            // Default for unknown valid format TINs
            return { valid: true, status: "ACTIVE", name: "NEW TAXPAYER", compliance: "COMPLIANT" };
        }
    }

    // Duty Calculation Logic (Kenya Standard)
    calculateDuties(declaredValue, isExciseGoods = false) {
        const customsValue = declaredValue; // Assuming CIF

        // Rates
        const importDutyRate = 0.25; // 25%
        const exciseDutyRate = isExciseGoods ? 0.20 : 0; // 20% if applicable
        const vatRate = 0.16; // 16%
        const idfRate = 0.035; // 3.5%
        const rdlRate = 0.02; // 2.0%

        // Calculations
        const importDuty = customsValue * importDutyRate;
        const exciseDuty = (customsValue + importDuty) * exciseDutyRate;
        const vatableValue = customsValue + importDuty + exciseDuty;
        const vat = vatableValue * vatRate;
        const idf = customsValue * idfRate;
        const rdl = customsValue * rdlRate;

        const totalTaxes = importDuty + exciseDuty + vat + idf + rdl;

        return {
            customsValue,
            breakdown: {
                importDuty,
                exciseDuty,
                vat,
                idf,
                rdl
            },
            totalTaxes,
            totalPayable: customsValue + totalTaxes
        };
    }
}
