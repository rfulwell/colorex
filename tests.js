// Test suite for pattern matching algorithm
// Run with: node tests.js

class UrlPatternMatcher {
  constructor(patternString) {
    this.originalPattern = patternString;
    this.isRegexPattern = this.detectRegexSyntax(patternString);
    
    if (this.isRegexPattern) {
      try {
        this.regexMatcher = new RegExp(patternString);
      } catch (err) {
        console.warn('Invalid regex pattern:', patternString, err);
        this.regexMatcher = null;
      }
    } else {
      this.wildcardRegex = null;
    }
  }

  detectRegexSyntax(pattern) {
    const regexIndicators = ['(', ')', '[', ']', '{', '}', '^', '$', '|', '+', '\\'];
    return regexIndicators.some(char => pattern.includes(char));
  }

  wildcardEvaluation(targetString, wildcardExpression) {
    let sIndex = 0;
    let wIndex = 0;
    let starIndex = -1;
    let matchPosition = 0;
    
    while (sIndex < targetString.length) {
      if (wIndex < wildcardExpression.length && 
          (wildcardExpression[wIndex] === '?' || 
           wildcardExpression[wIndex] === targetString[sIndex])) {
        sIndex++;
        wIndex++;
      } else if (wIndex < wildcardExpression.length && wildcardExpression[wIndex] === '*') {
        starIndex = wIndex;
        matchPosition = sIndex;
        wIndex++;
      } else if (starIndex !== -1) {
        wIndex = starIndex + 1;
        matchPosition++;
        sIndex = matchPosition;
      } else {
        return false;
      }
    }
    
    while (wIndex < wildcardExpression.length && wildcardExpression[wIndex] === '*') {
      wIndex++;
    }
    
    return wIndex === wildcardExpression.length;
  }

  testUrl(urlString) {
    if (this.isRegexPattern) {
      return this.regexMatcher ? this.regexMatcher.test(urlString) : false;
    } else {
      return this.wildcardEvaluation(urlString, this.originalPattern);
    }
  }
}

// Test cases
const tests = [
  // Wildcard tests
  {
    pattern: '*github.com*',
    url: 'https://github.com/user/repo',
    expected: true,
    description: 'Wildcard: github.com in middle'
  },
  {
    pattern: '*github.com*',
    url: 'https://google.com',
    expected: false,
    description: 'Wildcard: no match'
  },
  {
    pattern: 'https://*.com',
    url: 'https://example.com',
    expected: true,
    description: 'Wildcard: asterisk in middle'
  },
  {
    pattern: 'https://www.google.com/*',
    url: 'https://www.google.com/search?q=test',
    expected: true,
    description: 'Wildcard: asterisk at end'
  },
  {
    pattern: '*localhost*',
    url: 'http://localhost:3000/app',
    expected: true,
    description: 'Wildcard: localhost with port'
  },
  {
    pattern: 'https://example.com/page?',
    url: 'https://example.com/page1',
    expected: true,
    description: 'Wildcard: question mark single char'
  },
  {
    pattern: 'https://example.com/page?',
    url: 'https://example.com/page12',
    expected: false,
    description: 'Wildcard: question mark too many chars'
  },
  {
    pattern: '*.reddit.com*',
    url: 'https://old.reddit.com/r/programming',
    expected: true,
    description: 'Wildcard: subdomain match'
  },
  
  // Regex tests
  {
    pattern: '^https://github\\.com/.*',
    url: 'https://github.com/user/repo',
    expected: true,
    description: 'Regex: github URL with https'
  },
  {
    pattern: '^https://github\\.com/.*',
    url: 'http://github.com/user/repo',
    expected: false,
    description: 'Regex: github URL wrong protocol'
  },
  {
    pattern: '^https?://.*\\.wikipedia\\.org/.*',
    url: 'https://en.wikipedia.org/wiki/Test',
    expected: true,
    description: 'Regex: wikipedia with optional s'
  },
  {
    pattern: '^https?://.*\\.wikipedia\\.org/.*',
    url: 'http://fr.wikipedia.org/wiki/Test',
    expected: true,
    description: 'Regex: wikipedia http'
  },
  {
    pattern: '(facebook|twitter|instagram)\\.com',
    url: 'https://twitter.com/user',
    expected: true,
    description: 'Regex: multiple domains'
  },
  {
    pattern: '(facebook|twitter|instagram)\\.com',
    url: 'https://linkedin.com/user',
    expected: false,
    description: 'Regex: multiple domains no match'
  },
  {
    pattern: '^https://.*\\.(jpg|png|gif)$',
    url: 'https://example.com/image.png',
    expected: true,
    description: 'Regex: image extension match'
  },
  {
    pattern: '^https://.*\\.(jpg|png|gif)$',
    url: 'https://example.com/image.pdf',
    expected: false,
    description: 'Regex: image extension no match'
  },
  
  // Edge cases
  {
    pattern: '*',
    url: 'https://anything.com',
    expected: true,
    description: 'Edge case: single asterisk matches all'
  },
  {
    pattern: '**',
    url: 'https://anything.com',
    expected: true,
    description: 'Edge case: double asterisk matches all'
  },
  {
    pattern: '*test*',
    url: 'test',
    expected: true,
    description: 'Edge case: asterisks around exact match'
  }
];

// Run tests
console.log('Running ColorEx Pattern Matching Tests\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
  const matcher = new UrlPatternMatcher(test.pattern);
  const result = matcher.testUrl(test.url);
  const success = result === test.expected;
  
  if (success) {
    passed++;
    console.log(`✓ Test ${index + 1}: ${test.description}`);
  } else {
    failed++;
    console.log(`✗ Test ${index + 1}: ${test.description}`);
    console.log(`  Pattern: ${test.pattern}`);
    console.log(`  URL: ${test.url}`);
    console.log(`  Expected: ${test.expected}, Got: ${result}`);
  }
});

console.log('='.repeat(60));
console.log(`\nResults: ${passed} passed, ${failed} failed out of ${tests.length} tests`);

if (failed === 0) {
  console.log('\n✓ All tests passed!');
  process.exit(0);
} else {
  console.log(`\n✗ ${failed} test(s) failed`);
  process.exit(1);
}
