// background.js
// Cross-browser compatibility for background script
const isFirefox = typeof browser !== 'undefined';
const isChrome = typeof chrome !== 'undefined' && typeof browser === 'undefined';

const browserAPI = isFirefox ? browser : chrome;

browserAPI.runtime.onInstalled.addListener(() => {
  // Extension installed
});

// Handle messages from content script or popup
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    // This can be used for additional background processing if needed
  }
});

// Optional: Add context menu item
if (browserAPI.contextMenus) {
  browserAPI.contextMenus.create({
    id: 'summarizePage',
    title: 'Summarize this page',
    contexts: ['page']
  });

  browserAPI.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'summarizePage') {
      // Open the popup or trigger summarization
      if (browserAPI.action) {
        browserAPI.action.openPopup();
      } else if (browserAPI.browserAction) {
        browserAPI.browserAction.openPopup();
      }
    }
  });
}
