// content.js
// This script runs on every page and can be used for additional content extraction
// or page manipulation if needed

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    const content = extractPageContent();
    sendResponse({ content: content });
  }
});

function extractPageContent() {
  // Create a clone of the document to avoid modifying the original
  const bodyClone = document.body.cloneNode(true);
  
  // Remove unwanted elements from the clone
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer', 'aside',
    '.advertisement', '.ads', '.popup', '.modal', '.cookie-banner',
    '[class*="ad-"]', '[id*="ad-"]', '[class*="sponsor"]'
  ];
  
  unwantedSelectors.forEach(selector => {
    const elements = bodyClone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
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
  if (!content) {
    content = bodyClone.innerText || bodyClone.textContent;
  }

  // Clean up the content
  content = content
    .replace(/\s+/g, ' ')  // Replace multiple whitespaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();

  return content;
}
