/* Helper: hide all main sections */
function hideAllSections() {
  document.querySelectorAll('.main-section').forEach(s => s.style.display = 'none');
}

/* Helper: reset banner title */
function setBannerTitle(text) {
  const el = document.querySelector('.page-heading .header-text h2');
  if (el) el.textContent = text;
}

/* ---------- Utility: remove previously generated section if any ---------- */
function removeGeneratedSection() {
  const generated = Array.from(document.querySelectorAll('.main-container .main-section')).find(s => {
    return s.querySelector('.form-mini') || s.querySelector('#miniChartContainer');
  });
  if (generated) generated.remove();
}

/* ---------- Form 1: Upload dataset ---------- */
function showDataManagementForm() {
  setBannerTitle('Register & Manage Data Sources');
  hideAllSections();
  removeGeneratedSection();

  const container = document.createElement('section');
  container.className = 'main-section';
  container.innerHTML = `
    <main class="form-mini">
      <form onsubmit="handleUpload(event)">
        <label>Data name:</label>
        <input name="dataName" type="text" placeholder="Enter the data name..." required>

        <label>Describe:</label>
        <textarea name="describe" placeholder="Enter a short description..."></textarea>

        <label>Data type:</label>
        <select name="dataType">
          <option>Battery</option>
          <option>Trip</option>
          <option>Charging</option>
          <option>Electricity transactions</option>
        </select>

        <label>Share mode:</label>
        <select name="shareMode">
          <option>Raw (original data)</option>
          <option>Analyzed</option>
        </select>

        <label>Data file:</label>
        <input name="dataFile" type="file" accept=".csv,.json,.xlsx" required>

        <div>
          <div class="form-btn-group">
          <button type="submit">📤 Upload</button>
          <button type="button" class="btn-back" onclick="location.reload()">⬅ Come back</button>
        </div>
        </div>
      </form>
    </main>
  `;
  document.querySelector('.main-container').appendChild(container);
}

/* Upload handler */
function handleUpload(e) {
  e.preventDefault();
  const f = e.target;
  const name = f.dataName.value || '<no name>';
  alert('Dataset "' + name + '" uploaded!');
  location.reload();
}

/* ---------- Form 2: Policies & Pricing ---------- */
function showPolicyPricingForm() {
  setBannerTitle('Sharing Policies & Pricing');
  hideAllSections();
  removeGeneratedSection();

  const container = document.createElement('section');
  container.className = 'main-section';
  container.innerHTML = `
    <main class="form-mini">
      <form onsubmit="handlePolicySubmit(event)">
        <label>Dataset (mock):</label>
        <select name="dataset">
          <option>Battery Health - 2025</option>
          <option>Charging Sessions - Q1</option>
          <option>Driving Patterns - Sample</option>
        </select>

        <label>Pricing model:</label>
        <select name="pricingModel">
          <option>Per download</option>
          <option>Subscription</option>
          <option>By data size</option>
        </select>

        <label>Price (USD):</label>
        <input name="price" type="number" min="0" step="0.01" value="99">

        <label>License:</label>
        <select name="license">
          <option>Research / Academic</option>
          <option>Commercial</option>
          <option>Internal use only</option>
        </select>

        <label>Visibility:</label>
        <select name="visibility">
          <option>Public</option>
          <option>Restricted</option>
          <option>Private</option>
        </select>

        <label><input type="checkbox" name="freePreview" checked> Allow free preview sample</label>

        <label>Policy description:</label>
        <textarea name="policyDesc" placeholder="Short description of policy and usage terms..."></textarea>

        <div>
          <div class="form-btn-group">
          <button type="submit">Save Policy</button>
          <button type="button" class="btn-back" onclick="location.reload()">⬅ Come back</button>
        </div>
        </div>
      </form>
    </main>
  `;
  document.querySelector('.main-container').appendChild(container);
}

function handlePolicySubmit(e) {
  e.preventDefault();
  alert('Policy saved!');
  location.reload();
}

