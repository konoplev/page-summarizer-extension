// content.js
// This script runs on every page and can be used for additional content extraction
// or page manipulation if needed

// Cross-browser compatibility for content script
const isFirefox = typeof browser !== 'undefined';
const browserAPI = isFirefox ? browser : chrome;

// Listen for messages from popup
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    try {
      const content = extractPageContent();
      sendResponse({ content: content });
      return true; // Keep the message channel open for async response
    } catch (error) {
      sendResponse({ content: null, error: error.message });
      return true;
    }
  }
});

function extractPageContent() {
  // Check if document.body exists
  if (!document.body) {
    return document.documentElement ? document.documentElement.textContent.trim() : '';
  }
  
  // Create a clone of the document to avoid modifying the original
  const bodyClone = document.body.cloneNode(true);
  
  // Remove unwanted elements from the clone
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer', 'aside',
    '.advertisement', '.ads', '.popup', '.modal', '.cookie-banner',
    '[class*="ad-"]', '[id*="ad-"]', '[class*="sponsor"]'
  ];
  
  unwantedSelectors.forEach(selector => {
    try {
      const elements = bodyClone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    } catch (e) {
      // Silently continue if selector fails
    }
  });

  // Priority content selectors
  const contentSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '.main-content',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.story-body',
    '.post-body'
  ];

  let content = '';
  
  // Try to find main content
  for (const selector of contentSelectors) {
    const element = bodyClone.querySelector(selector);
    if (element) {
      content = element.innerText || element.textContent;
      break;
    }
  }

  // Fallback to body content
  if (!content || content.trim().length < 50) {
    content = bodyClone.innerText || bodyClone.textContent || '';
  }
  
  // Final fallback: try document content
  if (!content || content.trim().length < 20) {
    content = document.body ? (document.body.innerText || document.body.textContent) : '';
  }

  // Clean up the content
  content = content
    .replace(/\s+/g, ' ')  // Replace multiple whitespaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();

  return content;
}
