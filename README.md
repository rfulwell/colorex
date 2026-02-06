# ColorEx - URL-Based Browser Theme Controller

A Chrome extension that dynamically changes your browser's skin color based on the currently active URL. Supports both wildcard patterns (`*`, `?`) and regular expressions for flexible URL matching.

## Features

- 🎨 **Dynamic Theme Changes**: Automatically updates browser skin colors when you navigate to different sites
- 🔍 **Flexible Pattern Matching**: Supports both simple wildcard patterns and advanced regular expressions
- ⚙️ **Easy Configuration**: User-friendly popup interface to manage URL-color mappings
- 💾 **Persistent Settings**: Your configurations are saved and synced across Chrome instances
- ✅ **Pattern Validator**: Built-in tool to test your URL patterns before saving

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/rfulwell/colorex.git
   cd colorex
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" using the toggle in the top right

4. Click "Load unpacked" and select the `colorex` directory

5. The ColorEx icon should now appear in your extensions toolbar

## Usage

### Opening the Configuration Panel

Click the ColorEx icon in your browser toolbar to open the configuration panel.

### Adding URL-Color Mappings

1. Click the "+ New Mapping" button
2. Enter a name for your mapping (e.g., "GitHub")
3. Enter a URL pattern (see examples below)
4. Select a color using the color picker
5. Click "Save Mappings" to apply your changes

### URL Pattern Examples

#### Wildcard Patterns

- `*github.com*` - Matches any URL containing "github.com"
- `https://www.google.com/*` - Matches all Google pages
- `*://mail.google.com/*` - Matches Gmail regardless of protocol
- `*.reddit.com*` - Matches all Reddit subdomains
- `https://example.com/page?` - Matches URLs with one character after "page"

#### Regular Expression Patterns

Regular expressions are automatically detected when your pattern contains regex-specific characters:

- `^https://github\.com/.*` - Matches GitHub URLs starting with https
- `^https?://.*\.wikipedia\.org/.*` - Matches Wikipedia sites with http or https
- `(facebook|twitter|instagram)\.com` - Matches multiple social media sites
- `^https://.*\.(jpg|png|gif)$` - Matches image file URLs

### Testing Patterns

Use the "Expression Validator" section to test your patterns:

1. Enter your URL pattern in the first field
2. Enter a test URL in the second field
3. Click "Validate" to see if they match

### Managing Mappings

- **Enable/Disable**: Use the checkbox to temporarily disable a mapping
- **Edit**: Click on any field to modify the mapping
- **Delete**: Click the "Delete" button to remove a mapping
- **Reset**: Click "Reset Defaults" to restore the initial example mappings

## How It Works

### Pattern Matching Algorithm

ColorEx uses an intelligent pattern detection system:

1. **Regex Detection**: If your pattern contains characters like `(`, `)`, `[`, `]`, `{`, `}`, `^`, `$`, `|`, `+`, or `\`, it's treated as a regular expression

2. **Wildcard Matching**: Otherwise, it's treated as a wildcard pattern where:
   - `*` matches any sequence of characters (including none)
   - `?` matches exactly one character

### Theme Application

When a URL matches a pattern:

1. The extension applies the specified color to the browser frame
2. Automatically calculates appropriate colors for inactive frames and toolbars
3. Selects contrasting text colors for readability

When no patterns match, the extension resets to your default browser theme.

## Examples

### Example 1: Development Sites

```
Pattern: *localhost*
Color: #10b981 (Green)
Name: Local Development
```

### Example 2: Work Sites

```
Pattern: *.company.com*
Color: #3b82f6 (Blue)
Name: Company Sites
```

### Example 3: Documentation

```
Pattern: ^https://.*\.(github\.io|readthedocs\.io).*
Color: #8b5cf6 (Purple)
Name: Documentation
```

## Default Mappings

ColorEx comes with these default mappings:

- **GitHub** (`*github.com*`): Dark Gray (#1f2328)
- **Reddit** (`*reddit.com*`): Orange (#ff4500)
- **Twitter** (`*twitter.com*`): Blue (#1da1f2)

## Permissions

ColorEx requires the following permissions:

- `tabs`: To detect URL changes and active tab information
- `storage`: To save your configuration
- `theme`: To update the browser theme colors
- `<all_urls>`: To monitor navigation across all websites

## Technical Details

- **Manifest Version**: 3
- **Service Worker**: Uses modern Chrome extension architecture
- **Storage**: Syncs configuration across Chrome instances
- **Performance**: Lightweight with minimal resource usage

## Troubleshooting

### Theme not changing?

1. Check that your mapping is enabled (checkbox is checked)
2. Verify your URL pattern matches the current URL using the validator
3. Make sure you clicked "Save Mappings" after making changes

### Pattern not matching?

1. Use the built-in validator to test your pattern
2. For wildcards, remember `*` matches any characters and `?` matches exactly one
3. For regex, ensure your syntax is valid (the extension will log errors to the console)

### Colors look wrong?

The extension automatically adjusts colors for different UI elements. If a color doesn't look right, try:
- Choosing a different shade
- Using a color with more contrast
- Checking the color in both light and dark system themes

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use and modify as needed.

## Author

Built with ❤️ for better browser customization

---

**Note**: This extension modifies your browser's theme. Some websites may override these colors with their own styles.