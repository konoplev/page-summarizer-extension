# Page Summarizer Extension (Chrome & Firefox)

> **🤖 AI-Generated Extension**: This entire extension was completely coded by AI (Claude Sonnet 4) as an experiment to see if a fully functional browser extension could be implemented without human intervention.

A cross-browser extension that summarizes web page content using OpenAI's API with advanced customization options. Compatible with Chrome, Firefox, and other major browsers.

## Features

- 🔍 **Smart Content Extraction**: Automatically identifies and extracts main content from web pages
- 🤖 **AI-Powered Summaries**: Uses OpenAI's GPT-4o-mini for high-quality summaries
- � **Multi-Language Translation**: Summarize content in 21 different languages
- �🎨 **Beautiful UI**: Modern, glassmorphism-inspired design
- 🔐 **Secure Settings**: API key and preferences stored locally in Chrome's sync storage
- ⚡ **Fast**: Optimized content extraction and processing
- 🖨️ **Export Options**: Copy summaries with markdown formatting or print
- ⚙️ **Customizable**: Extensive settings for personalized experience

## Installation

### Automated Build (Recommended)

The extension comes with an automated build system that creates optimized versions for both browsers:

```bash
# Clone the repository
git clone <repository-url>
cd summarizer-extension

# Build for both browsers
./build.sh
```

This creates two optimized versions:
- `dist/chrome/` - Chrome/Chromium browsers (Manifest v3)
- `dist/firefox/` - Firefox (Manifest v2 with compatibility layer)

### Chrome/Chromium-based Browsers (Chrome, Edge, Brave, Opera)

1. Run the build script (see above) or use the source directory
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `dist/chrome/` directory (or root directory if using source)
5. The extension will appear in your browser toolbar

### Firefox

1. Run the build script to create the Firefox-compatible version
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the `dist/firefox/manifest.json` file
6. The extension will appear in your browser toolbar

## Setup & Configuration

### Initial Setup
1. Click the extension icon in your browser toolbar
2. Click "⚙️ Settings" to open the options page
3. Enter your OpenAI API key
4. Configure your preferences (see settings below)
5. Click "Save Settings"

### Extension Settings

Access settings by right-clicking the extension icon and selecting "Options", or click the settings link in the popup.

