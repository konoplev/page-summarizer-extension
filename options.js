// options.js
document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const maxTokensInput = document.getElementById('maxTokens');
    const includeFactsCheckbox = document.getElementById('includeFacts');
    const structuredFormatCheckbox = document.getElementById('structuredFormat');
    const autoOpenCheckbox = document.getElementById('autoOpen');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    // Load saved settings
    chrome.storage.sync.get([
        'openaiApiKey',
        'maxTokens',
        'includeFacts',
        'structuredFormat',
        'autoOpen'
    ], function(result) {
        if (result.openaiApiKey) {
            apiKeyInput.value = result.openaiApiKey;
        }
        
        maxTokensInput.value = result.maxTokens || 2000;
        includeFactsCheckbox.checked = result.includeFacts !== false; // default true
        structuredFormatCheckbox.checked = result.structuredFormat !== false; // default true
        autoOpenCheckbox.checked = result.autoOpen !== false; // default true
    });

    // Save settings
    saveBtn.addEventListener('click', function() {
        const settings = {
            openaiApiKey: apiKeyInput.value.trim(),
            maxTokens: parseInt(maxTokensInput.value),
            includeFacts: includeFactsCheckbox.checked,
            structuredFormat: structuredFormatCheckbox.checked,
            autoOpen: autoOpenCheckbox.checked
        };

        // Validate API key
        if (!settings.openaiApiKey) {
            showStatus('Please enter your OpenAI API key', 'error');
            return;
        }

        if (!settings.openaiApiKey.startsWith('sk-')) {
            showStatus('API key should start with "sk-"', 'error');
            return;
        }

        // Validate max tokens
        if (settings.maxTokens < 500 || settings.maxTokens > 4000) {
            showStatus('Maximum tokens must be between 500 and 4000', 'error');
            return;
        }

        // Save to storage
        chrome.storage.sync.set(settings, function() {
            if (chrome.runtime.lastError) {
                showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
            } else {
                showStatus('Settings saved successfully! ✓', 'success');
            }
        });
    });

    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');

        if (type === 'success') {
            setTimeout(() => {
                status.classList.add('hidden');
            }, 3000);
        }
    }

    // Auto-save on input change (except API key for security)
    [maxTokensInput, includeFactsCheckbox, structuredFormatCheckbox, autoOpenCheckbox].forEach(input => {
        input.addEventListener('change', function() {
            // Show unsaved changes indicator
            if (!saveBtn.textContent.includes('*')) {
                saveBtn.textContent = '💾 Save Settings *';
                saveBtn.style.background = '#ff9800';
            }
        });
    });

    // Reset save button when API key changes
    apiKeyInput.addEventListener('input', function() {
        if (!saveBtn.textContent.includes('*')) {
            saveBtn.textContent = '💾 Save Settings *';
            saveBtn.style.background = '#ff9800';
        }
    });

    // Reset button style after save
    const originalSaveSettings = () => {
        saveBtn.textContent = '💾 Save Settings';
        saveBtn.style.background = '#667eea';
    };

    // Override the save function to reset button
    const originalSave = saveBtn.addEventListener;
    saveBtn.addEventListener('click', function() {
        setTimeout(originalSaveSettings, 1000);
    });
});
