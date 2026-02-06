# ColorEx

A Chrome extension that shows a colored indicator bar at the top of web pages based on URL patterns. Useful for visually distinguishing environments (production vs staging), grouping sites by category, or just adding color to your browsing.

## How it works

When you navigate to a URL that matches one of your configured patterns, a thin colored bar appears at the top of the page. When no pattern matches, the bar is removed.

Patterns can use **wildcards** (`*` matches any characters, `?` matches one character) or **regular expressions** (auto-detected when the pattern contains regex syntax like `^`, `$`, `(`, `[`, `+`, or `\`).

## Installation

1. Clone the repo and open `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked** and select the `colorex` directory

## Usage

Click the ColorEx icon in the toolbar to open the popup. From there you can:

- **Add** new URL-to-color mappings
- **Edit** the label, pattern, and color of existing mappings
- **Delete** or **disable** mappings with the checkbox/button
- **Test** patterns using the Expression Validator at the bottom
- **Save** to persist changes (synced across Chrome instances)
- **Reset** to restore the built-in defaults

### Pattern examples

| Pattern | Matches |
|---|---|
| `*github.com*` | Any URL containing `github.com` |
| `*localhost*` | Local development servers |
| `*.company.com*` | All subdomains of `company.com` |
| `^https://github\.com/.*` | GitHub over HTTPS only |
| `(dev\|staging)\.example\.com` | Dev or staging environments |

Mappings are matched in list order (first match wins).

## Default mappings

| Label | Pattern | Color |
|---|---|---|
| GitHub | `*github.com*` | #1f2328 |
| Reddit | `*reddit.com*` | #ff4500 |
| X | `*x.com*` | #000000 |

## Running tests

```bash
npm test
```

## Permissions

See [SECURITY.md](SECURITY.md) for a detailed breakdown of what permissions are used and why.

## License

MIT