/* ---------- Form 3: Revenue Tracking ---------- */
function showRevenueTrackingForm() {
  setBannerTitle('Data Revenue Tracking');
  hideAllSections();
  removeGeneratedSection();

  const stats = {
    totalRevenue: '$12,450',
    downloads: '1,234',
    buyers: '86',
    monthly: [120, 200, 180, 220, 260, 300, 280, 320, 350, 300, 340, 360]
  };

  const container = document.createElement('section');
  container.className = 'main-section';
  container.innerHTML = `
    <div style="margin-top:12px;">
      <div class="stat-grid">
        <div class="stat-box"><div class="num">${stats.totalRevenue}</div><div class="label">Total revenue</div></div>
        <div class="stat-box"><div class="num">${stats.downloads}</div><div class="label">Downloads</div></div>
        <div class="stat-box"><div class="num">${stats.buyers}</div><div class="label">Unique buyers</div></div>
      </div>

      <div>
        <label>Filter month:</label>
        <select id="revMonth" onchange="renderMiniChart()">
          <option value="all">Last 12 months</option>
          <option value="6">Last 6 months</option>
          <option value="3">Last 3 months</option>
        </select>
      </div>

      <div style="margin-top:12px;" id="chartArea">
        <div class="mini-chart" id="miniChartContainer"></div>
      </div>

      <div style="margin-top:14px;">
        <h4>Recent downloads</h4>
        <table class="table-small">
          <thead><tr><th>Dataset</th><th>User</th><th>Date</th><th>Revenue</th></tr></thead>
          <tbody>
            <tr><td>Battery Health - 2025</td><td>Acme Labs</td><td>2025-09-12</td><td>$299</td></tr>
            <tr><td>Charging Sessions - Q1</td><td>GridCo</td><td>2025-09-02</td><td>$199</td></tr>
            <tr><td>Driving Patterns - Sample</td><td>DriveAI</td><td>2025-08-21</td><td>$149</td></tr>
          </tbody>
        </table>
      </div>

      <div class="form-mini">
        <div class="form-btn-group">
          <button type="submit" onclick="alert('Export CSV')">Export CSV</button>
          <button type="button" class="btn-back" onclick="location.reload()">⬅ Come back</button>
        </div>
      </div>
    </div>
  `;
  document.querySelector('.main-container').appendChild(container);

  window.revenueData = stats.monthly;
  renderMiniChart();
}

function renderMiniChart() {
  const sel = document.getElementById('revMonth');
  const howMany = sel ? sel.value : 'all';
  let arr = window.revenueData || [];
  if (howMany === '6') arr = arr.slice(-6);
  if (howMany === '3') arr = arr.slice(-3);
  const container = document.getElementById('miniChartContainer');
  container.innerHTML = '';
  const max = Math.max(...arr, 1);
  arr.forEach(v => {
    const col = document.createElement('div');
    col.className = 'col';
    const perc = Math.round((v / max) * 100);
    col.style.height = perc + '%';
    container.appendChild(col);
  });
}

/* ---------- Form 4: Security & Anonymization ---------- */
let pendingRemovePIIConfirmResolve = null;

function showSecurityAnonymForm() {
  setBannerTitle('Data Security & Anonymization');
  hideAllSections();
  removeGeneratedSection();

  const container = document.createElement('section');
  container.className = 'main-section';
  container.innerHTML = `
    <main class="form-mini">
      <form onsubmit="handleSecuritySubmit(event)">
        <label>Dataset (mock):</label>
        <select name="dataset">
          <option>Battery Health - 2025</option>
          <option>Charging Sessions - Q1</option>
          <option>Driving Patterns - Sample</option>
        </select>

        <label><input id="removePii" type="checkbox" name="removePii"> Remove PII (irreversible)</label>

        <label>Anonymization method:</label>
        <select name="method">
          <option>Mask (replace sensitive fields)</option>
          <option>Hash (deterministic)</option>
          <option>Aggregate (roll-up)</option>
        </select>

        <label>Access control:</label>
        <select name="access">
          <option>Open</option>
          <option>Whitelist</option>
          <option>Approval required</option>
        </select>

        <label><input type="checkbox" name="audit"> Enable audit logging</label>

        <label>Notes / instructions:</label>
        <textarea name="notes" placeholder="Notes for reviewers or processors..."></textarea>

        <div>
          <div class="form-btn-group">
          <button type="submit">Apply Settings</button>
          <button type="button" class="btn-back" onclick="location.reload()">⬅ Come back</button>
        </div>
        </div>
      </form>
    </main>
  `;
  document.querySelector('.main-container').appendChild(container);
}

function handleSecuritySubmit(e) {
  e.preventDefault();
  const form = e.target;
  const remove = form.removePii.checked;
  if (remove) {
    showConfirmModal().then(confirmed => {
      if (confirmed) {
        alert('Security settings applied! Remove PII confirmed!');
        location.reload();
      } else {
        alert('Operation cancelled!');
      }
    });
  } else {
    alert('Security settings applied!');
    location.reload();
  }
}

/* Confirm modal utilities */
function showConfirmModal() {
  return new Promise(resolve => {
    pendingRemovePIIConfirmResolve = resolve;
    const modal = document.getElementById('confirmModal');
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  });
}

function closeConfirm(result) {
  const modal = document.getElementById('confirmModal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  if (pendingRemovePIIConfirmResolve) {
    pendingRemovePIIConfirmResolve(result);
    pendingRemovePIIConfirmResolve = null;
  }
}

/* Optional cleanup */
window.addEventListener('beforeunload', () => {});
