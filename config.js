// Configuration popup controller.
// Depends on matching.js being loaded first via <script> tag.

class ConfigController {
  constructor() {
    this.mappings = [];
    this._saveTimer = null;
    this.initialize();
  }

  async initialize() {
    await this.loadMappings();
    this.render();
    this.showCurrentTab();
    this.bindEvents();
  }

  async loadMappings() {
    const stored = await chrome.storage.sync.get('urlColorMappings');
    this.mappings = stored.urlColorMappings || ColorEx.DEFAULT_MAPPINGS;
  }

  // --- Rendering ---

  render() {
    const container = document.getElementById('mappingsList');
    while (container.firstChild) container.firstChild.remove();

    this.mappings.forEach((mapping, idx) => {
      container.appendChild(this.createCard(mapping, idx));
    });
  }

  createCard(mapping, index) {
    const template = document.getElementById('mappingTemplate');
    const clone = template.content.cloneNode(true);

    const toggle = clone.querySelector('.toggle-switch');
    const labelInput = clone.querySelector('.mapping-label');
    const expressionInput = clone.querySelector('.mapping-expression');
    const colorInput = clone.querySelector('.color-selector');
    const deleteBtn = clone.querySelector('.btn-delete');

    toggle.checked = mapping.active !== false;
    labelInput.value = mapping.label || '';
    expressionInput.value = mapping.urlExpression || '';
    colorInput.value = ColorEx.normalizeHex(mapping.hexValue) || '#000000';

    toggle.addEventListener('change', () => {
      this.mappings[index].active = toggle.checked;
      this.scheduleSave();
    });
    labelInput.addEventListener('input', () => {
      this.mappings[index].label = labelInput.value;
      this.scheduleSave();
    });
    expressionInput.addEventListener('input', () => {
      this.mappings[index].urlExpression = expressionInput.value;
      this.scheduleSave();
    });
    colorInput.addEventListener('change', () => {
      this.mappings[index].hexValue = colorInput.value;
      this.scheduleSave();
    });
    deleteBtn.addEventListener('click', () => {
      this.mappings.splice(index, 1);
      this.render();
      this.scheduleSave();
    });

    return clone;
  }

  // --- Tab info ---

  async showCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url) {
        document.getElementById('activeUrl').textContent = tab.url;
        const match = ColorEx.findMatch(tab.url, this.mappings);
        document.getElementById('appliedMapping').textContent = match ? match.label : 'None';
      }
    } catch {
      document.getElementById('activeUrl').textContent = 'Unable to read tab';
    }
  }

  // --- Auto-save ---

  scheduleSave() {
    clearTimeout(this._saveTimer);
    this.setStatus('pending');
    this._saveTimer = setTimeout(() => this.save(), 600);
  }

  setStatus(state) {
    const el = document.getElementById('saveStatus');
    if (state === 'saved') {
      el.textContent = 'Saved';
      el.className = 'save-status visible saved';
    } else if (state === 'error') {
      el.className = 'save-status visible error';
      // textContent set by caller
    } else {
      el.textContent = 'Unsaved changes';
      el.className = 'save-status visible pending';
    }
  }

  // --- Actions ---

  addMapping() {
    this.mappings.push({
      urlExpression: '',
      hexValue: '#6366f1',
      label: 'New Mapping',
      active: true
    });
    this.render();
  }

  async save() {
    const statusEl = document.getElementById('saveStatus');

    // Validate — skip empty patterns silently (user may still be typing)
    for (const m of this.mappings) {
      if (m.urlExpression && m.urlExpression.length > ColorEx.MAX_PATTERN_LENGTH) {
        statusEl.textContent = `Pattern "${m.label}" too long`;
        this.setStatus('error');
        return;
      }
      if (m.urlExpression && ColorEx.isRegexPattern(m.urlExpression) && ColorEx.isReDoSRisk(m.urlExpression)) {
        statusEl.textContent = `Pattern "${m.label}" has unsafe regex`;
        this.setStatus('error');
        return;
      }
      if (m.hexValue && !ColorEx.normalizeHex(m.hexValue)) {
        statusEl.textContent = `Invalid color for "${m.label}"`;
        this.setStatus('error');
        return;
      }
    }

    try {
      await chrome.storage.sync.set({ urlColorMappings: this.mappings });
      chrome.runtime.sendMessage({ type: 'refreshMappings' });
      this.setStatus('saved');
    } catch (err) {
      const statusEl2 = document.getElementById('saveStatus');
      statusEl2.textContent = err.message || 'Save failed';
      this.setStatus('error');
    }
  }

  async resetDefaults() {
    if (!confirm('Reset all mappings to defaults? This cannot be undone.')) return;
    this.mappings = structuredClone(ColorEx.DEFAULT_MAPPINGS);
    this.render();
    await this.save();
  }

  validate() {
    const expression = document.getElementById('expressionInput').value;
    const testUrl = document.getElementById('urlInput').value;
    const resultDiv = document.getElementById('validationResult');

    if (!expression || !testUrl) {
      resultDiv.textContent = 'Please enter both a pattern and a URL.';
      resultDiv.className = 'validation-output visible negative';
      return;
    }

    if (ColorEx.isRegexPattern(expression) && ColorEx.isReDoSRisk(expression)) {
      resultDiv.textContent = 'Pattern rejected: potentially unsafe regex.';
      resultDiv.className = 'validation-output visible negative';
      return;
    }

    const matches = ColorEx.matchUrl(testUrl, expression);
    resultDiv.textContent = matches
      ? '\u2713 Pattern matches the URL'
      : '\u2717 Pattern does not match the URL';
    resultDiv.className = 'validation-output visible ' + (matches ? 'positive' : 'negative');
  }

  // --- Events ---

  bindEvents() {
    document.getElementById('btnAddMapping').addEventListener('click', () => this.addMapping());
    document.getElementById('btnReset').addEventListener('click', () => this.resetDefaults());
    document.getElementById('btnValidate').addEventListener('click', () => this.validate());

    // Save immediately when popup is about to close
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        clearTimeout(this._saveTimer);
        this.save();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new ConfigController());
