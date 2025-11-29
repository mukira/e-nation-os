// E-Gov Sign-In JavaScript

const clearanceLevels = {
    1: { title: 'Level 1 Access', name: 'President', permissions: 'Full System Access' },
    2: { title: 'Level 2 Access', name: 'Cabinet Secretary', permissions: 'Ministry-Level Access' },
    3: { title: 'Level 3 Access', name: 'Director', permissions: 'Department-Level Access' },
    4: { title: 'Level 4 Access', name: 'Field Officer', permissions: 'Task-Level Access' }
};

document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signinForm');
    const mfaSection = document.getElementById('mfaSection');
    const clearanceSection = document.getElementById('clearanceSection');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Test Account Click Handlers
    const testAccounts = document.querySelectorAll('.test-account');
    testAccounts.forEach(account => {
        account.addEventListener('click', () => {
            const email = account.dataset.email;
            const clearance = parseInt(account.dataset.clearance);

            emailInput.value = email;
            passwordInput.value = 'demo123';

            // Auto-submit after filling
            setTimeout(() => {
                signinForm.dispatchEvent(new Event('submit'));
            }, 300);
        });
    });

    // Sign-In Form Submit
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        // Validate credentials (mock)
        if (email && password) {
            // Hide form, show MFA
            signinForm.style.display = 'none';
            mfaSection.style.display = 'block';
        }
    });

    // Biometric Auth
    document.getElementById('biometricBtn').addEventListener('click', async () => {
        await performBiometricAuth();
    });

    // Hardware Key Auth
    document.getElementById('hardwareKeyBtn').addEventListener('click', async () => {
        await performHardwareKeyAuth();
    });

    // SMS Code Auth
    document.getElementById('smsCodeBtn').addEventListener('click', async () => {
        await performSMSAuth();
    });

    async function performBiometricAuth() {
        try {
            // In production, use WebAuthn API
            // const credential = await navigator.credentials.get({
            //   publicKey: {
            //     challenge: new Uint8Array([...]),
            //     rpId: 'e-nation.go.ke',
            //     userVerification: 'required'
            //   }
            // });

            // Mock biometric
            await showBiometricPrompt();
            await completeSignIn();
        } catch (error) {
            console.error('Biometric auth failed', error);
            alert('Biometric authentication failed. Please try another method.');
        }
    }

    async function showBiometricPrompt() {
        return new Promise((resolve) => {
            // Simulate biometric prompt
            const confirmed = confirm('Touch your fingerprint sensor or look at FaceID camera');
            if (confirmed) {
                setTimeout(resolve, 1000);
            } else {
                throw new Error('User cancelled');
            }
        });
    }

    async function performHardwareKeyAuth() {
        try {
            // In production, use WebAuthn with hardware key
            await new Promise(resolve => setTimeout(resolve, 1500));
            await completeSignIn();
        } catch (error) {
            console.error('Hardware key auth failed', error);
            alert('Hardware key authentication failed.');
        }
    }

    async function performSMSAuth() {
        const code = prompt('Enter the 6-digit code sent to your phone:');
        if (code && code.length === 6) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await completeSignIn();
        } else {
            alert('Invalid code');
        }
    }

    async function completeSignIn() {
        // Hide MFA section
        mfaSection.style.display = 'none';

        // Show clearance section
        clearanceSection.style.display = 'block';

        // Determine clearance level based on email
        const email = emailInput.value;
        let clearanceLevel = 4; // Default to officer level

        if (email.includes('president')) clearanceLevel = 1;
        else if (email.includes('minister') || email.includes('cabinet')) clearanceLevel = 2;
        else if (email.includes('director')) clearanceLevel = 3;

        const clearance = clearanceLevels[clearanceLevel];

        // Display clearance
        document.getElementById('clearanceLevel').textContent = clearance.title;
        document.getElementById('userName').textContent = clearance.name;

        // Store session
        await chrome.storage.local.set({
            user_authenticated: true,
            user_email: email,
            user_clearance: clearanceLevel,
            user_permissions: clearance.permissions,
            session_started: new Date().toISOString()
        });

        // Redirect after 2 seconds
        setTimeout(() => {
            // In production, would redirect to main browser UI
            window.close();
        }, 2000);
    }
});
