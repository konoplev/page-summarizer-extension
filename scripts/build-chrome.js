const fs = require('fs-extra');
const path = require('path');
const { replaceInFile } = require('replace-in-file');

const sourceDir = path.join(__dirname, '..');
const distDir = path.join(__dirname, '..', 'dist', 'chrome');

async function buildChrome() {
  console.log('🚀 Building Chrome extension...');
  
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
    
    // Create Chrome manifest (Manifest v3)
    const chromeManifest = {
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
    };
    
    await fs.writeJson(path.join(distDir, 'manifest.json'), chromeManifest, { spaces: 2 });
    console.log('✓ Created Chrome manifest.json');
    
    // Update JavaScript for Chrome compatibility
    await replaceInFile({
      files: path.join(distDir, '*.js'),
      from: /browser\./g,
      to: 'chrome.'
    });
    
    console.log('🎉 Chrome extension built successfully in dist/chrome/');
    
  } catch (error) {
    console.error('❌ Error building Chrome extension:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  buildChrome();
}

module.exports = buildChrome;
