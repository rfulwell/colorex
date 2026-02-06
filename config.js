// Configuration popup controller.
// Depends on matching.js being loaded first via <script> tag.

class ConfigController {
  constructor() {
    this.mappings = [];
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
    });
    labelInput.addEventListener('input', () => {
      this.mappings[index].label = labelInput.value;
    });
    expressionInput.addEventListener('input', () => {
      this.mappings[index].urlExpression = expressionInput.value;
    });
    colorInput.addEventListener('change', () => {
      this.mappings[index].hexValue = colorInput.value;
    });
    deleteBtn.addEventListener('click', () => {
      this.mappings.splice(index, 1);
      this.render();
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
    // Validate all mappings before saving
    for (const m of this.mappings) {
      if (!m.urlExpression) {
        this.notify('Please fill in all URL patterns before saving.', true);
        return;
      }
      if (m.urlExpression.length > ColorEx.MAX_PATTERN_LENGTH) {
        this.notify(`Pattern "${m.label}" exceeds max length of ${ColorEx.MAX_PATTERN_LENGTH}.`, true);
        return;
      }
      if (ColorEx.isRegexPattern(m.urlExpression) && ColorEx.isReDoSRisk(m.urlExpression)) {
        this.notify(`Pattern "${m.label}" contains potentially unsafe regex. Simplify it.`, true);
        return;
      }
      if (!ColorEx.normalizeHex(m.hexValue)) {
        this.notify(`Invalid color for "${m.label}".`, true);
        return;
      }
    }

    try {
      await chrome.storage.sync.set({ urlColorMappings: this.mappings });
      chrome.runtime.sendMessage({ type: 'refreshMappings' });
      this.notify('Mappings saved!');
    } catch (err) {
      this.notify('Save failed: ' + (err.message || 'storage quota exceeded'), true);
    }
  }

  async resetDefaults() {
    if (!confirm('Reset all mappings to defaults? This cannot be undone.')) return;
    this.mappings = structuredClone(ColorEx.DEFAULT_MAPPINGS);
    try {
      await chrome.storage.sync.set({ urlColorMappings: this.mappings });
      chrome.runtime.sendMessage({ type: 'refreshMappings' });
      this.render();
      this.notify('Defaults restored!');
    } catch (err) {
      this.notify('Reset failed: ' + (err.message || 'unknown error'), true);
    }
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
      resultDiv.textContent = 'Pattern rejected: potentially unsafe regex (nested quantifiers or too long).';
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
    document.getElementById('btnSave').addEventListener('click', () => this.save());
    document.getElementById('btnReset').addEventListener('click', () => this.resetDefaults());
    document.getElementById('btnValidate').addEventListener('click', () => this.validate());
  }

  // --- Notification ---

  notify(message, isError = false) {
    const el = document.createElement('div');
    el.textContent = message;
    el.style.cssText = [
      'position:fixed', 'top:20px', 'right:20px',
      `background:${isError ? '#ef4444' : '#10b981'}`,
      'color:white', 'padding:12px 20px', 'border-radius:6px',
      'font-size:13px', 'box-shadow:0 4px 6px rgba(0,0,0,0.1)',
      'z-index:1000'
    ].join(';');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

document.addEventListener('DOMContentLoaded', () => new ConfigController());
