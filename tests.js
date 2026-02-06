// Tests for matching.js — the shared ColorEx module.
// Run with: node tests.js

const ColorEx = require('./matching.js');

let passed = 0;
let failed = 0;

function assert(condition, description) {
  if (condition) {
    passed++;
    console.log(`  \u2713 ${description}`);
  } else {
    failed++;
    console.log(`  \u2717 ${description}`);
  }
}

function section(name) {
  console.log(`\n${name}`);
  console.log('-'.repeat(name.length));
}

// ---------------------------------------------------------------------------
section('Wildcard matching');

assert(ColorEx.matchUrl('https://github.com/user/repo', '*github.com*'), 'contains match');
assert(!ColorEx.matchUrl('https://google.com', '*github.com*'), 'no match');
assert(ColorEx.matchUrl('https://example.com', 'https://*.com'), 'wildcard in middle');
assert(ColorEx.matchUrl('https://www.google.com/search?q=test', 'https://www.google.com/*'), 'trailing wildcard');
assert(ColorEx.matchUrl('http://localhost:3000/app', '*localhost*'), 'localhost with port');
assert(ColorEx.matchUrl('https://example.com/page1', 'https://example.com/page?'), '? matches single char');
assert(!ColorEx.matchUrl('https://example.com/page12', 'https://example.com/page?'), '? rejects two chars');
assert(ColorEx.matchUrl('https://old.reddit.com/r/programming', '*.reddit.com*'), 'subdomain match');
assert(ColorEx.matchUrl('https://anything.com', '*'), 'single * matches all');
assert(ColorEx.matchUrl('https://anything.com', '**'), 'double ** matches all');
assert(ColorEx.matchUrl('test', '*test*'), 'exact match with surrounding *');

// ---------------------------------------------------------------------------
section('Regex matching');

assert(ColorEx.matchUrl('https://github.com/user/repo', '^https://github\\.com/.*'), 'regex: github https');
assert(!ColorEx.matchUrl('http://github.com/user/repo', '^https://github\\.com/.*'), 'regex: github wrong protocol');
assert(ColorEx.matchUrl('https://en.wikipedia.org/wiki/Test', '^https?://.*\\.wikipedia\\.org/.*'), 'regex: wikipedia https');
assert(ColorEx.matchUrl('http://fr.wikipedia.org/wiki/Test', '^https?://.*\\.wikipedia\\.org/.*'), 'regex: wikipedia http');
assert(ColorEx.matchUrl('https://twitter.com/user', '(facebook|twitter|instagram)\\.com'), 'regex: alternation match');
assert(!ColorEx.matchUrl('https://linkedin.com/user', '(facebook|twitter|instagram)\\.com'), 'regex: alternation no match');
assert(ColorEx.matchUrl('https://example.com/image.png', '^https://.*\\.(jpg|png|gif)$'), 'regex: image extension match');
assert(!ColorEx.matchUrl('https://example.com/image.pdf', '^https://.*\\.(jpg|png|gif)$'), 'regex: image extension no match');

// ---------------------------------------------------------------------------
section('Regex is case-insensitive');

assert(ColorEx.matchUrl('https://GITHUB.COM/user', '^https://github\\.com/.*'), 'case-insensitive regex');

// ---------------------------------------------------------------------------
section('Edge cases');

assert(!ColorEx.matchUrl('', '*github.com*'), 'empty URL returns false');
assert(!ColorEx.matchUrl('https://github.com', ''), 'empty pattern returns false');
assert(!ColorEx.matchUrl(null, '*'), 'null URL returns false');
assert(!ColorEx.matchUrl('https://x.com', null), 'null pattern returns false');
assert(!ColorEx.matchUrl(undefined, '*'), 'undefined URL returns false');

// ---------------------------------------------------------------------------
section('ReDoS protection');

assert(ColorEx.isReDoSRisk('(a+)+'), 'detects nested quantifier (a+)+');
assert(ColorEx.isReDoSRisk('(a*)+'), 'detects nested quantifier (a*)+');
assert(ColorEx.isReDoSRisk('(a|b)+'), 'detects alternation with quantifier');
assert(ColorEx.isReDoSRisk('a'.repeat(501)), 'rejects pattern exceeding max length');
assert(!ColorEx.isReDoSRisk('^https://github\\.com/.*'), 'allows safe regex');
assert(!ColorEx.isReDoSRisk('(facebook|twitter)\\.com'), 'allows alternation without outer quantifier');

// Dangerous patterns should return false from matchUrl, not hang
assert(!ColorEx.matchUrl('aaaaaaaaaaaaaaa', '(a+)+$'), 'ReDoS pattern safely returns false');

// ---------------------------------------------------------------------------
section('isRegexPattern detection');

