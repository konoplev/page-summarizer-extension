# Contributing to Page Summarizer

Thank you for your interest in contributing to Page Summarizer! This document provides guidelines and information for contributors.

## 🤝 Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features or improvements
- 📝 Improve documentation
- 🔧 Submit code improvements
- 🌍 Help with translations
- 🧪 Test the extension on different websites and browsers

## 📋 Before Contributing

1. **Search existing issues** to see if your bug/feature has already been reported
2. **Read the README** to understand the project structure
3. **Check the CHANGELOG** to see what's been recently added
4. **Test your changes** on both Chrome and Firefox

## 🐛 Reporting Bugs

When reporting bugs, please include:

### Bug Report Template
```
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- Browser: [e.g. Chrome 119, Firefox 120]
- Extension version: [e.g. 1.0.0]
- Operating System: [e.g. macOS 14, Windows 11, Ubuntu 22.04]
- Website where bug occurred: [e.g. example.com]

**Additional context**
Add any other context about the problem here.
```

## 💡 Suggesting Features

When suggesting features, please include:

### Feature Request Template
```
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Add any other context, mockups, or examples about the feature request.
```

## 🔧 Development Setup

### Prerequisites
- Node.js (for build scripts)
- Git
- Chrome and/or Firefox for testing

### Getting Started
```bash
# Clone the repository
git clone https://github.com/konoplev/page-summarizer-extension.git
cd page-summarizer-extension

# Install dependencies (if any)
npm install

# Build the extension
./build.sh

# Load in browser for testing
# Chrome: Load unpacked from dist/chrome/
# Firefox: Load temporary add-on from dist/firefox/manifest.json
```

### Project Structure
```
├── src/                    # Source files
│   └── cross-browser.js   # Cross-browser compatibility layer
├── scripts/               # Build scripts
│   ├── build-chrome.js   # Chrome-specific build
│   └── build-firefox.js  # Firefox-specific build
├── icons/                 # Extension icons
├── dist/                  # Built extensions (generated)
├── *.js                   # Main extension files
├── *.html                 # UI files
└── build.sh              # Main build script
```

## 📝 Code Style Guidelines

### JavaScript
- Use modern ES6+ syntax
- Use `const` and `let` instead of `var`
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code formatting

### HTML/CSS
- Use semantic HTML elements
- Keep CSS organized and commented
- Use CSS custom properties for theming
- Ensure responsive design

### Cross-Browser Compatibility
- Use the `crossBrowser` wrapper for all browser APIs
- Test changes in both Chrome and Firefox
- Consider manifest differences between v2 and v3

## 🧪 Testing

### Manual Testing
- Test on various websites (news sites, blogs, documentation)
- Test all features: summarization, translation, settings
- Verify UI responsiveness
- Check for console errors

### Before Submitting
- [ ] Code builds without errors (`./build.sh`)
- [ ] Extension loads in both Chrome and Firefox
- [ ] All features work as expected
- [ ] No console errors or warnings
- [ ] Changes are documented

## 📤 Submitting Changes

### Pull Request Process
1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Pull Request Template
```
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] No console errors
- [ ] All features work as expected

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings
- [ ] I have updated the documentation accordingly
```

## 📚 Documentation

When contributing documentation:
- Use clear, concise language
- Include examples where helpful
- Update relevant files (README, CHANGELOG, etc.)
- Consider both technical and non-technical users

## 🌍 Translation

To help with translations:
1. Check `popup.js` and `options.html` for translatable text
2. Test with different languages
3. Ensure UI elements don't break with longer text
4. Consider right-to-left languages

## 🤔 Questions?

- **General questions**: Open a [GitHub Discussion](https://github.com/konoplev/page-summarizer-extension/discussions)
- **Bug reports**: Open a [GitHub Issue](https://github.com/konoplev/page-summarizer-extension/issues)
- **Feature requests**: Open a [GitHub Issue](https://github.com/konoplev/page-summarizer-extension/issues) with the "enhancement" label

## 📄 License

By contributing to Page Summarizer, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- CHANGELOG.md for significant contributions
- GitHub contributors list
- Release notes for major features

Thank you for making Page Summarizer better! 🚀