#### **API Configuration**
- **OpenAI API Key**: Your personal API key from OpenAI Platform
  - Get your key from [OpenAI Platform](https://platform.openai.com/api-keys)
  - Stored securely in Chrome's sync storage

- **OpenAI Model**: Configure which AI model to use for summarization
  - **Default**: `gpt-4o-mini` (cost-effective, fast)
  - **Popular Options**: 
    - `gpt-4o-mini`: Fastest and most cost-effective
    - `gpt-4o`: More capable, higher quality summaries
    - `gpt-3.5-turbo`: Legacy model, good balance
  - **Validate Model**: Click "Validate Model" button to check if your chosen model is available
  - **Real-time Validation**: Queries OpenAI API to confirm model availability

#### **Summary Preferences**
- **Include All Facts and Examples**: Toggle comprehensive detail inclusion
  - ✅ Enabled: Includes ALL facts, examples, data points, quotes
  - ❌ Disabled: Focuses on main points only
  - Default: Enabled

- **Use Structured Formatting**: Control summary organization
  - ✅ Enabled: Uses headers, bullet points, numbered lists
  - ❌ Disabled: Plain paragraph format
  - Default: Enabled

#### **Display Options**
- **Automatically Open Summary in New Tab**: Control summary display
  - ✅ Enabled: Opens summary in dedicated page with copy/print options
  - ❌ Disabled: Shows summary in popup window
  - Default: Enabled

#### **Translation Options**
- **Translate Summary To**: Choose target language for summaries
  - **Default**: None (original language)
  - **Available Languages**: 
    - **English**: For translating non-English content to English
    - **European**: Spanish, French, German, Italian, Portuguese, Dutch, Swedish, Danish, Norwegian, Finnish, Polish
    - **Slavic**: Russian, Ukrainian
    - **Asian**: Japanese, Korean, Chinese, Hindi, Thai, Vietnamese
    - **Middle Eastern**: Arabic, Turkish

## Usage

1. Navigate to any web page you want to summarize
2. Click the Page Summarizer extension icon
3. Click "Summarize This Page"
4. Wait for the AI to generate your summary
5. Summary opens in a new tab with options to copy or print

## Getting an OpenAI API Key

1. Visit [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API keys section
4. Create a new API key
5. Copy and paste it into the extension settings

## Summary Features

### Markdown Rendering
- **Headers** (H1-H6): `#`, `##`, `###`, `####`, `#####`, `######`
- **Bold Text**: `**bold**` or `__bold__`
- **Italic Text**: `*italic*` or `_italic_`
- **Lists**: Bulleted (`-`, `*`) and numbered (`1.`, `2.`)
- **Links**: `[text](url)` with click-to-open functionality
- **Code**: Inline `` `code` `` and code blocks ``` ```
- **Blockquotes**: `> quoted text`

### Export Options
- **Copy with Formatting**: Preserves original markdown for pasting into other apps
- **Print Summary**: Professional print layout
- **Back to Original**: Quick return to source page

## Browser Compatibility

This extension uses a sophisticated cross-browser compatibility system that automatically handles differences between Chrome and Firefox.

### Chrome/Chromium Browsers (Fully Supported)
- ✅ **Chrome**: Full support with Manifest v3
- ✅ **Edge**: Full support (Chromium-based)
- ✅ **Brave**: Full support (Chromium-based)
- ✅ **Opera**: Full support (Chromium-based)
- ✅ **Vivaldi**: Full support (Chromium-based)

### Firefox (Fully Supported)
- ✅ **Firefox Desktop**: Full support with automatic Manifest v2 conversion
- ✅ **Firefox ESR**: Full support
- 🔄 **Firefox Mobile**: Limited extension support on mobile platform

### Cross-Browser Features
- **Unified API**: Uses `crossBrowser` wrapper for consistent behavior
- **Automatic Manifests**: Build system creates appropriate manifest versions
- **Storage Compatibility**: Handles differences between Chrome and Firefox storage APIs
- **Message Passing**: Compatible messaging between content scripts and background
- **Settings Sync**: Works with both Chrome sync and Firefox sync

### Mobile Support
- 📱 **Mobile Chrome/Safari**: Use the PWA version in `/mobile-pwa/`
- 🦊 **Firefox Mobile**: Limited extension support
- 🥝 **Kiwi Browser (Android)**: Full Chrome extension support

## Privacy & Security

- **API Key Storage**: Stored locally in Chrome's sync storage, never transmitted to third parties
- **Content Processing**: Page content is sent to OpenAI's API for summarization only
- **No Data Collection**: Extension doesn't collect or store user data
- **Open Source**: Full source code available for review

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **API Used**: OpenAI GPT-4o-mini
- **Content Extraction**: Smart DOM parsing with fallback strategies
- **Storage**: Chrome's sync storage for settings persistence
- **Architecture**: Service worker background script with content script injection

## File Structure

```
summarizer-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── options.html          # Settings page UI
├── options.js            # Settings functionality
├── background.js         # Background service worker
├── content.js            # Content script for page extraction
├── summary.html          # Summary display page
├── summary.js            # Summary page functionality
├── icons/                # Extension icons
├── mobile-pwa/           # Progressive Web App version
│   ├── index.html        # Mobile web app
│   ├── manifest.json     # PWA manifest
│   └── sw.js            # Service worker
└── README.md             # This file
```

## Development

To modify the extension:

1. Edit the relevant files
2. Reload the extension in `chrome://extensions/`
3. Test your changes

### Adding New Languages

To add more translation languages:

1. Update the `<select>` options in `options.html`
2. Add the language mapping in `popup.js` `languageNames` object
3. Test with the new language option

## Safari Conversion

To convert for Safari:

```bash
xcrun safari-web-extension-converter /path/to/summarizer-extension
```

This creates an Xcode project for Safari App Store distribution.

## Troubleshooting

- **No content found**: Some pages may have complex structures. Try refreshing the page.
- **API errors**: Check your API key and ensure you have credits available.
- **Extension not working**: Try reloading the extension in Chrome's extension manager.
- **Translation not working**: Ensure you've selected a language in settings and saved.
- **Summary page blank**: Check if popup blockers are interfering with new tab creation.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is open source and available under the [MIT License](LICENSE).
