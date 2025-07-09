// popup.js
document.addEventListener('DOMContentLoaded', function() {
  // Check if crossBrowser is loaded
  if (typeof crossBrowser === 'undefined') {
    return;
  }

  const summarizeBtn = document.getElementById('summarizeBtn');
  const openSettingsLink = document.getElementById('openSettings');
  const loading = document.getElementById('loading');
  const summaryDiv = document.getElementById('summary');
  const statusDiv = document.getElementById('status');

  // Open settings page
  openSettingsLink.addEventListener('click', function(e) {
    e.preventDefault();
    crossBrowser.runtime.openOptionsPage().catch(function(error) {
      // Fallback: try to open manually
      const optionsUrl = crossBrowser.runtime.getURL('options.html');
      crossBrowser.tabs.create({ url: optionsUrl });
    });
  });

  summarizeBtn.addEventListener('click', async function() {
    try {
      // Load settings
      const settings = await crossBrowser.storage.sync.get([
        'openaiApiKey',
        'openaiModel',
        'includeFacts',
        'structuredFormat',
        'autoOpen',
        'translateTo'
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
      const [tab] = await crossBrowser.tabs.query({ active: true, currentWindow: true });
      
      let pageContent;
      
      // Firefox prefers message passing, Chrome prefers script injection
      const isFirefox = typeof browser !== 'undefined';
      
      if (isFirefox) {
        // Method 1 for Firefox: Use message passing (more reliable)
        try {
          const response = await sendMessageWithRetry(tab.id, { action: 'getPageContent' });
          pageContent = response.content;
        } catch (messageError) {
          // Fallback to script injection for Firefox
          try {
            const results = await crossBrowser.scripting.executeScript({
              target: { tabId: tab.id },
              func: extractPageContent
            });
            pageContent = results[0].result;
          } catch (scriptError) {
            throw new Error('Could not extract content from page. Please refresh the page and try again.');
          }
        }
      } else {
        // Method 1 for Chrome: Use script injection (preferred)
        try {
          const results = await crossBrowser.scripting.executeScript({
            target: { tabId: tab.id },
            func: extractPageContent
          });
          pageContent = results[0].result;
        } catch (scriptError) {
          // Fallback to message passing for Chrome
          try {
            const response = await sendMessageWithRetry(tab.id, { action: 'getPageContent' });
            pageContent = response.content;
          } catch (messageError) {
            throw new Error('Could not extract content from page. Please refresh the page and try again.');
          }
        }
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
        await crossBrowser.storage.local.set({
          [summaryKey]: summaryData,
          'latest_summary': summaryKey // Keep track of the latest summary
        });
        
        // Open summary in a new tab with the key as a parameter
        const summaryUrl = crossBrowser.runtime.getURL(`summary.html?key=${summaryKey}`);
        await crossBrowser.tabs.create({ url: summaryUrl });
        
        // Close the popup
        window.close();
      } else {
        // Display summary in popup (for users who disabled auto-open)
        summaryDiv.innerHTML = formatSummary(summary);
        summaryDiv.style.display = 'block';
        showStatus('Summary generated successfully!', 'success');
      }

    } catch (error) {
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
    let systemPrompt = `You are an expert content analyst tasked with creating COMPREHENSIVE and COMPLETE summaries of web page content. Your goal is to ensure NO important information is missed or omitted.

CRITICAL REQUIREMENTS:
1. READ EVERY PARAGRAPH thoroughly - each paragraph likely contains unique valuable information
2. REPRESENT EVERY MAJOR SECTION of the content in your summary
3. DO NOT SKIP any important facts, examples, statistics, quotes, names, dates, or key details
4. PRESERVE the logical flow and structure of the original content
5. If the content has multiple topics/sections, ensure ALL are covered proportionally

SUMMARY APPROACH:
- Start with the main topic/purpose of the content
- Cover each major section or argument presented
- Include supporting evidence, examples, and data points
- Mention key people, organizations, dates, and numbers
- Capture conclusions, recommendations, or outcomes
- Maintain the author's intent and emphasis`;
    
    if (settings.includeFacts !== false) {
      systemPrompt += `

DETAIL LEVEL: MAXIMUM
- Include ALL specific facts, statistics, percentages, amounts, dates
- Preserve ALL examples, case studies, and illustrations
- Capture ALL quotes and attributions
- List ALL key people, organizations, products mentioned
- Include ALL actionable items, recommendations, or conclusions`;
    }
    
    if (settings.structuredFormat !== false) {
      systemPrompt += `

FORMATTING REQUIREMENTS:
- Use clear headers (##, ###) to organize different sections
- Use bullet points for lists of items or key points
- Use numbered lists for sequential steps or processes
- Use **bold** for emphasis on critical information
- Maintain logical hierarchy and flow`;
    }
    
    systemPrompt += `

QUALITY CHECK: Before finalizing, verify that:
✓ Every major paragraph/section from the original is represented
✓ No important facts or details were omitted
✓ The summary captures the full scope and depth of the content
✓ Someone reading only your summary would understand the complete picture

Remember: It's better to include too much information than to miss something important. Comprehensive coverage is more valuable than brevity.`;

    // Add translation instruction if a language is selected
    if (settings.translateTo) {
      const languageNames = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French', 
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'uk': 'Ukrainian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'nl': 'Dutch',
        'sv': 'Swedish',
        'da': 'Danish',
        'no': 'Norwegian',
        'fi': 'Finnish',
        'pl': 'Polish',
        'tr': 'Turkish',
        'th': 'Thai',
        'vi': 'Vietnamese'
      };
      
      const languageName = languageNames[settings.translateTo] || settings.translateTo;
      systemPrompt += ` IMPORTANT: Write the entire summary in ${languageName}. Translate all content to ${languageName} while maintaining the original meaning and structure.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: settings.openaiModel || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please create a COMPREHENSIVE summary of the following web page content. 

IMPORTANT: Ensure you cover EVERY major section and paragraph. Do not skip any important information, facts, examples, or details. Each significant part of the content should be represented in your summary.

Web page content to summarize:

${content}`
          }
        ],
        max_tokens: 1500, // Fixed optimal length: long enough for detailed summaries, short enough to control costs
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

// Helper function to retry message passing with delay
async function sendMessageWithRetry(tabId, message, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await crossBrowser.tabs.sendMessage(tabId, message);
      if (response && response.content) {
        return response;
      }
      throw new Error('No content in response');
    } catch (error) {
      if (i === retries - 1) throw error;
      // Wait before retrying (content script might still be loading)
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
