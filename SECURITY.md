# Security Notes for ColorEx

## Permissions

| Permission | Why |
|---|---|
| `tabs` | Read active tab URL to match against patterns |
| `storage` | Persist user configuration via Chrome sync storage |
| `scripting` | Inject a visual color indicator into web pages |
| `<all_urls>` (host) | Required so the indicator can be injected on any site |

`<all_urls>` is a broad host permission. It is needed because the extension must react to _any_ URL the user configures. The extension does **not** read page content, modify forms, or intercept network requests.

## What the extension can and cannot do

**Can:**
- Read the URL of the active tab
- Inject a small, inert `<div>` (color bar) into web pages
- Store configuration in Chrome sync storage

**Cannot:**
- Read or modify page content, cookies, or form data
- Make network requests
- Access browsing history beyond the current tab URL
- Run on restricted pages (`chrome://`, Web Store, etc.)

## ReDoS mitigation

User-supplied regex patterns are validated before execution:

1. Patterns longer than 500 characters are rejected.
2. Patterns containing nested quantifiers (e.g. `(a+)+`) or group-with-alternation quantifiers (e.g. `(a|b)+`) are rejected.
3. All regex compilation is wrapped in try/catch.

This prevents catastrophic backtracking from freezing the service worker.

## Input validation

- Hex color values are validated and normalized before use (`#RRGGBB` format).
- Empty and malformed patterns are rejected at save time.
- Storage save errors (e.g. quota exceeded) are caught and reported to the user.

## DOM safety

- The popup UI uses `<template>` cloning and `.textContent` for rendering — no `innerHTML` with user data.
- The injected indicator element uses inline styles only and has `pointer-events: none`.
