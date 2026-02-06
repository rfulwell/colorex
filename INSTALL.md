# ColorEx Installation & Testing Guide

## Quick Start

### Step 1: Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** using the toggle in the top right corner
3. Click **Load unpacked**
4. Navigate to and select the `colorex` directory
5. The ColorEx extension should now appear in your extensions list

### Step 2: Verify Installation

After loading:
- ✅ Extension icon should appear in the toolbar
- ✅ No errors should show in the extension card
- ✅ Click "Inspect views: service worker" to check console for errors

### Step 3: Test the Extension

#### Method 1: Click the Extension Icon

1. Click the ColorEx icon in your browser toolbar
2. You should see:
   - Current URL displayed
   - Three default mappings: GitHub, Reddit, Twitter
   - Configuration options

#### Method 2: Navigate to Test URLs

1. Open a new tab and go to `https://github.com`
   - **Expected**: Browser frame should turn dark gray (#1f2328)

2. Navigate to `https://reddit.com`
   - **Expected**: Browser frame should turn orange (#ff4500)

3. Navigate to `https://twitter.com`
   - **Expected**: Browser frame should turn blue (#1da1f2)

4. Navigate to `https://google.com`
   - **Expected**: Browser frame should return to default (no match)

## Troubleshooting

### Extension Not Loading

**Problem**: Extension fails to load or shows errors

**Solutions**:
1. Check that all files are present in the directory
2. Verify `manifest.json` is valid JSON
3. Look for syntax errors in the console
4. Try removing and re-adding the extension

### Colors Not Changing

**Problem**: Browser theme doesn't change when navigating

**Solutions**:

1. **Check Service Worker Status**
   - Go to `chrome://extensions/`
   - Find ColorEx
   - Click "Inspect views: service worker"
   - Look for errors in the console
   - Try clicking the refresh icon on the service worker

2. **Verify Mappings Are Loaded**
   - Click the ColorEx icon
   - Check that default mappings are visible
   - Try toggling a mapping off and on
   - Click "Save Mappings"

3. **Test Pattern Matching**
   - Click ColorEx icon
   - Use "Expression Validator" section
   - Enter pattern: `*github.com*`
   - Enter URL: `https://github.com`
   - Click "Validate"
   - Should show "✓ Expression matches the URL"

4. **Force Reload**
   - Navigate to `chrome://extensions/`
   - Click the refresh icon on the ColorEx card
   - Try navigating to test URLs again

### Permission Issues

**Problem**: Extension requires additional permissions

**Solutions**:
1. The extension needs these permissions:
   - `tabs` - to detect URL changes
   - `storage` - to save configuration
   - `theme` - to modify browser theme
   - `<all_urls>` - to monitor all URLs
2. These are declared in manifest.json and should be auto-granted
3. If prompted, click "Allow" for all permissions

### Service Worker Inactive

**Problem**: Service worker shows as "inactive" or gray

**Solutions**:
1. This is normal - service workers sleep when idle
2. Navigate to a tab to wake it up
3. Check the console by clicking "Inspect views: service worker"
4. Look for initialization messages

## Common Issues

### Issue: Theme Changes Briefly Then Reverts

**Cause**: Multiple tabs are competing for theme control

**Fix**: This is expected behavior - the active tab's URL determines the theme

### Issue: Theme Not Resetting on Non-Matching URLs

**Cause**: Browser might have a custom theme installed

**Fix**: The extension calls `chrome.theme.reset()` which should restore default, but custom themes may persist

### Issue: Popup Doesn't Open

**Cause**: HTML/JS error in config files

**Fix**:
1. Check browser console for errors
2. Verify `config.html` and `config.js` are present
3. Try reloading the extension

## Debug Mode

To enable detailed logging:

1. Open service worker console: `chrome://extensions/` → ColorEx → "Inspect views: service worker"
2. Add breakpoints in worker.js if needed
3. Watch for messages like:
   - "Regex compilation failed" (pattern errors)
   - Chrome API errors
   - Tab change events

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Icon appears in toolbar
- [ ] Popup opens and shows default mappings
- [ ] GitHub URL changes theme to dark gray
- [ ] Reddit URL changes theme to orange
- [ ] Twitter URL changes theme to blue
- [ ] Non-matching URL resets theme
- [ ] Can add new mapping
- [ ] Can edit existing mapping
- [ ] Can delete mapping
- [ ] Pattern validator works
- [ ] Enable/disable toggle works
- [ ] Save button persists changes
- [ ] Reset button restores defaults

## Advanced Testing

### Test Custom Patterns

1. Add a new mapping:
   - Name: "Local Dev"
   - Pattern: `*localhost*`
   - Color: Green (#10b981)
   - Save

2. Navigate to `http://localhost:3000`
   - Should turn green

3. Test regex pattern:
   - Name: "HTTPS Sites"
   - Pattern: `^https://.*`
   - Color: Purple (#8b5cf6)
   - Save

4. Navigate to any HTTPS site
   - Should turn purple (will match first before wildcards)

### Test Multiple Windows

1. Open multiple Chrome windows
2. Navigate to different URLs in each
3. Focus each window
4. Theme should update based on active window's active tab

### Test Rapid Navigation

1. Quickly navigate between:
   - github.com
   - reddit.com  
   - twitter.com
   - google.com

2. Theme should update smoothly without lag

## Getting Help

If you still have issues:

1. Check the console logs (service worker and popup)
2. Verify Chrome version supports Manifest V3
3. Try in a fresh Chrome profile
4. Look for conflicts with other theme extensions
5. Check that no other extensions are modifying theme

## Success Indicators

When working correctly, you should see:

- ✅ Smooth theme transitions when switching tabs
- ✅ No console errors
- ✅ Service worker runs without crashes
- ✅ Popup UI responds to interactions
- ✅ Patterns validate correctly
- ✅ Saved settings persist across browser restarts
