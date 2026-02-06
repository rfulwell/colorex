# Testing Guide for ColorEx

## Manual Testing Steps

### 1. Load the Extension

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `colorex` directory
6. Verify the extension loads without errors

### 2. Test Basic Functionality

#### Test Default Mappings

1. Click the ColorEx icon in the toolbar
2. Verify you see three default mappings:
   - GitHub (*github.com*) - Dark Gray
   - Reddit (*reddit.com*) - Orange  
   - Twitter (*twitter.com*) - Blue

3. Navigate to `https://github.com`
4. Verify the browser frame color changes to dark gray

5. Navigate to `https://reddit.com`
6. Verify the browser frame color changes to orange

7. Navigate to `https://twitter.com`
8. Verify the browser frame color changes to blue

9. Navigate to `https://google.com`
10. Verify the browser frame resets to default (no mapping matches)

#### Test Wildcard Patterns

1. Open the ColorEx popup
2. Click "+ New Mapping"
3. Configure:
   - Name: "Local Dev"
   - Pattern: `*localhost*`
   - Color: Green (#10b981)
4. Click "Save Mappings"

5. Navigate to `http://localhost:3000`
6. Verify the frame color changes to green

7. Test pattern variations:
   - `*google.com*` should match `https://www.google.com/search?q=test`
   - `https://example.com/*` should match any page on example.com
   - `*.domain.com*` should match all subdomains

#### Test Regular Expression Patterns

1. Open the ColorEx popup
2. Click "+ New Mapping"
3. Configure:
   - Name: "GitHub HTTPS"
   - Pattern: `^https://github\.com/.*`
   - Color: Purple (#8b5cf6)
4. Click "Save Mappings"

5. Navigate to `https://github.com/explore`
6. Verify color changes to purple

7. Navigate to `http://github.com` (http, not https)
8. Verify it falls back to the wildcard GitHub mapping (not the regex one)

#### Test Pattern Validator

1. Open the ColorEx popup
2. In the "Expression Validator" section:
   - Enter pattern: `*stackoverflow.com*`
   - Enter URL: `https://stackoverflow.com/questions/123`
   - Click "Validate"
3. Verify it shows "✓ Expression matches the URL"

4. Test non-matching:
   - Pattern: `*stackoverflow.com*`
   - URL: `https://github.com`
   - Should show "✗ Expression does not match the URL"

5. Test regex:
   - Pattern: `^https?://.*\.org$`
   - URL: `https://wikipedia.org`
   - Should show match

#### Test Enable/Disable Toggle

1. Open ColorEx popup
2. Uncheck the checkbox next to "GitHub" mapping
3. Click "Save Mappings"
4. Navigate to `https://github.com`
5. Verify the color does NOT change (mapping is disabled)
6. Re-enable the mapping and verify it works again

#### Test Delete Functionality

1. Click "Delete" on any mapping
2. Click "Save Mappings"
3. Verify the mapping is removed and no longer applies

#### Test Reset to Defaults

1. Modify or delete some mappings
2. Click "Reset to Defaults"
3. Confirm the reset
4. Verify the three default mappings are restored

### 3. Test Edge Cases

1. **Empty pattern**: Create a mapping with empty pattern, should not crash
2. **Invalid regex**: Try pattern `^[invalid` - should not crash, just won't match
3. **Very long URL**: Test with a URL with many query parameters
4. **Special characters**: Test URL with Unicode characters
5. **Multiple tabs**: Open multiple tabs with different URLs, verify colors switch correctly
6. **Window switching**: Have multiple Chrome windows, verify colors update when switching focus

### 4. Test Chrome Sync

1. Sign in to Chrome on a different device/profile
2. Install the extension
3. Configure mappings on first device
4. Verify mappings sync to second device

### 5. Performance Test

1. Create 20+ mappings
2. Navigate between pages rapidly
3. Verify:
   - No lag in page loading
   - Colors update smoothly
   - Browser remains responsive

### 6. Verify Console

1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Use the extension
4. Verify no errors appear (warnings about invalid regex are acceptable)

## Automated Tests

Run the test suite:

```bash
node tests.js
```

Expected output: All 19 tests should pass

## Security Verification

Before final release, verify:

1. No sensitive data is logged to console
2. Extension only uses declared permissions
3. No external network requests are made
4. User data is only stored in Chrome sync storage

## Browser Compatibility

Test on:
- Chrome (latest stable)
- Chrome (previous version)
- Chromium-based browsers (Edge, Brave, Opera)

## Known Limitations

1. Some websites may override theme colors with their own styles
2. Theme changes apply to entire browser, not per-tab
3. Requires "theme" permission which will reset any custom themes
4. Regular expressions must be valid JavaScript regex syntax

## Troubleshooting

### Extension won't load
- Check manifest.json is valid JSON
- Verify all referenced files exist
- Check Chrome version supports Manifest V3

### Colors not changing
- Verify mapping is enabled
- Test pattern with validator
- Check browser console for errors
- Ensure "Save Mappings" was clicked

### Pattern not matching
- Use validator to test
- Check for typos in pattern
- Remember: regex needs special chars like `^`, `$`, etc.
- Remember: wildcards use `*` and `?` only

## Reporting Issues

When reporting issues, include:
1. Chrome version
2. Extension version
3. Pattern that isn't working
4. URL you're testing with
5. Console error messages (if any)
6. Steps to reproduce
