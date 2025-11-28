// Government API Connectors
export class GovernmentAPIs {
    constructor() {
        this.endpoints = {
            ecitizen: {
                base: 'https://api.ecitizen.go.ke/v1',
                apiKey: null
            },
            ifmis: {
                base: 'https://api.treasury.go.ke/ifmis/v2',
                apiKey: null
            },
            kra: {
                base: 'https://api.kra.go.ke/itax/v1',
                apiKey: null
            },
            immigration: {
                base: 'https://api.immigration.go.ke/v1',
                apiKey: null
            },
            interpol: {
                base: 'https://secure.interpol.int/api/i24-7',
                certificate: null
            }
        };
        this.loadConfig();
    }

    async loadConfig() {
        const result = await chrome.storage.local.get(['govAPIs']);
        if (result.govAPIs) {
            Object.assign(this.endpoints, result.govAPIs);
        }
    }

    // E-Citizen Integration
    async checkApplicationStatus(applicationId) {
        const response = await fetch(
            `${this.endpoints.ecitizen.base}/applications/${applicationId}`,
            {
                headers: {
                    'X-API-Key': this.endpoints.ecitizen.apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.json();
    }

    async verifyPayment(paymentRef) {
        const response = await fetch(
            `${this.endpoints.ecitizen.base}/payments/${paymentRef}`,
            {
                headers: { 'X-API-Key': this.endpoints.ecitizen.apiKey }
            }
        );
        return response.json();
    }

    // IFMIS Integration
    async getBudgetAllocation(ministry, fiscalYear) {
        const response = await fetch(
            `${this.endpoints.ifmis.base}/budget/${ministry}?year=${fiscalYear}`,
            {
                headers: { 'Authorization': `Bearer ${this.endpoints.ifmis.apiKey}` }
            }
        );
        return response.json();
    }

    async getExpenditure(ministry, dateRange) {
        const response = await fetch(
            `${this.endpoints.ifmis.base}/expenditure?ministry=${ministry}&start=${dateRange.start}&end=${dateRange.end}`,
            {
                headers: { 'Authorization': `Bearer ${this.endpoints.ifmis.apiKey}` }
            }
        );
        return response.json();
    }

    // KRA iTax Integration
    async verifyTIN(tin) {
        const response = await fetch(
            `${this.endpoints.kra.base}/verify/tin/${tin}`,
            {
                headers: { 'X-API-Key': this.endpoints.kra.apiKey }
            }
        );
        return response.json();
    }

    async calculateDuty(importDetails) {
        const response = await fetch(
            `${this.endpoints.kra.base}/calculate/duty`,
            {
                method: 'POST',
                headers: {
                    'X-API-Key': this.endpoints.kra.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(importDetails)
            }
        );
        return response.json();
    }

    // Immigration Integration
    async checkVisa(passportNumber, nationality) {
        const response = await fetch(
            `${this.endpoints.immigration.base}/visa/check`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.endpoints.immigration.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ passportNumber, nationality })
            }
        );
        return response.json();
    }

    // Interpol I-24/7 Integration
    async checkStolenDocument(documentNumber, documentType) {
        const response = await fetch(
            `${this.endpoints.interpol.base}/sltd/check`,
            {
                method: 'POST',
                headers: {
                    'X-Client-Cert': this.endpoints.interpol.certificate,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ documentNumber, documentType })
            }
        );
        return response.json();
    }

    async checkWantedPerson(name, dob, nationality) {
        const response = await fetch(
            `${this.endpoints.interpol.base}/red_notices/search`,
            {
                method: 'POST',
                headers: {
                    'X-Client-Cert': this.endpoints.interpol.certificate,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, dob, nationality })
            }
        );
        return response.json();
    }
}
