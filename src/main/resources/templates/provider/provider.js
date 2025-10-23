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
        <textarea name="describe" type="text" placeholder="Enter a short description..."></textarea>

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

/* Optional cleanup */
window.addEventListener('beforeunload', () => {});
