// E-Nation OS - Fleet Management Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.dataset.section;

            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Update active section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Generate Mock Fleet Data
    function generateFleetData() {
        const departments = ['Police', 'Immigration', 'KRA', 'IFMIS', 'Ministry of Defense', 'Ministry of Health'];
        const statuses = ['online', 'offline', 'outdated'];
        const versions = ['v1.0.5', 'v1.0.4', 'v1.0.3'];

        const fleet = [];
        for (let i = 1; i <= 50; i++) {
            fleet.push({
                id: `ENO-${String(i).padStart(5, '0')}`,
                department: departments[Math.floor(Math.random() * departments.length)],
                version: versions[Math.floor(Math.random() * versions.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                lastSeen: getRandomTime()
            });
        }
        return fleet;
    }

    function getRandomTime() {
        const times = ['Just now', '5 min ago', '1 hour ago', '3 hours ago', '1 day ago'];
        return times[Math.floor(Math.random() * times.length)];
    }

    // Populate Fleet Table
    function populateFleetTable(filter = 'all') {
        const fleetData = generateFleetData();
        const tbody = document.getElementById('fleetTable');
        tbody.innerHTML = '';

        const filtered = filter === 'all' ? fleetData : fleetData.filter(item => item.status === filter);

        filtered.forEach(item => {
            const row = document.createElement('tr');
            const statusClass = item.status === 'online' ? 'success' : item.status === 'outdated' ? 'warning' : '';
            const statusText = item.status.toUpperCase();

            row.innerHTML = `
        <td><code>${item.id}</code></td>
        <td>${item.department}</td>
        <td>${item.version}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>${item.lastSeen}</td>
        <td>
          <button class="btn-small btn-secondary">Details</button>
        </td>
      `;
            tbody.appendChild(row);
        });
    }

    // Filter Fleet
    document.getElementById('filterStatus')?.addEventListener('change', (e) => {
        populateFleetTable(e.target.value);
    });

    // Search Fleet
    document.getElementById('searchFleet')?.addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#fleetTable tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(search) ? '' : 'none';
        });
    });

    // Policy Modal
    const policyModal = document.getElementById('policyModal');
    const createPolicyBtn = document.getElementById('createPolicy');
    const modalCloses = document.querySelectorAll('.modal-close');

    createPolicyBtn?.addEventListener('click', () => {
        policyModal.classList.add('active');
    });

    modalCloses.forEach(btn => {
        btn.addEventListener('click', () => {
            policyModal.classList.remove('active');
        });
    });

    // Push Update Animation
    document.getElementById('pushUpdate')?.addEventListener('click', function () {
        this.disabled = true;
        this.innerHTML = '<span>🚀</span> Deploying...';

        // Simulate deployment
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                clearInterval(interval);
                this.disabled = false;
                this.innerHTML = '<span>✅</span> Deployment Complete!';

                setTimeout(() => {
                    this.innerHTML = '<span>🚀</span> Deploy Update';
                }, 3000);

                // Add to recent deployments
                addRecentDeployment();
            }
        }, 300);
    });

    function addRecentDeployment() {
        const tbody = document.getElementById('recentDeployments');
        const versionNum = document.getElementById('versionNumber').value || 'v1.0.6';
        const target = document.getElementById('updateTarget').options[document.getElementById('updateTarget').selectedIndex].text;

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>Extension Update ${versionNum}</td>
      <td>${target}</td>
      <td><span class="badge success">Complete</span></td>
      <td><div class="progress-bar"><div class="progress-fill" style="width: 100%"></div></div></td>
      <td>Just now</td>
    `;
        tbody.insertBefore(row, tbody.firstChild);
    }

    // Add Domain to Whitelist
    document.getElementById('addDomain')?.addEventListener('click', () => {
        const input = document.getElementById('newDomain');
        const domain = input.value.trim();

        if (domain) {
            const domainList = document.querySelector('.domain-list');
            const item = document.createElement('div');
            item.className = 'domain-item';
            item.innerHTML = `
        <span class="domain-name">${domain}</span>
        <span class="domain-category">Custom</span>
        <button class="btn-small btn-danger">Remove</button>
      `;

            // Add remove handler
            item.querySelector('.btn-danger').addEventListener('click', () => {
                item.remove();
            });

            domainList.appendChild(item);
            input.value = '';

            // Add to audit log
            addAuditEntry('Whitelist Modified', `Added ${domain}`);
        }
    });

    // Add Audit Entry
    function addAuditEntry(action, target) {
        const tbody = document.getElementById('auditLog');
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${timestamp}</td>
      <td>${action}</td>
      <td>admin@gov.ke</td>
      <td>${target}</td>
      <td><span class="badge success">Success</span></td>
    `;
        tbody.insertBefore(row, tbody.firstChild);
    }

    // Initialize
    populateFleetTable();

    // Animate stats on load
    animateNumber('totalInstalls', 10247, 1000);
    animateNumber('activeUsers', 9812, 1000);
    animateNumber('outdated', 435, 1000);
});

function animateNumber(id, target, duration) {
    const element = document.getElementById(id);
    if (!element) return;

    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}
