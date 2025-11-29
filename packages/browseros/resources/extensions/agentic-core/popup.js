import { Telemetry } from './lib/telemetry.js';
import { PoliceOps } from './lib/police-ops.js';
import { BorderControl } from './lib/border-control.js';
import { RevenueAgent } from './lib/revenue-agent.js';

document.addEventListener('DOMContentLoaded', async () => {
    const telemetry = new Telemetry();
    const policeOps = new PoliceOps();
    const borderControl = new BorderControl();
    const revenueAgent = new RevenueAgent();

    // UI Elements
    const body = document.body;
    const scannerView = document.getElementById('scannerView');
    const revenueView = document.getElementById('revenueView');
    const webcamFeed = document.getElementById('webcamFeed');
    const queryInput = document.getElementById('queryInput');
    const runBtn = document.getElementById('runBtn');
    const resultContent = document.getElementById('resultContent');
    const resultArea = document.getElementById('result');
    const statusText = document.getElementById('statusText');
    const agentTypeSelect = document.getElementById('agentType');
    const policeReticle = document.getElementById('policeReticle');
    const passportFrame = document.getElementById('passportFrame');
    const scannerStatus = document.getElementById('scannerStatus');

    // Consent Logic
    const consentModal = document.getElementById('consentModal');
    const allowBtn = document.getElementById('allowConsent');
    const denyBtn = document.getElementById('denyConsent');

    // Check if consent decision has been made
    const storage = await chrome.storage.local.get(['telemetry_consent_decision']);
    if (!storage.telemetry_consent_decision) {
        consentModal.style.display = 'flex';
    }

    allowBtn.addEventListener('click', async () => {
        await telemetry.setConsent(true);
        await chrome.storage.local.set({ telemetry_consent_decision: true });
        consentModal.style.display = 'none';
    });

    denyBtn.addEventListener('click', async () => {
        await telemetry.setConsent(false);
        await chrome.storage.local.set({ telemetry_consent_decision: true });
        consentModal.style.display = 'none';
    });

    // Feature Elements
    const vpnToggle = document.getElementById('vpnToggle');
    const vpnStatus = document.getElementById('vpnStatus');
    const voiceBtn = document.getElementById('voiceBtn');
    const adBlockCount = document.getElementById('adBlockCount');

    // VPN Logic
    let vpnConnected = false;
    vpnToggle.addEventListener('click', () => {
        vpnConnected = !vpnConnected;
        if (vpnConnected) {
            vpnToggle.classList.add('active');
            vpnStatus.textContent = 'SECURE';
            vpnStatus.classList.add('connected');
            telemetry.logEvent('vpn_connected');
        } else {
            vpnToggle.classList.remove('active');
            vpnStatus.textContent = 'VPN OFF';
            vpnStatus.classList.remove('connected');
            telemetry.logEvent('vpn_disconnected');
        }
    });

    // Voice Logic
    let isListening = false;
    voiceBtn.addEventListener('click', () => {
        if (!isListening) {
            // Start listening (Mock)
            isListening = true;
            voiceBtn.classList.add('listening');
            queryInput.placeholder = "Listening...";
            telemetry.logEvent('voice_activated');

            // Simulate speech recognition delay
            setTimeout(() => {
                queryInput.value = "Show me the latest security reports";
                isListening = false;
                voiceBtn.classList.remove('listening');
                // Auto-click run
                runBtn.click();
            }, 2000);
        }
    });

    // Ad Block Logic (Mock Update)
    setInterval(() => {
        const current = parseInt(adBlockCount.textContent);
        if (Math.random() > 0.7) {
            adBlockCount.textContent = (current + 1) + " Blocked";
        }
    }, 3000);

    // Handle Agent Card Selection
    const agentCards = document.querySelectorAll('.agent-card');
    agentCards.forEach(card => {
        card.addEventListener('click', async () => {
            // Remove active class from all
            agentCards.forEach(c => c.classList.remove('active'));
            // Add active class to clicked
            card.classList.add('active');

            const type = card.dataset.value;
            agentTypeSelect.value = type;

            // Reset UI Modes
            body.classList.remove('police-mode', 'immigration-mode', 'revenue-mode');
            scannerView.style.display = 'none';
            revenueView.style.display = 'none';
            policeReticle.style.display = 'none';
            passportFrame.style.display = 'none';
            scannerStatus.innerHTML = ''; // Clear status

            // Stop Webcam (default)
            if (webcamFeed.srcObject) {
                webcamFeed.srcObject.getTracks().forEach(track => track.stop());
                webcamFeed.srcObject = null;
            }

            if (type === 'police') {
                // Police Mode
                body.classList.add('police-mode');
                scannerView.style.display = 'block';
                policeReticle.style.display = 'block';
                scannerStatus.innerHTML = 'SYSTEM: ONLINE<br>MODE: FACIAL_REC_V4';
                scannerStatus.style.color = 'var(--accent-blue)';
                queryInput.placeholder = "Enter Plate Number or Click 'SCAN' for Face ID...";
                runBtn.textContent = "INITIATE SCAN";
                startWebcam();
            } else if (type === 'border') {
                // Immigration Mode
                body.classList.add('immigration-mode');
                scannerView.style.display = 'block';
                passportFrame.style.display = 'block';
                scannerStatus.innerHTML = 'SYSTEM: ONLINE<br>MODE: PASSPORT_OCR_V2';
                scannerStatus.style.color = '#ffd700';
                queryInput.placeholder = "Align Passport MRZ in frame...";
                runBtn.textContent = "SCAN PASSPORT";
                startWebcam();
            } else if (type === 'revenue') {
                body.classList.add('revenue-mode');
                revenueView.style.display = 'block';
                queryInput.placeholder = "Enter additional notes...";
                runBtn.textContent = "CALCULATE DUTIES";
            } else {
                // Normal Mode
                queryInput.placeholder = "Ask the agent anything...";
                runBtn.textContent = "EXECUTE MISSION";
            }
        });
    });

    async function startWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            webcamFeed.srcObject = stream;
        } catch (e) {
            console.error("Camera access denied", e);
            webcamFeed.style.backgroundColor = "#111";
        }
    }

    runBtn.addEventListener('click', async () => {
        // Special handling for Police Mode
        if (agentTypeSelect.value === 'police') {
            runBtn.disabled = true;
            runBtn.textContent = 'SCANNING...';
            resultArea.style.display = 'block';
            statusText.textContent = 'Analyzing Biometrics...';
            resultContent.innerHTML = '';

            const result = await policeOps.scan('face'); // Default to face for demo

            statusText.textContent = 'Match Found';

            // Render Police Card
            const isWanted = result.status === 'WANTED' || result.status === 'STOLEN';
            const html = `
          <div class="police-result ${isWanted ? 'wanted' : ''}">
            <div class="result-header">
              <span>${result.name || result.plate}</span>
              <span class="risk-badge">${result.riskLevel || result.status}</span>
            </div>
            <div>ID: ${result.id || result.model}</div>
            ${result.warrants ? `<div>WARRANTS: ${result.warrants.join(', ')}</div>` : ''}
            <div>CONFIDENCE: ${(result.confidence * 100).toFixed(1)}%</div>
          </div>
        `;
            resultContent.innerHTML = html;

            runBtn.disabled = false;
            runBtn.textContent = 'INITIATE SCAN';
            return;
        }

        // Border Logic
        if (agentTypeSelect.value === 'border') {
            // ... (Existing Border Logic) ...
            // (Ensure previous logic is preserved or re-inserted if truncated)
            runBtn.disabled = true;
            runBtn.textContent = 'READING MRZ...';
            resultArea.style.display = 'block';
            statusText.textContent = 'Querying Interpol Database...';
            resultContent.innerHTML = '';

            const result = await borderControl.scanPassport();

            const isAlert = result.status === 'ALERT';
            statusText.textContent = isAlert ? 'INTERPOL ALERT' : 'ENTRY ALLOWED';
            statusText.style.color = isAlert ? '#ff0000' : '#00ff00';

            const html = `
         <div class="border-result ${isAlert ? 'alert' : ''}">
           <div class="result-header">
             <span>${result.data.name}</span>
             <span class="risk-badge" style="background: ${isAlert ? '#ff0000' : '#006400'}">${result.status}</span>
           </div>
           <div>NAT: ${result.data.nationality} | DOB: ${result.data.dob}</div>
           <div>PASS: ${result.data.passportNo} | EXP: ${result.data.expiry}</div>
           ${isAlert ? `<div style="color: #ff4444; margin-top:5px;">⚠️ ${result.interpol.status}</div>` : ''}
           <div class="mrz-display">${result.mrz}</div>
         </div>
       `;
            resultContent.innerHTML = html;

            runBtn.disabled = false;
            runBtn.textContent = 'SCAN PASSPORT';
            return;
        }

        // Revenue Logic
        if (agentTypeSelect.value === 'revenue') {
            const tin = tinInput.value.trim();
            const value = parseFloat(valueInput.value);

            if (!tin || isNaN(value)) {
                statusText.textContent = 'Error: Missing Input';
                statusText.style.color = '#ff4444';
                return;
            }

            runBtn.disabled = true;
            runBtn.textContent = 'VERIFYING...';
            resultArea.style.display = 'block';
            statusText.textContent = 'Connecting to iTax...';
            resultContent.innerHTML = '';

            // 1. Verify TIN
            const tinResult = await revenueAgent.verifyTIN(tin);

            if (!tinResult.valid) {
                statusText.textContent = 'INVALID TIN';
                statusText.style.color = '#ff4444';
                resultContent.innerHTML = `<div style="color: #ff4444">${tinResult.message}</div>`;
                runBtn.disabled = false;
                runBtn.textContent = 'CALCULATE DUTIES';
                return;
            }

            // 2. Calculate Duties
            const calcResult = revenueAgent.calculateDuties(value, exciseCheck.checked);

            statusText.textContent = 'CALCULATION COMPLETE';
            statusText.style.color = '#fff';

            const formatMoney = (n) => n.toLocaleString('en-KE', { style: 'currency', currency: 'KES' });

            const html = `
          <div class="revenue-result">
            <div class="result-header">
              <span>${tinResult.name}</span>
              <span class="risk-badge" style="background: ${tinResult.status === 'ACTIVE' ? '#006400' : '#ff0000'}">${tinResult.status}</span>
            </div>
            <div style="margin-bottom: 10px; font-size: 10px;">COMPLIANCE: ${tinResult.compliance}</div>
            
            <div class="tax-row"><span>Customs Value:</span> <span>${formatMoney(calcResult.customsValue)}</span></div>
            <div class="tax-row"><span>Import Duty (25%):</span> <span>${formatMoney(calcResult.breakdown.importDuty)}</span></div>
            <div class="tax-row"><span>Excise Duty:</span> <span>${formatMoney(calcResult.breakdown.exciseDuty)}</span></div>
            <div class="tax-row"><span>VAT (16%):</span> <span>${formatMoney(calcResult.breakdown.vat)}</span></div>
            <div class="tax-row"><span>IDF (3.5%):</span> <span>${formatMoney(calcResult.breakdown.idf)}</span></div>
            <div class="tax-row"><span>RDL (2.0%):</span> <span>${formatMoney(calcResult.breakdown.rdl)}</span></div>
            
            <div class="tax-row tax-total">
              <span>TOTAL TAXES:</span>
              <span>${formatMoney(calcResult.totalTaxes)}</span>
            </div>
             <div class="tax-row" style="color: #fff; margin-top: 5px;">
              <span>TOTAL PAYABLE:</span>
              <span>${formatMoney(calcResult.totalPayable)}</span>
            </div>
          </div>
        `;
            resultContent.innerHTML = html;

            runBtn.disabled = false;
            runBtn.textContent = 'CALCULATE DUTIES';
            return;
        }

        // Normal Agent Logic
        const query = queryInput.value.trim();
        if (!query) return;

        // UI State: Running
        runBtn.disabled = true;
        runBtn.textContent = 'EXECUTING...';
        resultArea.style.display = 'block';
        statusText.textContent = 'Initializing Agent...';
        resultContent.innerHTML = '';

        try {
            const response = await chrome.runtime.sendMessage({
                type: 'AGENT_REQUEST',
                data: {
                    query,
                    context: {
                        classification: 'public',
                        agentType: agentTypeSelect.value,
                        vpnActive: vpnConnected // Pass VPN state
                    }
                }
            });

            statusText.textContent = 'Mission Completed';

            // Format result nicely
            if (response.result) {
                resultContent.innerHTML = `<pre>${JSON.stringify(response.result, null, 2)}</pre>`;
            } else {
                resultContent.textContent = JSON.stringify(response, null, 2);
            }

        } catch (error) {
            statusText.textContent = 'Mission Failed';
            statusText.style.color = '#ff4444';
            resultContent.textContent = 'Error: ' + error.message;
        } finally {
            runBtn.disabled = false;
            runBtn.textContent = 'EXECUTE MISSION';
        }
    });
});