assert(ColorEx.isRegexPattern('^https://foo'), 'detects ^');
assert(ColorEx.isRegexPattern('foo$'), 'detects $');
assert(ColorEx.isRegexPattern('(a|b)'), 'detects ()');
assert(ColorEx.isRegexPattern('[abc]'), 'detects []');
assert(ColorEx.isRegexPattern('a+'), 'detects +');
assert(ColorEx.isRegexPattern('a\\d'), 'detects \\');
assert(!ColorEx.isRegexPattern('*github.com*'), 'wildcards are not regex');
assert(!ColorEx.isRegexPattern('https://example.com/page?'), '? alone is not regex');

// ---------------------------------------------------------------------------
section('Color validation');

assert(ColorEx.isValidHex('#ff4500'), 'valid 6-digit hex');
assert(ColorEx.isValidHex('#000000'), 'valid black');
assert(!ColorEx.isValidHex('#fff'), 'rejects shorthand');
assert(!ColorEx.isValidHex('ff4500'), 'rejects missing #');
assert(!ColorEx.isValidHex('#gggggg'), 'rejects non-hex chars');
assert(!ColorEx.isValidHex(''), 'rejects empty string');

// ---------------------------------------------------------------------------
section('normalizeHex');

assert(ColorEx.normalizeHex('#ff4500') === '#ff4500', 'passes through valid hex');
assert(ColorEx.normalizeHex('ff4500') === '#ff4500', 'adds missing #');
assert(ColorEx.normalizeHex('#f00') === '#ff0000', 'expands shorthand');
assert(ColorEx.normalizeHex('not-a-color') === null, 'returns null for garbage');
assert(ColorEx.normalizeHex('') === null, 'returns null for empty');
assert(ColorEx.normalizeHex(null) === null, 'returns null for null');

// ---------------------------------------------------------------------------
section('hexToRgb');

const red = ColorEx.hexToRgb('#ff0000');
assert(red && red.r === 255 && red.g === 0 && red.b === 0, 'parses red');
const white = ColorEx.hexToRgb('#ffffff');
assert(white && white.r === 255 && white.g === 255 && white.b === 255, 'parses white');
assert(ColorEx.hexToRgb('garbage') === null, 'returns null for invalid');

// ---------------------------------------------------------------------------
section('getContrastColor');

assert(ColorEx.getContrastColor('#ffffff') === '#000000', 'white bg -> black text');
assert(ColorEx.getContrastColor('#000000') === '#ffffff', 'black bg -> white text');
assert(ColorEx.getContrastColor('#ff4500') === '#ffffff', 'dark orange -> white text');

// ---------------------------------------------------------------------------
section('shiftLuminosity');

const lighter = ColorEx.hexToRgb(ColorEx.shiftLuminosity('#808080', 20));
assert(lighter && lighter.r === 148 && lighter.g === 148 && lighter.b === 148, 'shifts lighter');
const clamped = ColorEx.hexToRgb(ColorEx.shiftLuminosity('#ffffff', 50));
assert(clamped && clamped.r === 255 && clamped.g === 255 && clamped.b === 255, 'clamps at 255');
const darkerClamped = ColorEx.hexToRgb(ColorEx.shiftLuminosity('#000000', -10));
assert(darkerClamped && darkerClamped.r === 0 && darkerClamped.g === 0 && darkerClamped.b === 0, 'clamps at 0');

// ---------------------------------------------------------------------------
section('findMatch');

const mappings = [
  { urlExpression: '*github.com*', hexValue: '#333', label: 'GitHub', active: true },
  { urlExpression: '*reddit.com*', hexValue: '#f40', label: 'Reddit', active: true },
  { urlExpression: '*disabled.com*', hexValue: '#000', label: 'Off', active: false }
];

const ghMatch = ColorEx.findMatch('https://github.com/foo', mappings);
assert(ghMatch && ghMatch.label === 'GitHub', 'finds github mapping');
const rdMatch = ColorEx.findMatch('https://reddit.com/r/test', mappings);
assert(rdMatch && rdMatch.label === 'Reddit', 'finds reddit mapping');
assert(ColorEx.findMatch('https://example.com', mappings) === null, 'returns null for no match');
assert(ColorEx.findMatch('https://disabled.com', mappings) === null, 'skips inactive mappings');
assert(ColorEx.findMatch('https://github.com', null) === null, 'handles null mappings');
assert(ColorEx.findMatch(null, mappings) === null, 'handles null url');

// ---------------------------------------------------------------------------
// Summary

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

if (failed === 0) {
  console.log('\nAll tests passed!');
  process.exit(0);
} else {
  console.log(`\n${failed} test(s) failed`);
  process.exit(1);
}
