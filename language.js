const LANGUAGES = {
  "en": {
    "ext_name": "Hide Chrome History",
    "manual_clear_title": "Manual History Cleaner",
    "keyword_label": "Keyword list (one per line)",
    "interval_label": "Cleanup interval (in seconds)",
    "save_button": "Save Settings",
    "clear_button": "Clear Now",
    "status_saved": "Settings saved.",
    "status_placeholder": "Enter keyword or regex",
    "keyword_placeholder": "/google.com/search?.*q=.*/",
    "interval_placeholder": "e.g. 60"
  },
  "zh": {
    "ext_name": "Hide Chrome History",
    "manual_clear_title": "\u624b\u52a8\u6e05\u9664\u5386\u53f2\u8bb0\u5f55",
    "keyword_label": "\u5173\u952e\u8bcd\u5217\u8868\uff08\u6bcf\u884c\u4e00\u4e2a\uff09",
    "interval_label": "\u6e05\u7406\u5468\u671f\uff08\u5355\u4f4d\uff1a\u79d2\uff09",
    "save_button": "\u4fdd\u5b58\u8bbe\u7f6e",
    "clear_button": "\u7acb\u5373\u6e05\u9664",
    "status_saved": "\u8bbe\u7f6e\u5df2\u4fdd\u5b58\u3002",
    "status_placeholder": "\u8bf7\u8f93\u5165\u5173\u952e\u8bcd\u6216\u6b63\u5219\u8868\u8fbe\u5f0f",
    "keyword_placeholder": "/google.com/search?.*q=.*/",
    "interval_placeholder": "\u4f8b\u5982\uff1a60"
  }
};

function applyLanguage(lang) {
  const dict = LANGUAGES[lang] || LANGUAGES["en"];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["lang"], (data) => {
    const lang = data.lang || "zh";
    applyLanguage(lang);
    const selector = document.getElementById("langSelector");
    if (selector) selector.value = lang;
  });

  const selector = document.getElementById("langSelector");
  if (selector) {
    selector.addEventListener("change", function () {
      const lang = this.value;
      chrome.storage.local.set({ lang }, () => {
        applyLanguage(lang);
      });
    });
  }
});
