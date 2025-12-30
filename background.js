// 缓存正则表达式列表，提高拦截速度
let cachedRegexes = [];

// 从存储中加载正则
// background.js

function updateCache() {
  chrome.storage.local.get(['regexList'], (result) => {
    // 如果存储中没有（第一次运行），则使用默认正则
    const defaultRegex = [".*google.com/search?.*q=.*"];
    const list = result.regexList || defaultRegex;
    
    cachedRegexes = list.map(pattern => {
      try {
        return new RegExp(pattern, 'i');
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  });
}

// 初始化加载
updateCache();

// 监听存储变化（当用户在 popup 修改正则时，立即更新后台缓存）
chrome.storage.onChanged.addListener((changes) => {
  if (changes.regexList) {
    updateCache();
  }
});

// 核心：实时拦截监听器
chrome.history.onVisited.addListener((historyItem) => {
  const { url, title } = historyItem;

  // 检查是否匹配任何一个正则
  const isMatch = cachedRegexes.some(re => re.test(url) || re.test(title));

  if (isMatch) {
    chrome.history.deleteUrl({ url: url }, () => {
      console.log(`[已拦截] 已删除匹配的历史记录: ${url}`);
    });
  }
});