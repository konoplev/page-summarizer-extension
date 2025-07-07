// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('Page Summarizer extension installed');
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    // This can be used for additional background processing if needed
    console.log('Summarize request received');
  }
});

// Optional: Add context menu item
chrome.contextMenus.create({
  id: 'summarizePage',
  title: 'Summarize this page',
  contexts: ['page']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'summarizePage') {
    // Open the popup or trigger summarization
    chrome.action.openPopup();
  }
});
