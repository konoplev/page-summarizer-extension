const fs = require('fs-extra');
const path = require('path');
const { replaceInFile } = require('replace-in-file');

const sourceDir = path.join(__dirname, '..');
const distDir = path.join(__dirname, '..', 'dist', 'firefox');

async function buildFirefox() {
  console.log('🦊 Building Firefox extension...');
  
  try {
    // Clean and create dist directory
    await fs.remove(distDir);
    await fs.ensureDir(distDir);
    
    // Copy all source files
    const filesToCopy = [
      'popup.html',
      'popup.js',
      'options.html',
      'options.js',
      'background.js',
      'content.js',
      'summary.html',
      'summary.js',
      'icons'
    ];
    
    for (const file of filesToCopy) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(distDir, file);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, destPath);
        console.log(`✓ Copied ${file}`);
      }
    }
    
    // Create Firefox manifest (Manifest v2)
    const firefoxManifest = {
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
      "options_page": "options.html",
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
    };
    
    await fs.writeJson(path.join(distDir, 'manifest.json'), firefoxManifest, { spaces: 2 });
    console.log('✓ Created Firefox manifest.json');
    
    // Update JavaScript for Firefox compatibility
    const jsFiles = [
      path.join(distDir, 'popup.js'),
      path.join(distDir, 'options.js'),
      path.join(distDir, 'background.js'),
      path.join(distDir, 'summary.js')
    ];
    
    for (const jsFile of jsFiles) {
      if (await fs.pathExists(jsFile)) {
        // Replace Chrome-specific APIs with Firefox-compatible ones
        await replaceInFile({
          files: jsFile,
          from: /chrome\.action/g,
          to: 'chrome.browserAction'
        });
        
        await replaceInFile({
          files: jsFile,
          from: /chrome\.scripting\.executeScript/g,
          to: 'browser.tabs.executeScript'
        });
        
        // Add browser compatibility layer
        const content = await fs.readFile(jsFile, 'utf8');
        const compatLayer = `
// Firefox compatibility layer
if (typeof browser !== 'undefined') {
  var chrome = browser;
}
if (chrome.browserAction) {
  chrome.action = chrome.browserAction;
}

${content}`;
        
        await fs.writeFile(jsFile, compatLayer);
      }
    }
    
    // Update background.js for Firefox
    const backgroundFile = path.join(distDir, 'background.js');
    if (await fs.pathExists(backgroundFile)) {
      await replaceInFile({
        files: backgroundFile,
        from: /chrome\.contextMenus\.create/g,
        to: 'chrome.contextMenus && chrome.contextMenus.create'
      });
    }
    
    console.log('✓ Applied Firefox compatibility patches');
    console.log('🎉 Firefox extension built successfully in dist/firefox/');
    
  } catch (error) {
    console.error('❌ Error building Firefox extension:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  buildFirefox();
}

module.exports = buildFirefox;
