// URL-to-Color mapping engine
class SkinColorEngine {
  constructor() {
    this.mappings = [];
    this.fallbackPalette = null;
    this.loadSavedMappings();
  }

  async loadSavedMappings() {
    const data = await chrome.storage.sync.get(['urlColorMappings', 'fallback']);
    this.mappings = data.urlColorMappings || this.buildInitialMappings();
    this.fallbackPalette = data.fallback;
  }

  buildInitialMappings() {
    return [
      { urlExpression: '*github.com*', hexValue: '#1f2328', label: 'GitHub', active: true },
      { urlExpression: '*reddit.com*', hexValue: '#ff4500', label: 'Reddit', active: true },
      { urlExpression: '*twitter.com*', hexValue: '#1da1f2', label: 'Twitter', active: true }
    ];
  }

  evaluateUrlAgainstExpression(addressBar, expression) {
    // Determine if expression uses regex syntax or wildcards
    const hasRegexMarkers = /[\^\$\[\]\{\}\(\)\|\\]/.test(expression);
    
    if (hasRegexMarkers) {
      // Treat as regular expression
      try {
        const regPattern = new RegExp(expression);
        return regPattern.test(addressBar);
      } catch (parseError) {
        console.error('Regex compilation failed:', expression, parseError);
        return false;
      }
    } else {
      // Treat as wildcard pattern with * and ?
      return this.wildcardEvaluation(addressBar, expression);
    }
  }

  wildcardEvaluation(targetString, wildcardExpression) {
    // Custom wildcard matching algorithm
    let sIndex = 0;
    let wIndex = 0;
    let starIndex = -1;
    let matchPosition = 0;
    
    while (sIndex < targetString.length) {
      if (wIndex < wildcardExpression.length && 
          (wildcardExpression[wIndex] === '?' || 
           wildcardExpression[wIndex] === targetString[sIndex])) {
        // Character match or ? wildcard
        sIndex++;
        wIndex++;
      } else if (wIndex < wildcardExpression.length && wildcardExpression[wIndex] === '*') {
        // Star wildcard - remember position
        starIndex = wIndex;
        matchPosition = sIndex;
        wIndex++;
      } else if (starIndex !== -1) {
        // Backtrack to last star
        wIndex = starIndex + 1;
        matchPosition++;
        sIndex = matchPosition;
      } else {
        return false;
      }
    }
    
    // Handle remaining stars at end
    while (wIndex < wildcardExpression.length && wildcardExpression[wIndex] === '*') {
      wIndex++;
    }
    
    return wIndex === wildcardExpression.length;
  }

  locateMatchingMapping(addressBar) {
    for (const mapping of this.mappings) {
      if (mapping.active !== false && this.evaluateUrlAgainstExpression(addressBar, mapping.urlExpression)) {
        return mapping;
      }
    }
    return null;
  }

  transformColorToRGB(hexValue) {
    const cleanHex = hexValue.replace('#', '');
    return {
      red: parseInt(cleanHex.substring(0, 2), 16),
      green: parseInt(cleanHex.substring(2, 4), 16),
      blue: parseInt(cleanHex.substring(4, 6), 16)
    };
  }

  adjustLuminosity(hexValue, shiftAmount) {
    const rgb = this.transformColorToRGB(hexValue);
    const adjusted = {
      red: Math.max(0, Math.min(255, rgb.red + shiftAmount)),
      green: Math.max(0, Math.min(255, rgb.green + shiftAmount)),
      blue: Math.max(0, Math.min(255, rgb.blue + shiftAmount))
    };
    
    return '#' + Object.values(adjusted)
      .map(v => v.toString(16).padStart(2, '0'))
      .join('');
  }

  calculateTextContrast(hexValue) {
    const rgb = this.transformColorToRGB(hexValue);
    const brightness = (rgb.red * 299 + rgb.green * 587 + rgb.blue * 114) / 1000;
    return brightness > 155 ? '#000000' : '#ffffff';
  }

  activateSkinColor(hexValue) {
    const palette = {
      colors: {
        frame: hexValue,
        frame_inactive: this.adjustLuminosity(hexValue, -15),
        toolbar: this.adjustLuminosity(hexValue, 8),
        tab_background_text: this.calculateTextContrast(hexValue)
      }
    };
    chrome.theme.update(palette);
  }

  deactivateSkin() {
    if (this.fallbackPalette) {
      chrome.theme.update(this.fallbackPalette);
    } else {
      chrome.theme.reset();
    }
  }
}

const colorEngine = new SkinColorEngine();

// Tab switching handler
chrome.tabs.onActivated.addListener(async (activation) => {
  const tabData = await chrome.tabs.get(activation.tabId);
  processUrlUpdate(tabData.url);
});

// URL change handler
chrome.tabs.onUpdated.addListener((tabId, modifications, tabData) => {
  if (modifications.url) {
    chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
      if (activeTabs[0] && activeTabs[0].id === tabId) {
        processUrlUpdate(modifications.url);
      }
    });
  }
});

// Window focus handler
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  
  const activeTabs = await chrome.tabs.query({ active: true, windowId });
  if (activeTabs[0] && activeTabs[0].url) {
    processUrlUpdate(activeTabs[0].url);
  }
});

function processUrlUpdate(addressBar) {
  if (!addressBar) return;
  
  const match = colorEngine.locateMatchingMapping(addressBar);
  
  if (match) {
    colorEngine.activateSkinColor(match.hexValue);
  } else {
    colorEngine.deactivateSkin();
  }
}

// Message dispatcher
chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.type === 'refreshMappings') {
    colorEngine.loadSavedMappings().then(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
        if (activeTabs[0] && activeTabs[0].url) {
          processUrlUpdate(activeTabs[0].url);
        }
      });
      respond({ status: 'complete' });
    });
    return true;
  } else if (msg.type === 'validateExpression') {
    const isMatch = colorEngine.evaluateUrlAgainstExpression(msg.targetUrl, msg.expression);
    respond({ matches: isMatch });
    return true;
  }
});

chrome.runtime.onStartup.addListener(() => {
  colorEngine.loadSavedMappings();
});

chrome.runtime.onInstalled.addListener(() => {
  colorEngine.loadSavedMappings();
});
