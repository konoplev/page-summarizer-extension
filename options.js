// options.js
document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKey');
    const openaiModelInput = document.getElementById('openaiModel');
    const validateModelBtn = document.getElementById('validateModel');
    const modelStatus = document.getElementById('modelStatus');
    const includeFactsCheckbox = document.getElementById('includeFacts');
    const structuredFormatCheckbox = document.getElementById('structuredFormat');
    const autoOpenCheckbox = document.getElementById('autoOpen');
    const translateToSelect = document.getElementById('translateTo');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    // Load saved settings
    crossBrowser.storage.sync.get([
        'openaiApiKey',
        'openaiModel',
        'includeFacts',
        'structuredFormat',
        'autoOpen',
        'translateTo'
    ]).then(function(result) {
        if (result.openaiApiKey) {
            apiKeyInput.value = result.openaiApiKey;
        }
        
        openaiModelInput.value = result.openaiModel || 'gpt-4o-mini';
        includeFactsCheckbox.checked = result.includeFacts !== false; // default true
        structuredFormatCheckbox.checked = result.structuredFormat !== false; // default true
        autoOpenCheckbox.checked = result.autoOpen !== false; // default true
        translateToSelect.value = result.translateTo || ''; // default none
    });

    // Save settings
    saveBtn.addEventListener('click', function() {
        const settings = {
            openaiApiKey: apiKeyInput.value.trim(),
            openaiModel: openaiModelInput.value.trim() || 'gpt-4o-mini',
            includeFacts: includeFactsCheckbox.checked,
            structuredFormat: structuredFormatCheckbox.checked,
            autoOpen: autoOpenCheckbox.checked,
            translateTo: translateToSelect.value
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

        // Save to storage
        crossBrowser.storage.sync.set(settings).then(function() {
            showStatus('Settings saved successfully! ✓', 'success');
        }).catch(function(error) {
            showStatus('Error saving settings: ' + error.message, 'error');
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

    // Model validation
    validateModelBtn.addEventListener('click', async function() {
        const apiKey = apiKeyInput.value.trim();
        const model = openaiModelInput.value.trim();
        
        if (!apiKey) {
            showModelStatus('Please enter your API key first', 'error');
            return;
        }
        
        if (!model) {
            showModelStatus('Please enter a model name', 'error');
            return;
        }
        
        showModelStatus('Validating model...', 'loading');
        validateModelBtn.disabled = true;
        
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const availableModels = data.data.map(m => m.id);
            
            if (availableModels.includes(model)) {
                showModelStatus(`✓ Model "${model}" is available and ready to use`, 'success');
            } else {
                showModelStatus(`✗ Model "${model}" not found. Available models: ${availableModels.slice(0, 5).join(', ')}...`, 'error');
            }
        } catch (error) {
            showModelStatus(`✗ Validation failed: ${error.message}`, 'error');
        } finally {
            validateModelBtn.disabled = false;
        }
    });
    
    function showModelStatus(message, type) {
        modelStatus.textContent = message;
        modelStatus.className = `model-status ${type}`;
        modelStatus.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                modelStatus.style.display = 'none';
            }, 5000);
        }
    }

    // Auto-save on input change (except API key for security)
    [openaiModelInput, includeFactsCheckbox, structuredFormatCheckbox, autoOpenCheckbox, translateToSelect].forEach(input => {
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
