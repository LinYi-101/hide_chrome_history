function clearHistoryByRules(rules) {
  const regexRules = [], keywordRules = [];

  for (const rule of rules) {
    if (rule.startsWith('/') && rule.endsWith('/')) {
      try { regexRules.push(new RegExp(rule.slice(1, -1))); }
      catch (e) { console.warn("Invalid regex:", rule); }
    } else {
      keywordRules.push(rule.toLowerCase());
    }
  }

  chrome.history.search({ text: '', maxResults: 10000, startTime: 0 }, results => {
    let deleted = 0;
    results.forEach(item => {
      const url = item.url.toLowerCase();
      const match = keywordRules.some(k => url.includes(k)) ||
                    regexRules.some(r => r.test(item.url));
      if (match) {
        chrome.history.deleteUrl({ url: item.url });
        deleted++;
      }
    });
    console.log(`[cleaner] Removed ${deleted} matching items.`);
  });
}

let currentTimer = null;
function schedule(intervalSec) {
  if (currentTimer) clearTimeout(currentTimer);
  currentTimer = setTimeout(runCleanup, intervalSec * 1000);
}

function runCleanup() {
  chrome.storage.local.get(['keywords', 'intervalSec'], data => {
    const rules = data.keywords || [];
    const interval = data.intervalSec || 3600;
    clearHistoryByRules(rules);
    schedule(interval);
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['keywords', 'intervalSec'], data => {
    const rules = data.keywords || ['/google.com/search?.*q=.*/'];
    const interval = data.intervalSec || 1;
    clearHistoryByRules(rules);
    schedule(interval);
  });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['intervalSec'], data => {
    schedule(data.intervalSec || 3600);
  });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'clearByKeyword') {
    const rule = msg.keyword.trim();
    chrome.history.search({ text: '', maxResults: 10000, startTime: 0 }, results => {
      let match = [];
      if (rule.startsWith('/') && rule.endsWith('/')) {
        try {
          const regex = new RegExp(rule.slice(1, -1));
          match = results.filter(i => regex.test(i.url));
        } catch {
          sendResponse({ message: 'Invalid regex' });
          return;
        }
      } else {
        match = results.filter(i => i.url.toLowerCase().includes(rule.toLowerCase()));
      }
      match.forEach(i => chrome.history.deleteUrl({ url: i.url }));
      sendResponse({ message: `Deleted ${match.length} items.` });
    });
    return true;
  }
  if (msg.action === 'updateAlarm') {
    schedule(msg.intervalSec || 3600);
  }
});
