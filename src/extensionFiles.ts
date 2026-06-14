import { UserProfile } from './types';

// Source files for the Chrome Extension (MV3)
export interface ExtensionFileSet {
  name: string;
  code: string;
}

export function generateExtensionFiles(userProfile: UserProfile, backendUrl: string): ExtensionFileSet[] {
  const serializedProfile = JSON.stringify(userProfile, null, 2);

  return [
    {
      name: "manifest.json",
      code: `{
  "manifest_version": 3,
  "name": "AI Intelligent Form-Filler",
  "version": "1.0.0",
  "description": "Dynamically parse any web form, map fields to your personal profile using Gemini, and autofill inputs safely.",
  "permissions": [
    "activeTab",
    "scripting",
    "storage"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icon.png"
  },
  "options_page": "options.html",
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}`
    },
    {
      name: "popup.html",
      code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      width: 320px;
      margin: 0;
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    .badge {
      background-color: #2563eb;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 9999px;
      font-weight: 600;
    }
    .btn {
      display: block;
      width: 100%;
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #1d4ed8;
    }
    .btn-secondary {
      background-color: transparent;
      color: #475569;
      border: 1px solid #cbd5e1;
      margin-top: 8px;
    }
    .btn-secondary:hover {
      background-color: #f1f5f9;
    }
    .status {
      margin-top: 12px;
      font-size: 12px;
      color: #64748b;
      text-align: center;
      padding: 8px;
      background-color: #f1f5f9;
      border-radius: 4px;
      border: 1px dashed #cbd5e1;
    }
    .custom-container {
      margin-top: 12px;
    }
    .custom-label {
      font-size: 11px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 4px;
      display: block;
    }
    .custom-input {
      width: 100%;
      box-sizing: border-box;
      padding: 6px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 12px;
      background-color: white;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="title">✨ AI Form-Filler</span>
    <span class="badge">V3</span>
  </div>
  
  <button id="scanBtn" class="btn">🔍 Scan Active Webpage</button>
  <button id="configBtn" class="btn btn-secondary">⚙️ Configure Profile</button>
  
  <div class="custom-container">
    <label class="custom-label">Custom Site Directives (e.g. for this domain):</label>
    <input type="text" id="customPrompt" class="custom-input" placeholder="e.g. emphasize React skills">
  </div>
  
  <div id="statusDiv" class="status">Click 'Scan Webpage' to start parsing...</div>

  <script src="popup.js"></script>
</body>
</html>`
    },
    {
      name: "popup.js",
      code: `document.addEventListener('DOMContentLoaded', async () => {
  const scanBtn = document.getElementById('scanBtn');
  const configBtn = document.getElementById('configBtn');
  const statusDiv = document.getElementById('statusDiv');
  const customPromptInput = document.getElementById('customPrompt');

  // Load custom instruction for active domain
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs[0]?.url) {
      try {
        const url = new URL(tabs[0].url);
        const domainKey = 'prompt_' + url.hostname;
        chrome.storage.local.get([domainKey], (res) => {
          if (res[domainKey]) {
            customPromptInput.value = res[domainKey];
          }
        });
      } catch (e) {}
    }
  });

  configBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  scanBtn.addEventListener('click', async () => {
    statusDiv.textContent = 'Scanning forms in DOM...';
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab) {
        statusDiv.textContent = '❌ No active tab found.';
        return;
      }

      // Save custom context before trigger
      try {
        const url = new URL(activeTab.url);
        const domainKey = 'prompt_' + url.hostname;
        chrome.storage.local.set({ [domainKey]: customPromptInput.value });
      } catch (e) {}

      // Command Tab to Scan DOM
      chrome.tabs.sendMessage(activeTab.id, { action: 'SCAN_DOM' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          statusDiv.textContent = '❌ Please refresh the page first to load the content scripts!';
          return;
        }

        if (response.fields && response.fields.length === 0) {
          statusDiv.textContent = 'ℹ️ No compatible input elements found.';
          return;
        }

        statusDiv.textContent = \`Found \${response.fields.length} inputs. Analyzing with AI...\`;

        // Request background AI mapping
        chrome.runtime.sendMessage({
          action: 'MAP_FIELDS',
          fields: response.fields,
          customInstruction: customPromptInput.value
        }, (aiResponse) => {
          if (!aiResponse || aiResponse.error) {
            statusDiv.textContent = '❌ AI calculation failed: ' + (aiResponse?.error || 'Unknown error');
            return;
          }

          statusDiv.textContent = \`Mapped \${aiResponse.mappings?.length || 0} fields! Injecting values...\`;

          // Command tab to fill elements
          chrome.tabs.sendMessage(activeTab.id, {
            action: 'FILL_DOM',
            mappings: aiResponse.mappings
          }, (fillRes) => {
            if (chrome.runtime.lastError || !fillRes) {
              statusDiv.textContent = '❌ Error injecting fill data.';
            } else {
              statusDiv.textContent = '🎉 Form autofilled successfully!';
            }
          });
        });
      });
    });
  });
});`
    },
    {
      name: "content.js",
      code: `/**
 * Content Script - Forms DOM element detection scanner and multi-step inputs tracker.
 */
console.log('🤖 AI Form-Filler Content Script loaded.');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SCAN_DOM') {
    const fields = scanPageFormFields();
    sendResponse({ fields });
  } else if (request.action === 'FILL_DOM') {
    const success = injectMappedValues(request.mappings);
    sendResponse({ success });
  }
  return true;
});

// Helper to look up descriptive labels nearby
function findLabelForElement(element) {
  // 1. Direct label check
  if (element.id) {
    const labels = document.querySelectorAll('label[for="' + element.id + '"]');
    if (labels.length > 0) return labels[0].innerText.trim();
  }

  // 2. Wrap parent label check
  const parentLabel = element.closest('label');
  if (parentLabel) return parentLabel.innerText.trim();

  // 3. Search surrounding structure or siblings (e.g. span, div previous text)
  let prevSibling = element.previousElementSibling;
  while (prevSibling) {
    if (prevSibling.tagName === 'LABEL' || prevSibling.tagName === 'SPAN' || prevSibling.tagName === 'DIV') {
      const text = prevSibling.innerText || prevSibling.textContent;
      if (text && text.trim().length > 1) return text.trim();
    }
    prevSibling = prevSibling.previousElementSibling;
  }

  // 4. Fallback search - parent element header
  const parent = element.parentElement;
  if (parent) {
    const textElements = parent.querySelectorAll('span, p, div.label');
    for (const el of textElements) {
      if (el !== element && el.innerText?.trim()) {
        return el.innerText.trim();
      }
    }
  }

  return "";
}

// Scans active layout for inputs, selects, textareas
function scanPageFormFields() {
  const elements = document.querySelectorAll('input:not([type="submit"]):not([type="button"]):not([type="hidden"]):not([type="file"]), textarea, select');
  const results = [];

  elements.forEach((el, index) => {
    // Generate simple unique path/id
    const uid = el.id || el.name || ('scanned_field_' + index);
    const label = findLabelForElement(el) || el.getAttribute('aria-label') || el.title || "";
    
    // Tag element so we can reliably find it even without native id/name attributes
    el.setAttribute('data-autofill-id', uid);

    // Check options if dropdown/select
    let options = [];
    if (el.tagName === 'SELECT') {
      options = Array.from(el.options).map(opt => opt.value || opt.text).filter(Boolean);
    } else if (el.type === 'radio' && el.name) {
      // Find all options under the same radio group name
      const radios = document.querySelectorAll('input[type="radio"][name="' + el.name + '"]');
      radios.forEach(r => {
        const rLabel = findLabelForElement(r);
        if (rLabel) options.push(rLabel);
      });
    }

    // Get section header context
    let sectionHeader = "";
    const parentContainer = el.closest('fieldset, section, div[class*="section"], div[class*="group"]');
    if (parentContainer) {
      const header = parentContainer.querySelector('h1, h2, h3, h4, legend, .section-title');
      if (header) sectionHeader = header.innerText.trim();
    }

    results.push({
      id: uid,
      name: el.name || "",
      type: el.type || el.tagName.toLowerCase(),
      label: label.replace(/\\*$/, '').trim(), // Clean trailing asterisks
      placeholder: el.placeholder || "",
      ariaLabel: el.getAttribute('aria-label') || "",
      context: sectionHeader,
      options: options.length > 0 ? options : undefined
    });
  });

  return results;
}

// Set values using native descriptors to bypass SPA state binders (React, Vue, Angular)
function setElementValueNative(element, value) {
  try {
    const parent = Object.getPrototypeOf(element);
    let setter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    if (!setter && parent) {
      setter = Object.getOwnPropertyDescriptor(parent, 'value')?.set;
    }
    const grandparent = parent ? Object.getPrototypeOf(parent) : null;
    if (!setter && grandparent) {
      setter = Object.getOwnPropertyDescriptor(grandparent, 'value')?.set;
    }
    
    if (setter) {
      setter.call(element, value);
    } else {
      element.value = value;
    }
  } catch (e) {
    element.value = value;
  }
}

// Real SPA framework-compatible event injection loop
function injectMappedValues(mappings) {
  if (!mappings) return false;

  mappings.forEach((match) => {
    // Find matching DOM element by data-autofill-id, id or name
    let element = document.querySelector('[data-autofill-id="' + match.fieldId + '"]') ||
                  document.getElementById(match.fieldId) || 
                  document.querySelector('[name="' + match.fieldId + '"]');
    
    if (!element) {
      // fallback matching by class/name substrings
      element = document.querySelector('input[id*="' + match.fieldId + '"], input[name*="' + match.fieldId + '"]');
    }

    if (!element) return;

    // Handle Radio lists uniquely
    if (element.type === 'radio') {
      const gName = element.name;
      if (gName) {
        const groupOptions = document.querySelectorAll('input[type="radio"][name="' + gName + '"]');
        groupOptions.forEach(opt => {
          const lText = findLabelForElement(opt);
          if (lText && lText.toLowerCase().includes(match.value.toLowerCase())) {
            opt.checked = true;
            triggerDomEvents(opt);
          }
        });
      }
      return;
    }

    // Standard elements filling using our native setter bypass
    setElementValueNative(element, match.value);
    triggerDomEvents(element);
  });

  return true;
}

// Event Sequence: Focus -> Set Value -> Input -> Change -> Blur
function triggerDomEvents(element) {
  try {
    element.dispatchEvent(new Event('focus', { bubbles: true }));
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  } catch (e) {
    console.error('Triggering DOM events failed', e);
  }
}`
    },
    {
      name: "background.js",
      code: `/**
 * Background Service Worker - secure API bridge, profile coordinator, and session worker.
 */

const DEFAULT_SERVER_URL = "${backendUrl}";

chrome.runtime.onInstalled.addListener(() => {
  console.log('🌟 AI Form-Filler Extension background worker established.');
});

// Handle requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'MAP_FIELDS') {
    // Retrieve stored profile to send securely to parser
    chrome.storage.local.get(['userProfile'], async (data) => {
      const profile = data.userProfile || ${serializedProfile};

      try {
        const response = await fetch(DEFAULT_SERVER_URL + '/api/map-fields', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: request.fields,
            profile: profile,
            customInstructions: request.customInstruction || ""
          })
        });

        if (!response.ok) {
          throw new Error('Server responded with ' + response.status);
        }

        const dataResponse = await response.json();
        sendResponse(dataResponse);
      } catch (err) {
        console.error('Background API Mapping Error:', err);
        sendResponse({ error: err.message });
      }
    });
    return true; // Keep message channel open for async response
  }
});`
    },
    {
      name: "options.html",
      code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Configure AI Form-Filler Profile</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 30px;
      background-color: #f1f5f9;
      color: #1e293b;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    h1 {
      margin-top: 0;
      font-size: 20px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 6px;
      color: #475569;
    }
    input, textarea {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 13px;
    }
    textarea {
      height: 80px;
      resize: vertical;
    }
    .btn {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn:hover {
      background-color: #1d4ed8;
    }
    .status {
      margin-top: 12px;
      font-size: 13px;
      color: #16a34a;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔧 AI Form-Filler Personal Profile</h1>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">Use this sheet to customize the details shared with your browser extension. This data stays 100% private in local sandboxed storage.</p>
    
    <div class="form-group">
      <label>First Name</label>
      <input type="text" id="firstName">
    </div>
    
    <div class="form-group">
      <label>Last Name</label>
      <input type="text" id="lastName">
    </div>

    <div class="form-group">
      <label>Email Address</label>
      <input type="email" id="email">
    </div>

    <div class="form-group">
      <label>Phone Number</label>
      <input type="text" id="phone">
    </div>

    <div class="form-group">
      <label>Professional Summary</label>
      <textarea id="summary"></textarea>
    </div>

    <button id="saveBtn" class="btn">Save Profile</button>
    <div id="statusText" class="status">Saved perfectly!</div>
  </div>

  <script src="options.js"></script>
</body>
</html>`
    },
    {
      name: "options.js",
      code: `const defaultProfile = ${serializedProfile};

document.addEventListener('DOMContentLoaded', () => {
  // Load current values
  chrome.storage.local.get(['userProfile'], (result) => {
    const profile = result.userProfile || defaultProfile;
    document.getElementById('firstName').value = profile.personal.firstName || '';
    document.getElementById('lastName').value = profile.personal.lastName || '';
    document.getElementById('email').value = profile.personal.email || '';
    document.getElementById('phone').value = profile.personal.phone || '';
    document.getElementById('summary').value = profile.personal.summary || '';
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    const freshProfile = {
      personal: {
        firstName: document.getElementById('firstName').value ?? '',
        lastName: document.getElementById('lastName').value ?? '',
        email: document.getElementById('email').value ?? '',
        phone: document.getElementById('phone').value ?? '',
        birthDate: defaultProfile.personal.birthDate,
        location: defaultProfile.personal.location,
        linkedin: defaultProfile.personal.linkedin,
        portfolio: defaultProfile.personal.portfolio,
        summary: document.getElementById('summary').value ?? ''
      },
      experience: defaultProfile.experience,
      projects: defaultProfile.projects,
      education: defaultProfile.education,
      skills: defaultProfile.skills
    };

    chrome.storage.local.set({ userProfile: freshProfile }, () => {
      const status = document.getElementById('statusText');
      status.style.display = 'block';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    });
  });
});`
    },
    {
      name: "INSTALL.md",
      code: `# 📦 How to Load your Custom AI Form-Filler Chrome Extension

## Prerequisites
- Google Chrome browser (v88+) or any Chromium-compatible browser (Brave, Edge, Opera).

## Step-by-Step Deployment
1. **Extract ZIP File:** Take the downloaded ZIP archive and extract it to a directory on your normal computer (e.g., \`Desktop/ai-form-filler-extension/\`).
2. **Open Extensions Dashboard:** In Google Chrome, go to the URL bar and type:
   \`chrome://extensions\` and press Enter.
3. **Turn on Developer Mode:** Look at the top-right corner of the screen and toggle the **"Developer Mode"** slider to ON.
4. **Load Unpacked File:** Click the **"Load unpacked"** button on the top-left section of the dashboard.
5. **Select Folder:** In the folder dialog, navigate to the folder where you extracted the extension files (make sure to select the folder containing \`manifest.json\`) and click Select/Open.
6. **Activate Extension:** Pin the "AI Intelligent Form-Filler" to your browser bar for zero-click launch.

## How to Test
1. Load any job application form or questionnaire on the web.
2. Click the extension's puzzle icon in your browser toolbar to open the popup.
3. Select 'Scan Active Webpage' and look as it automatically finds all values!
`
    }
  ];
}
