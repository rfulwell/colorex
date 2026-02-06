// Configuration interface controller
class InterfaceController {
  constructor() {
    this.mappingsData = [];
    this.initialize();
  }

  async initialize() {
    await this.fetchMappings();
    this.renderMappingsList();
    this.displayCurrentInfo();
    this.attachEventHandlers();
  }

  async fetchMappings() {
    const stored = await chrome.storage.sync.get('urlColorMappings');
    this.mappingsData = stored.urlColorMappings || this.generateDefaults();
  }

  generateDefaults() {
    return [
      { urlExpression: '*github.com*', hexValue: '#1f2328', label: 'GitHub', active: true },
      { urlExpression: '*reddit.com*', hexValue: '#ff4500', label: 'Reddit', active: true },
      { urlExpression: '*twitter.com*', hexValue: '#1da1f2', label: 'Twitter', active: true }
    ];
  }

  renderMappingsList() {
    const container = document.getElementById('mappingsList');
    container.innerHTML = '';
    
    this.mappingsData.forEach((mapping, idx) => {
      const card = this.createMappingCard(mapping, idx);
      container.appendChild(card);
    });
  }

  createMappingCard(mapping, index) {
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
    colorInput.value = mapping.hexValue || '#000000';
    
    toggle.addEventListener('change', () => {
      this.mappingsData[index].active = toggle.checked;
    });
    
    labelInput.addEventListener('input', () => {
      this.mappingsData[index].label = labelInput.value;
    });
    
    expressionInput.addEventListener('input', () => {
      this.mappingsData[index].urlExpression = expressionInput.value;
    });
    
    colorInput.addEventListener('change', () => {
      this.mappingsData[index].hexValue = colorInput.value;
    });
    
    deleteBtn.addEventListener('click', () => {
      this.deleteMapping(index);
    });
    
    return clone;
  }

  deleteMapping(index) {
    this.mappingsData.splice(index, 1);
    this.renderMappingsList();
  }

  addNewMapping() {
    this.mappingsData.push({
      urlExpression: '',
      hexValue: '#6366f1',
      label: 'New Mapping',
      active: true
    });
    this.renderMappingsList();
  }

  async persistMappings() {
    await chrome.storage.sync.set({ urlColorMappings: this.mappingsData });
    chrome.runtime.sendMessage({ type: 'refreshMappings' });
    this.showNotification('Mappings saved successfully!');
  }

  async resetToDefaults() {
    if (confirm('Reset all mappings to defaults? This cannot be undone.')) {
      this.mappingsData = this.generateDefaults();
      await this.persistMappings();
      this.renderMappingsList();
    }
  }

  async displayCurrentInfo() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url) {
      document.getElementById('activeUrl').textContent = tabs[0].url;
      
      // Find matching mapping
      const match = this.mappingsData.find(m => {
        if (m.active === false) return false;
        return this.performMatch(tabs[0].url, m.urlExpression);
      });
      
      document.getElementById('appliedMapping').textContent = match ? match.label : 'None';
    }
  }

  performMatch(url, expression) {
    // Simple wildcard matching for display
    const hasRegex = /[\^\$\[\]\{\}\(\)\|\\]/.test(expression);
    
    if (hasRegex) {
      try {
        return new RegExp(expression).test(url);
      } catch (e) {
        return false;
      }
    } else {
      return this.wildcardMatch(url, expression);
    }
  }

  wildcardMatch(str, pattern) {
    let si = 0, pi = 0, star = -1, match = 0;
    
    while (si < str.length) {
      if (pi < pattern.length && (pattern[pi] === '?' || pattern[pi] === str[si])) {
        si++;
        pi++;
      } else if (pi < pattern.length && pattern[pi] === '*') {
        star = pi;
        match = si;
        pi++;
      } else if (star !== -1) {
        pi = star + 1;
        match++;
        si = match;
      } else {
        return false;
      }
    }
    
    while (pi < pattern.length && pattern[pi] === '*') {
      pi++;
    }
    
    return pi === pattern.length;
  }

  async validateExpression() {
    const expression = document.getElementById('expressionInput').value;
    const testUrl = document.getElementById('urlInput').value;
    const resultDiv = document.getElementById('validationResult');
    
    if (!expression || !testUrl) {
      resultDiv.textContent = 'Please enter both expression and URL';
      resultDiv.className = 'validation-output visible negative';
      return;
    }
    
    const response = await chrome.runtime.sendMessage({
      type: 'validateExpression',
      expression: expression,
      targetUrl: testUrl
    });
    
    if (response.matches) {
      resultDiv.textContent = '✓ Expression matches the URL';
      resultDiv.className = 'validation-output visible positive';
    } else {
      resultDiv.textContent = '✗ Expression does not match the URL';
      resultDiv.className = 'validation-output visible negative';
    }
  }

  attachEventHandlers() {
    document.getElementById('btnAddMapping').addEventListener('click', () => {
      this.addNewMapping();
    });
    
    document.getElementById('btnSave').addEventListener('click', () => {
      this.persistMappings();
    });
    
    document.getElementById('btnReset').addEventListener('click', () => {
      this.resetToDefaults();
    });
    
    document.getElementById('btnValidate').addEventListener('click', () => {
      this.validateExpression();
    });
  }

  showNotification(message) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 13px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2500);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new InterfaceController();
});
