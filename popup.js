document.addEventListener('DOMContentLoaded', () => {
  const keywordInput = document.getElementById('keyword');
  const clearButton = document.getElementById('clear');
  const status = document.getElementById('status');
  const saveButton = document.getElementById('save');
  const keywordsArea = document.getElementById('keywords');
  const intervalInput = document.getElementById('intervalSeconds');
  const saveStatus = document.getElementById('saveStatus');

  chrome.storage.local.get(['keywords', 'intervalSec'], (data) => {
    if (data.keywords) keywordsArea.value = data.keywords.join('\n');
    if (data.intervalSec) intervalInput.value = data.intervalSec;
  });

  clearButton.addEventListener('click', () => {
    const keyword = keywordInput.value.trim();
    if (!keyword) {
      status.style.setProperty("display", "block");
      return;
    }

    chrome.runtime.sendMessage({ action: 'clearByKeyword', keyword }, (response) => {
      status.textContent = response.message;
      status.style.setProperty("display", "block");
    });
  });

  saveButton.addEventListener('click', () => {
    const keywords = keywordsArea.value.split('\n').map(k => k.trim()).filter(k => k);
    const intervalSec = parseInt(intervalInput.value);
    chrome.storage.local.set({ keywords, intervalSec }, () => {
      chrome.runtime.sendMessage({ action: 'updateAlarm', intervalSec });
      saveStatus.style.setProperty("display", "block");
    });
  });
});
