// Content Script - Injects agent capabilities into web pages
console.log('[E-Nation OS] Agentic capabilities injected');

// Listen for custom events from the page (if we want to expose an API to web apps)
window.addEventListener('ENationAgentRequest', async (event) => {
    const { query } = event.detail;

    // Send to background script
    chrome.runtime.sendMessage({
        type: 'AGENT_REQUEST',
        data: { query, context: { origin: window.location.origin } }
    }, (response) => {
        // Dispatch result back to page
        window.dispatchEvent(new CustomEvent('ENationAgentResponse', {
            detail: response
        }));
    });
});
