// ColorEx shared module — pattern matching, color utilities, and defaults.
// Used by worker.js (importScripts), config.js (<script>), and tests.js (require).

const ColorEx = (() => {
  const MAX_PATTERN_LENGTH = 500;

  const DEFAULT_MAPPINGS = [
    { urlExpression: '*github.com*', hexValue: '#1f2328', label: 'GitHub', active: true },
    { urlExpression: '*reddit.com*', hexValue: '#ff4500', label: 'Reddit', active: true },
    { urlExpression: '*x.com*', hexValue: '#000000', label: 'X', active: true }
  ];

  // --- Pattern detection ---

  function isRegexPattern(pattern) {
    return /[\^\$\[\]\{\}\(\)\|\+\\]/.test(pattern);
  }

  // --- ReDoS protection ---

  function isReDoSRisk(pattern) {
    if (pattern.length > MAX_PATTERN_LENGTH) return true;

    // Nested quantifiers: (a+)+, (a*)+, (a+)*, etc.
    if (/([+*}])\s*\)\s*[+*{]/.test(pattern)) return true;

    // Overlapping alternations with quantifiers: (a|a)+
    // Simplified check: group with alternation followed by quantifier
    if (/\([^)]*\|[^)]*\)[+*]{1,}/.test(pattern)) return true;

    return false;
  }

  // --- Wildcard matching ---

  function wildcardMatch(str, pattern) {
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

  // --- Core match function ---

  function matchUrl(url, pattern) {
    if (!url || !pattern) return false;

    if (isRegexPattern(pattern)) {
      if (isReDoSRisk(pattern)) return false;
      try {
        return new RegExp(pattern, 'i').test(url);
      } catch {
        return false;
      }
    }

    return wildcardMatch(url, pattern);
  }

  function findMatch(url, mappings) {
    if (!url || !Array.isArray(mappings)) return null;
    return mappings.find(m => m.active !== false && matchUrl(url, m.urlExpression)) || null;
  }

  // --- Color utilities ---

  function isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  }

  function normalizeHex(hex) {
    if (!hex || typeof hex !== 'string') return null;
    let h = hex.trim();
    if (!h.startsWith('#')) h = '#' + h;
    if (/^#[0-9A-Fa-f]{3}$/.test(h)) {
      h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    }
    return isValidHex(h) ? h : null;
  }

  function hexToRgb(hex) {
    const normalized = normalizeHex(hex);
    if (!normalized) return null;
    const c = normalized.slice(1);
    return {
      r: parseInt(c.substring(0, 2), 16),
      g: parseInt(c.substring(2, 4), 16),
      b: parseInt(c.substring(4, 6), 16)
    };
  }

  function getContrastColor(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#ffffff';
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 155 ? '#000000' : '#ffffff';
  }

  function shiftLuminosity(hex, amount) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    const r = clamp(rgb.r + amount);
    const g = clamp(rgb.g + amount);
    const b = clamp(rgb.b + amount);
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  return {
    MAX_PATTERN_LENGTH,
    DEFAULT_MAPPINGS,
    isRegexPattern,
    isReDoSRisk,
    wildcardMatch,
    matchUrl,
    findMatch,
    isValidHex,
    normalizeHex,
    hexToRgb,
    getContrastColor,
    shiftLuminosity
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ColorEx;
}
