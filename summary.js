// summary.js
document.addEventListener('DOMContentLoaded', function() {
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');
    const actions = document.getElementById('actions');
    const error = document.getElementById('error');
    const originalTitle = document.getElementById('originalTitle');
    const originalUrl = document.getElementById('originalUrl');
    const timestamp = document.getElementById('timestamp');
    const summaryText = document.getElementById('summaryText');
    const copyBtn = document.getElementById('copyBtn');
    const printBtn = document.getElementById('printBtn');
    const backBtn = document.getElementById('backBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Get summary key from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const summaryKey = urlParams.get('key');
    
    if (summaryKey) {
        // Load summary data using the key
        chrome.storage.local.get([summaryKey], function(result) {
            if (result[summaryKey]) {
                const summaryData = result[summaryKey];
                displaySummary(summaryData);
                
                // Clean up storage
                chrome.storage.local.remove([summaryKey]);
            } else {
                showError('Summary data not found. It may have expired.');
            }
        });
    } else {
        // Fallback: try to get the latest summary
        chrome.storage.local.get(['latest_summary'], function(result) {
            if (result.latest_summary) {
                chrome.storage.local.get([result.latest_summary], function(summaryResult) {
                    if (summaryResult[result.latest_summary]) {
                        const summaryData = summaryResult[result.latest_summary];
                        displaySummary(summaryData);
                        
                        // Clean up storage
                        chrome.storage.local.remove([result.latest_summary, 'latest_summary']);
                    } else {
                        showError('No summary data found. Please try generating the summary again.');
                    }
                });
            } else {
                showError('No summary data found. Please try generating the summary again.');
            }
        });
    }

    function displaySummary(summaryData) {
        // Update header information
        originalTitle.textContent = summaryData.title || 'Unknown Page';
        originalUrl.textContent = summaryData.url || '';
        
        const date = new Date(summaryData.timestamp);
        timestamp.textContent = `Generated on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;

        // Format and display summary
        const formattedSummary = formatSummary(summaryData.summary);
        summaryText.innerHTML = formattedSummary;

        // Set up back button
        if (summaryData.url) {
            backBtn.href = summaryData.url;
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    chrome.tabs.update(tabs[0].id, { url: summaryData.url });
                });
            });
        }

        // Show content and actions
        loading.style.display = 'none';
        content.style.display = 'block';
        actions.style.display = 'flex';
    }

    function formatSummary(summary) {
        // Convert markdown-like formatting to HTML
        let formatted = summary
            // Headers
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            
            // Bold text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            
            // Italic text
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            
            // Lists
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/^\* (.*$)/gm, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

        // Wrap in paragraphs
        if (!formatted.includes('<p>') && !formatted.includes('<h1>') && !formatted.includes('<h2>') && !formatted.includes('<h3>')) {
            formatted = '<p>' + formatted + '</p>';
        }

        // Wrap consecutive list items in ul tags
        formatted = formatted.replace(/(<li>.*<\/li>)(?:\s*<li>.*<\/li>)*/g, function(match) {
            return '<ul>' + match + '</ul>';
        });

        return formatted;
    }

    function showError(message) {
        loading.style.display = 'none';
        error.style.display = 'block';
        errorMessage.textContent = message;
    }

    // Copy functionality
    copyBtn.addEventListener('click', function() {
        const textToCopy = summaryText.innerText;
        navigator.clipboard.writeText(textToCopy).then(function() {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copied!';
            copyBtn.style.background = '#4caf50';
            
            setTimeout(function() {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '#667eea';
            }, 2000);
        }).catch(function() {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copied!';
            copyBtn.style.background = '#4caf50';
            
            setTimeout(function() {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '#667eea';
            }, 2000);
        });
    });

    // Print functionality
    printBtn.addEventListener('click', function() {
        window.print();
    });
});
