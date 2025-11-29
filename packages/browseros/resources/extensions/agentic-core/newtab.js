// E-Nation OS - New Tab Landing Page Script

document.addEventListener('DOMContentLoaded', () => {
    // Open Extension Popup
    document.getElementById('openExtension').addEventListener('click', () => {
        chrome.action.openPopup();
    });

    // View Documentation
    document.getElementById('viewDocs').addEventListener('click', () => {
        window.open('https://github.com/mukira/e-nation-os', '_blank');
    });

    // Feature Card Click Handlers
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('click', () => {
            const feature = card.dataset.feature;

            // Open extension with specific agent selected
            chrome.runtime.sendMessage({
                action: 'openWithAgent',
                agent: feature
            });
        });
    });

    // Add entrance animation
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});
