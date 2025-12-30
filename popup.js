const regexInput = document.getElementById('regexInput');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');

// 1. 初始化加载
chrome.storage.local.get(['regexList'], (result) => {
  const defaultRegex = ".*google.com/search?.*q=.*";
  if (result.regexList && result.regexList.length > 0) {
    regexInput.value = result.regexList.join('\n');
  } else {
    regexInput.value = defaultRegex;
  }
});

// 2. 点击保存并执行深度清理
saveBtn.addEventListener('click', async () => {
  const list = regexInput.value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // 将字符串列表转为正则对象数组，用于立即扫描
  const regexObjects = list.map(pattern => {
    try { return new RegExp(pattern, 'i'); } catch (e) { return null; }
  }).filter(Boolean);

  // 禁用按钮，显示处理中
  saveBtn.disabled = true;
  saveBtn.style.backgroundColor = '#ccc';
  status.textContent = '正在保存并清理存量历史...';
  status.style.color = 'blue';

  // A. 保存到 storage (触发 background.js 的实时拦截更新)
  await chrome.storage.local.set({ regexList: list });

  // B. 执行存量清理：搜索并删除
  try {
    // 获取全部历史记录 (startTime: 0 代表从有记录以来开始)
    // maxResults: 99999 是 API 允许的上限
    const historyItems = await chrome.history.search({
      text: '',
      startTime: 0,
      maxResults: 99999
    });

    let deletedCount = 0;
    for (const item of historyItems) {
      const isMatch = regexObjects.some(re => re.test(item.url) || re.test(item.title));
      if (isMatch) {
        await chrome.history.deleteUrl({ url: item.url });
        deletedCount++;
      }
    }

    // C. 成功提示
    status.style.color = 'green';
    status.textContent = `清理完成 (${deletedCount}条)，窗口即将关闭...`;

    // 延迟关闭
    setTimeout(() => {
      window.close();
    }, 1200);

  } catch (error) {
    console.error("清理出错:", error);
    status.style.color = 'red';
    status.textContent = '保存成功，但存量清理出错。';
    saveBtn.disabled = false;
  }
});