# Page Summarizer Chrome Extension

A Chrome extension that summarizes web page content using OpenAI's GPT-4o-mini model.

## Features

- 🔍 **Smart Content Extraction**: Automatically identifies and extracts main content from web pages
- 🤖 **AI-Powered Summaries**: Uses OpenAI's GPT-4o-mini for high-quality summaries
- 🎨 **Beautiful UI**: Modern, glassmorphism-inspired design
- 🔐 **Secure**: API key stored locally in Chrome's sync storage
- ⚡ **Fast**: Optimized content extraction and processing

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension will appear in your browser toolbar

## Setup

1. Click the extension icon in your browser toolbar
2. Enter your OpenAI API key in the input field
3. Click "Summarize This Page" to generate a summary

## Getting an OpenAI API Key

1. Visit [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API keys section
4. Create a new API key
5. Copy and paste it into the extension

## Usage

1. Navigate to any web page you want to summarize
2. Click the Page Summarizer extension icon
3. Enter your OpenAI API key (only needed once)
4. Click "Summarize This Page"
5. Wait for the AI to generate your summary

## Privacy

- Your API key is stored locally in Chrome's sync storage
- Page content is sent to OpenAI's API for summarization
- No data is collected or stored by this extension

## Technical Details

- **Manifest Version**: 3
- **API Used**: OpenAI GPT-4o-mini
- **Content Extraction**: Smart DOM parsing with fallback strategies
- **Storage**: Chrome's sync storage for API key persistence

## File Structure

```
summarizer-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── background.js         # Background script
├── content.js            # Content script for page extraction
├── icons/                # Extension icons
└── README.md             # This file
```

## Development

To modify the extension:

1. Edit the relevant files
2. Reload the extension in `chrome://extensions/`
3. Test your changes

## Troubleshooting

- **No content found**: Some pages may have complex structures. Try refreshing the page.
- **API errors**: Check your API key and ensure you have credits available.
- **Extension not working**: Try reloading the extension in Chrome's extension manager.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is open source and available under the [MIT License](LICENSE).
