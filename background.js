// 缓存正则表达式列表，提高拦截速度
let cachedRegexes = [];
console.log("Service Worker 已启动！");
// 从存储中加载正则
// background.js

function updateCache() {
  chrome.storage.local.get(["regexList"], (result) => {
    // 如果存储中没有（第一次运行），则使用默认正则
    const defaultRegex = [".*google.com/search?.*q=.*"];
    const list = result.regexList || defaultRegex;

    cachedRegexes = list
      .map((pattern) => {
        try {
          return new RegExp(pattern, "i");
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
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
  console.log("检测到访问：", historyItem.url);
  const { url, title } = historyItem;

  // 检查是否匹配任何一个正则
  const isMatch = cachedRegexes.some((re) => re.test(url) || re.test(title));

  if (isMatch) {
    chrome.history.deleteUrl({ url: url }, () => {
      console.log(`[已拦截] 已删除匹配的历史记录: ${url}`);
    });
  }
});

// --- 核心清理逻辑封装 ---
async function performCleanup() {
  console.log("正在执行清理任务...");

  // 1. 从 storage 中获取用户定义的正则字符串列表
  const data = await chrome.storage.local.get("regexList");
  const regexStrings = data.regexList || [];

  if (regexStrings.length === 0) return;

  // 将字符串转换为正则对象
  const regexPatterns = regexStrings.map((str) => new RegExp(str));

  // 2. 获取历史记录（例如过去 24 小时）
  const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
  const historyItems = await chrome.history.search({
    text: "",
    startTime: oneDayAgo,
    maxResults: 5000,
  });

  // 3. 执行匹配与删除
  historyItems.forEach((item) => {
    const isMatch = regexPatterns.some(
      (rx) => rx.test(item.url) || re.test(item.title)
    );
    if (isMatch) {
      chrome.history.deleteUrl({ url: item.url });
    }
  });
}

// --- 监听器设置 ---

// 1. 监听浏览器启动
chrome.runtime.onStartup.addListener(() => {
  console.log("浏览器已启动，触发初始清理");
  performCleanup();
});

// 2. 监听定时任务 (例如每 30 分钟)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "cleanupTask") {
    performCleanup();
  }
});

// 首次安装插件时，初始化定时器
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("cleanupTask", { periodInMinutes: 60 });
});
