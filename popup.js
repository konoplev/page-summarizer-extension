// popup.js
document.addEventListener('DOMContentLoaded', function() {
  const summarizeBtn = document.getElementById('summarizeBtn');
  const openSettingsLink = document.getElementById('openSettings');
  const loading = document.getElementById('loading');
  const summaryDiv = document.getElementById('summary');
  const statusDiv = document.getElementById('status');

  // Open settings page
  openSettingsLink.addEventListener('click', function(e) {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  summarizeBtn.addEventListener('click', async function() {
    try {
      // Load settings
      const settings = await chrome.storage.sync.get([
        'openaiApiKey',
        'maxTokens',
        'includeFacts',
        'structuredFormat',
        'autoOpen'
      ]);

      const apiKey = settings.openaiApiKey?.trim();
      
      if (!apiKey) {
        showStatus('Please configure your OpenAI API key in settings', 'error');
        setTimeout(() => {
          chrome.runtime.openOptionsPage();
        }, 2000);
        return;
      }

      summarizeBtn.disabled = true;
      loading.style.display = 'block';
      summaryDiv.style.display = 'none';
      statusDiv.style.display = 'none';

      // Get the current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      let pageContent;
      
      try {
        // Method 1: Try chrome.scripting.executeScript
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractPageContent
        });
        pageContent = results[0].result;
      } catch (scriptError) {
        console.log('Script injection failed, trying message passing:', scriptError);
        
        // Method 2: Fallback to message passing
        pageContent = await new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error('Could not communicate with page. Please refresh the page and try again.'));
            } else if (response && response.content) {
              resolve(response.content);
            } else {
              reject(new Error('No content received from page'));
            }
          });
        });
      }
      
      if (!pageContent || pageContent.trim().length === 0) {
        throw new Error('No content found on this page');
      }

      // Send content to OpenAI API
      const summary = await generateSummary(pageContent, apiKey, settings);
      
      if (settings.autoOpen !== false) {
        // Store the summary with a timestamp-based key
        const summaryKey = `summary_${Date.now()}`;
        const summaryData = {
          summary: summary,
          title: tab.title,
          url: tab.url,
          timestamp: new Date().toISOString()
        };
        
        // Store the summary
        await chrome.storage.local.set({
          [summaryKey]: summaryData,
          'latest_summary': summaryKey // Keep track of the latest summary
        });
        
        // Open summary in a new tab with the key as a parameter
        const summaryUrl = chrome.runtime.getURL(`summary.html?key=${summaryKey}`);
        await chrome.tabs.create({ url: summaryUrl });
        
        // Close the popup
        window.close();
      } else {
        // Display summary in popup (for users who disabled auto-open)
        summaryDiv.innerHTML = formatSummary(summary);
        summaryDiv.style.display = 'block';
        showStatus('Summary generated successfully!', 'success');
      }

    } catch (error) {
      console.error('Error:', error);
      showStatus(`Error: ${error.message}`, 'error');
    } finally {
      summarizeBtn.disabled = false;
      loading.style.display = 'none';
    }
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  }

  async function generateSummary(content, apiKey, settings) {
    // Build system prompt based on settings
    let systemPrompt = 'You are a helpful assistant that creates comprehensive summaries of web page content.';
    
    if (settings.includeFacts !== false) {
      systemPrompt += ' Include ALL important facts, examples, data points, quotes, and key details mentioned in the content.';
    }
    
    if (settings.structuredFormat !== false) {
      systemPrompt += ' Organize the information logically with clear structure. Use bullet points, numbered lists, and headers when appropriate.';
    }
    
    systemPrompt += ' Keep the language concise but ensure no important information is lost. The summary should be thorough enough that someone could understand the full scope of the content without reading the original.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please summarize the following web page content:\n\n${content}`
          }
        ],
        max_tokens: settings.maxTokens || 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate summary');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  function formatSummary(summary) {
    // Simple formatting: convert line breaks to HTML breaks
    return summary.replace(/\n/g, '<br>');
  }
});

// This function will be injected into the page
function extractPageContent() {
  // Create a clone of the document to avoid modifying the original
  const bodyClone = document.body.cloneNode(true);
  
  // Remove script and style elements from the clone
  const unwantedElements = bodyClone.querySelectorAll('script, style, nav, header, footer, aside, .advertisement, .ads, .popup, .modal, .cookie-banner, [class*="ad-"], [id*="ad-"], [class*="sponsor"]');
  unwantedElements.forEach(el => el.remove());

  // Get main content areas from the clone
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
  
  // Try to find main content first
  for (const selector of contentSelectors) {
    const element = bodyClone.querySelector(selector);
    if (element) {
      content = element.innerText || element.textContent;
      break;
    }
  }

  // If no main content found, get body text from clone
  if (!content) {
    content = bodyClone.innerText || bodyClone.textContent;
  }

  // Clean up the content
  content = content.replace(/\s+/g, ' ').trim();
  
  // Increase content length limit for more detailed summaries
  if (content.length > 15000) {
    content = content.substring(0, 15000) + '...';
  }

  return content;
}
