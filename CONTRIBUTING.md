# Contributing to ColorEx

Thank you for your interest in contributing to ColorEx! This document provides guidelines and instructions for contributing.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Browser version and operating system
- Screenshots if applicable

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- A clear description of the feature
- Use cases and benefits
- Any implementation ideas you have

### Pull Requests

1. **Fork the repository** and create a new branch from `main`
2. **Make your changes** following the code style of the project
3. **Test your changes** by running `npm test`
4. **Test manually** by loading the extension in Chrome
5. **Commit your changes** with clear, descriptive commit messages
6. **Push to your fork** and submit a pull request

#### Pull Request Guidelines

- Keep changes focused on a single feature or bug fix
- Update documentation if needed
- Add or update tests if applicable
- Ensure all tests pass
- Follow the existing code style

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/rfulwell/colorex.git
   cd colorex
   ```

2. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the `colorex` directory

3. Make changes and reload the extension to test

## Running Tests

```bash
npm test
```

## Code Style

- Use consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small

## Questions?

Feel free to open an issue for any questions about contributing!
