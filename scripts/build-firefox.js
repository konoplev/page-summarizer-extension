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
      'src/cross-browser.js'
    ];
    
    for (const file of filesToCopy) {
      const sourcePath = path.join(sourceDir, file);
      let destPath = path.join(distDir, file);
      
      if (await fs.pathExists(sourcePath)) {
        // Handle src directory files
        if (file.startsWith('src/')) {
          const fileName = path.basename(file);
          destPath = path.join(distDir, fileName);
        }
        
        await fs.copy(sourcePath, destPath);
        console.log(`✓ Copied ${file}`);
      }
    }
    
    // Copy icons directory, excluding hidden files
    const iconsSourcePath = path.join(sourceDir, 'icons');
    const iconsDestPath = path.join(distDir, 'icons');
    
    if (await fs.pathExists(iconsSourcePath)) {
      await fs.ensureDir(iconsDestPath);
      const iconFiles = await fs.readdir(iconsSourcePath);
      
      for (const iconFile of iconFiles) {
        // Skip hidden files (starting with .)
        if (!iconFile.startsWith('.')) {
          const sourceIconPath = path.join(iconsSourcePath, iconFile);
          const destIconPath = path.join(iconsDestPath, iconFile);
          await fs.copy(sourceIconPath, destIconPath);
          console.log(`✓ Copied icons/${iconFile}`);
        }
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
          "strict_min_version": "58.0"
        }
      }
    };
    
    await fs.writeJson(path.join(distDir, 'manifest.json'), firefoxManifest, { spaces: 2 });
    console.log('✓ Created Firefox manifest.json');
    
    // Update JavaScript for Firefox compatibility (exclude cross-browser.js as it handles compatibility internally)
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
        
        // Note: Removed chrome.scripting.executeScript replacement as cross-browser.js handles this properly
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
    
    // Clean up any hidden files that might have been created
    const hiddenFiles = await fs.readdir(distDir, { withFileTypes: true });
    for (const file of hiddenFiles) {
      if (file.name.startsWith('.') && file.isFile()) {
        await fs.remove(path.join(distDir, file.name));
        console.log(`✓ Removed hidden file: ${file.name}`);
      }
    }
    
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
