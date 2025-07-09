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
        crossBrowser.storage.local.get([summaryKey]).then(function(result) {
            if (result[summaryKey]) {
                const summaryData = result[summaryKey];
                displaySummary(summaryData);
                
                // Clean up storage
                crossBrowser.storage.local.remove([summaryKey]);
            } else {
                showError('Summary data not found. It may have expired.');
            }
        });
    } else {
        // Fallback: try to get the latest summary
        crossBrowser.storage.local.get(['latest_summary']).then(function(result) {
            if (result.latest_summary) {
                crossBrowser.storage.local.get([result.latest_summary]).then(function(summaryResult) {
                    if (summaryResult[result.latest_summary]) {
                        const summaryData = summaryResult[result.latest_summary];
                        displaySummary(summaryData);
                        
                        // Clean up storage
                        crossBrowser.storage.local.remove([result.latest_summary, 'latest_summary']);
                    } else {
                        showError('No summary data found. Please try generating the summary again.');
                    }
                });
            } else {
                showError('No summary data found. Please try generating the summary again.');
            }
        });
    }

    let originalSummaryText = ''; // Store the original markdown text

    function displaySummary(summaryData) {
        // Update header information
        originalTitle.textContent = summaryData.title || 'Unknown Page';
        originalUrl.textContent = summaryData.url || '';
        
        const date = new Date(summaryData.timestamp);
        timestamp.textContent = `Generated on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;

        // Store the original markdown text for copying
        originalSummaryText = summaryData.summary;

        // Format and display summary
        const formattedSummary = formatSummary(summaryData.summary);
        summaryText.innerHTML = formattedSummary;

        // Set up back button
        if (summaryData.url) {
            backBtn.href = summaryData.url;
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                crossBrowser.tabs.query({ active: true, currentWindow: true }).then(function(tabs) {
                    crossBrowser.tabs.update(tabs[0].id, { url: summaryData.url });
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
            // Escape HTML characters first (but preserve intentional HTML)
            .replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            
            // Headers (must be at start of line with optional whitespace) - handle all levels
            // Process from most specific (6 #) to least specific (1 #) to avoid conflicts
            .replace(/^\s*#{6}\s+(.+)$/gm, '<h6>$1</h6>')
            .replace(/^\s*#{5}\s+(.+)$/gm, '<h5>$1</h5>')
            .replace(/^\s*#{4}\s+(.+)$/gm, '<h4>$1</h4>')
            .replace(/^\s*#{3}\s+(.+)$/gm, '<h3>$1</h3>')
            .replace(/^\s*#{2}\s+(.+)$/gm, '<h2>$1</h2>')
            .replace(/^\s*#{1}\s+(.+)$/gm, '<h1>$1</h1>')
            
            // Code blocks (before other formatting)
            .replace(/```([\s\S]*?)```/g, function(match, code) {
                return `<pre><code>${code.trim()}</code></pre>`;
            })
            
            // Inline code (before bold/italic to avoid conflicts)
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            
            // Bold text - handle both ** and __ (non-greedy)
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/__([^_]+)__/g, '<strong>$1</strong>')
            
            // Italic text - handle both * and _ (non-greedy, avoid conflicts with bold)
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/_([^_]+)_/g, '<em>$1</em>')
            
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            
            // Blockquotes
            .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
            
            // Lists - handle both bullet and numbered
            .replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>')
            .replace(/^\s*\d+\. (.+)$/gm, '<li class="numbered">$1</li>');

        // Group consecutive list items
        formatted = formatted.replace(/(<li class="numbered">.*?<\/li>)(\s*<li class="numbered">.*?<\/li>)*/g, function(match) {
            return '<ol>' + match.replace(/ class="numbered"/g, '') + '</ol>';
        });
        
        formatted = formatted.replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/g, function(match) {
            // Only convert to ul if it's not already in ol
            if (!match.includes('<ol>')) {
                return '<ul>' + match + '</ul>';
            }
            return match;
        });

        // Handle paragraphs and line breaks
        formatted = formatted
            .replace(/\r\n/g, '\n')
            .replace(/\n\s*\n/g, '\n\n') // Normalize multiple newlines
            .split('\n\n')
            .map(paragraph => {
                paragraph = paragraph.trim();
                if (!paragraph) return '';
                
                // Don't wrap if it's already a block element
                if (paragraph.match(/^<(h[1-6]|ul|ol|pre|blockquote)/)) {
                    return paragraph;
                }
                
                // Convert single newlines to <br> within paragraphs
                paragraph = paragraph.replace(/\n/g, '<br>');
                
                return `<p>${paragraph}</p>`;
            })
            .filter(p => p)
            .join('\n');

        // Clean up: remove empty paragraphs and fix spacing
        formatted = formatted
            .replace(/<p>\s*<\/p>/g, '')
            .replace(/<p>(<h[1-6]>)/g, '$1')
            .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
            .replace(/<p>(<ul>|<ol>|<pre>|<blockquote>)/g, '$1')
            .replace(/(<\/ul>|<\/ol>|<\/pre>|<\/blockquote>)<\/p>/g, '$1')
            .replace(/(<\/blockquote>)\s*(<blockquote>)/g, '$1$2'); // Merge consecutive blockquotes

        return formatted;
    }

    function showError(message) {
        loading.style.display = 'none';
        error.style.display = 'block';
        errorMessage.textContent = message;
    }

    // Copy functionality
    copyBtn.addEventListener('click', function() {
        // Use the original markdown text instead of the rendered HTML
        const textToCopy = originalSummaryText || summaryText.innerText;
        
        navigator.clipboard.writeText(textToCopy).then(function() {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copied with Formatting!';
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
            copyBtn.textContent = '✓ Copied with Formatting!';
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
