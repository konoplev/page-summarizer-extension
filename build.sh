#!/bin/bash

# Cross-Browser Extension Builder
# Builds both Chrome and Firefox versions from the same source

echo "🔄 Building cross-browser extension..."

# Create dist directories
mkdir -p dist/chrome dist/firefox

# Build Chrome version (Manifest v3)
echo "🚀 Building Chrome version..."
cp -r *.html *.js dist/chrome/ 2>/dev/null
cp -r icons dist/chrome/ 2>/dev/null
cp -r src dist/chrome/ 2>/dev/null

# Fix script paths in Chrome HTML files
sed -i '' 's|src/cross-browser\.js|cross-browser.js|g' dist/chrome/*.html 2>/dev/null
# Move cross-browser.js to root level for easier access
mv dist/chrome/src/cross-browser.js dist/chrome/ 2>/dev/null
# Remove empty src directory
rmdir dist/chrome/src 2>/dev/null

# Create Chrome manifest
cat > dist/chrome/manifest.json << 'EOF'
{
  "manifest_version": 3,
  "name": "Page Summarizer",
  "version": "1.0.0",
  "description": "AI-powered webpage summarization with translation support. Uses your OpenAI API key for secure, private summarization.",
  "homepage_url": "https://github.com/konoplev/page-summarizer-extension",
  "permissions": [
    "activeTab",
    "storage",
    "scripting",
    "contextMenus"
  ],
  "host_permissions": [
    "https://api.openai.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Summarize Page"
  },
  "options_page": "options.html",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "web_accessible_resources": [
    {
      "resources": ["summary.html"],
      "matches": ["<all_urls>"]
    }
  ]
}
EOF

# Build Firefox version (Manifest v2)
echo "🦊 Building Firefox version..."
cp -r *.html *.js dist/firefox/ 2>/dev/null
cp -r icons dist/firefox/ 2>/dev/null
cp -r src dist/firefox/ 2>/dev/null

# Fix script paths in Firefox HTML files
sed -i '' 's|src/cross-browser\.js|cross-browser.js|g' dist/firefox/*.html 2>/dev/null
# Move cross-browser.js to root level for easier access
mv dist/firefox/src/cross-browser.js dist/firefox/ 2>/dev/null
# Remove empty src directory
rmdir dist/firefox/src 2>/dev/null

# Create Firefox manifest
cat > dist/firefox/manifest.json << 'EOF'
{
  "manifest_version": 2,
  "name": "Page Summarizer",
  "version": "1.0.0",
  "description": "AI-powered webpage summarization with translation support. Uses your OpenAI API key for secure, private summarization.",
  "homepage_url": "https://github.com/konoplev/page-summarizer-extension",
  "permissions": [
    "activeTab",
    "storage",
    "contextMenus",
    "https://api.openai.com/*"
  ],
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "browser_action": {
    "default_popup": "popup.html",
    "default_title": "Summarize Page"
  },
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "web_accessible_resources": ["summary.html"],
  "browser_specific_settings": {
    "gecko": {
      "id": "page-summarizer@konoplev.me",
      "strict_min_version": "57.0"
    }
  }
}
EOF

# Apply Firefox compatibility patches
echo "🔧 Applying Firefox compatibility patches..."

# Add compatibility layer to all JS files in Firefox build
for jsfile in dist/firefox/*.js; do
  if [ -f "$jsfile" ]; then
    # Create temp file with compatibility layer
    cat > temp_compat.js << 'EOF'
// Firefox compatibility layer
(function() {
  if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
    window.chrome = browser;
  }
  
  // Polyfill chrome.action for Firefox
  if (chrome.browserAction && !chrome.action) {
    chrome.action = chrome.browserAction;
  }
  
  // Polyfill chrome.scripting for Firefox
  if (!chrome.scripting) {
    chrome.scripting = {
      executeScript: function(injection) {
        return new Promise((resolve, reject) => {
          const tabId = injection.target.tabId;
          const code = injection.func ? `(${injection.func.toString()})()` : injection.code;
          chrome.tabs.executeScript(tabId, {code}, (result) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(result ? [{result: result[0]}] : []);
            }
          });
        });
      }
    };
  }
})();

EOF
    
    # Prepend compatibility layer to the original file
    cat temp_compat.js "$jsfile" > temp_combined.js
    mv temp_combined.js "$jsfile"
    rm temp_compat.js
  fi
done

echo "✅ Chrome extension built in: dist/chrome/"
echo "✅ Firefox extension built in: dist/firefox/"
echo ""
echo "📦 To install:"
echo "  Chrome: Load unpacked extension from dist/chrome/"
echo "  Firefox: Load temporary add-on from dist/firefox/manifest.json"
echo ""
echo "🎉 Cross-browser build complete!"
