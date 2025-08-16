// Cross-browser compatibility utilities
// This file provides a unified API layer for Chrome and Firefox

(function() {
  'use strict';
  
  // Detect browser environment
  const isFirefox = typeof browser !== 'undefined';
  const isChrome = typeof chrome !== 'undefined' && typeof browser === 'undefined';
  
  // Create unified browser API
  window.crossBrowser = {
    // Runtime API
    runtime: {
      openOptionsPage: function() {
        return new Promise((resolve, reject) => {
          if (isFirefox) {
            if (browser.runtime.openOptionsPage) {
              browser.runtime.openOptionsPage().then(resolve).catch(reject);
            } else {
              // Fallback: open options page manually
              const optionsUrl = browser.runtime.getURL('options.html');
              browser.tabs.create({ url: optionsUrl }).then(resolve).catch(reject);
            }
          } else {
            if (chrome.runtime.openOptionsPage) {
              chrome.runtime.openOptionsPage(() => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve();
                }
              });
            } else {
              // Fallback: open options page manually
              const optionsUrl = chrome.runtime.getURL('options.html');
              chrome.tabs.create({ url: optionsUrl }, (tab) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve(tab);
                }
              });
            }
          }
        });
      },
      
      getURL: function(path) {
        if (isFirefox) {
          return browser.runtime.getURL(path);
        } else {
          return chrome.runtime.getURL(path);
        }
      }
    },
    
    // Storage API
    storage: {
      sync: {
        get: function(keys) {
          return new Promise((resolve, reject) => {
            if (isFirefox) {
              browser.storage.sync.get(keys).then(resolve).catch(reject);
            } else {
              chrome.storage.sync.get(keys, (result) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve(result);
                }
              });
            }
          });
        },
        
        set: function(items) {
          return new Promise((resolve, reject) => {
            if (isFirefox) {
              browser.storage.sync.set(items).then(resolve).catch(reject);
            } else {
              chrome.storage.sync.set(items, () => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve();
                }
              });
            }
          });
        }
      },
      
      local: {
        get: function(keys) {
          return new Promise((resolve, reject) => {
            if (isFirefox) {
              browser.storage.local.get(keys).then(resolve).catch(reject);
            } else {
              chrome.storage.local.get(keys, (result) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve(result);
                }
              });
            }
          });
        },
        
        set: function(items) {
          return new Promise((resolve, reject) => {
            if (isFirefox) {
              browser.storage.local.set(items).then(resolve).catch(reject);
            } else {
              chrome.storage.local.set(items, () => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve();
                }
              });
            }
          });
        },
        
        remove: function(keys) {
          return new Promise((resolve, reject) => {
            if (isFirefox) {
              browser.storage.local.remove(keys).then(resolve).catch(reject);
            } else {
              chrome.storage.local.remove(keys, () => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve();
                }
              });
            }
          });
        }
      }
    },
    
    // Tabs API
    tabs: {
      query: function(queryInfo) {
        return new Promise((resolve, reject) => {
          if (isFirefox) {
            browser.tabs.query(queryInfo).then(resolve).catch(reject);
          } else {
            chrome.tabs.query(queryInfo, (result) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(result);
              }
            });
          }
        });
      },
      
      create: function(createProperties) {
        return new Promise((resolve, reject) => {
          if (isFirefox) {
            browser.tabs.create(createProperties).then(resolve).catch(reject);
          } else {
            chrome.tabs.create(createProperties, (result) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(result);
              }
            });
          }
        });
      },
      
      update: function(tabId, updateProperties) {
        return new Promise((resolve, reject) => {
          if (isFirefox) {
            browser.tabs.update(tabId, updateProperties).then(resolve).catch(reject);
          } else {
            chrome.tabs.update(tabId, updateProperties, (result) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(result);
              }
            });
          }
        });
      },
      
      sendMessage: function(tabId, message) {
        return new Promise((resolve, reject) => {
          if (isFirefox) {
            browser.tabs.sendMessage(tabId, message).then(resolve).catch(reject);
          } else {
            chrome.tabs.sendMessage(tabId, message, (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response);
              }
            });
          }
        });
      }
    },
    
    // Scripting API (Chrome v3) compatibility - only for Chrome
    ...(isChrome ? {
      scripting: {
        executeScript: function(injection) {
          return new Promise((resolve, reject) => {
            if (chrome.scripting) {
              chrome.scripting.executeScript(injection).then(resolve).catch(reject);
            } else {
              // Chrome fallback for older versions
              const tabId = injection.target.tabId;
              const details = {
                code: injection.func ? `(${injection.func.toString()})()` : injection.code
              };
              chrome.tabs.executeScript(tabId, details, (result) => {
                if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
                } else {
                  resolve(result);
                }
              });
            }
          });
        }
      }
    } : {})
  };
  
  // Extension environment setup complete
  
})();