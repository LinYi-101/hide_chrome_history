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

// --- 1 核心清理逻辑封装 ---
async function performCleanup() {
  console.log("正在执行清理任务...");
  console.log("cachedRegexes", cachedRegexes);
  // 2. 获取历史记录（例如过去 24 小时）
  const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
  const historyItems = await chrome.history.search({
    text: "",
    startTime: oneDayAgo,
    maxResults: 5000,
  });
  // 3. 执行匹配与删除
  historyItems.forEach((item) => {
    const isMatch = cachedRegexes.some(
      (re) => re.test(item.url) || re.test(item.title),
    );
    if (isMatch) {
      chrome.history.deleteUrl({ url: item.url });
    }
  });
}

// 2. 监听【安装/刷新】事件 (确保你点击“刷新”按钮或刚安装时就会跑一次)
chrome.runtime.onInstalled.addListener(() => {
  console.log("扩展已安装/更新，开始首次清理并设置闹钟");
  performCleanup();
  // 创建闹钟：每 60 分钟执行一次
  chrome.alarms.create("periodicClean", {
    periodInMinutes: 60,
  });
});

// 3. 监听【浏览器启动】事件
chrome.runtime.onStartup.addListener(() => {
  console.log("浏览器已启动，触发清理...");
  performCleanup();
});

// 4. 监听【定时器】触发
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "periodicClean") {
    performCleanup();
  }
});
