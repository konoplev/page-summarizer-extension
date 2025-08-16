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
    
    // Clean up any hidden files that might have been created
    const hiddenFiles = await fs.readdir(distDir, { withFileTypes: true });
    for (const file of hiddenFiles) {
      if (file.name.startsWith('.') && file.isFile()) {
        await fs.remove(path.join(distDir, file.name));
        console.log(`✓ Removed hidden file: ${file.name}`);
      }
    }
    
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
