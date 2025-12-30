const i18n = {
  zh: {
    title: "正则历史过滤",
    desc: "符合以下正则的历史记录将被实时拦截并清理：",
    button: "保存并清理",
    cleaning: "正在清理存量历史...",
    success: "清理完成 ({count}条)，窗口即将关闭...",
    error: "保存失败或清理过程中出错。",
  },
  en: {
    title: "Regex History Filter",
    desc: "Existing matches will be cleaned, and future visits blocked:",
    button: "Save & Clean",
    cleaning: "Cleaning existing history...",
    success: "Cleaned {count} items. Closing...",
    error: "Error during saving or cleaning.",
  },
};

const langSelect = document.getElementById("langSelect");
const regexInput = document.getElementById("regexInput");
const saveBtn = document.getElementById("saveBtn");
const statusMsg = document.getElementById("status"); // 确保 ID 对应 HTML 中的 div

// --- 1. 初始化界面 ---
chrome.storage.local.get(["regexList", "language"], (result) => {
  // 处理语言
  const currentLang = result.language || "zh";
  langSelect.value = currentLang;
  updateUI(currentLang);

  // 处理默认正则
  const defaultRegex = ".*google.com/search?.*q=.*";
  if (result.regexList && result.regexList.length > 0) {
    regexInput.value = result.regexList.join("\n");
  } else {
    regexInput.value = defaultRegex;
  }
});

// --- 2. 语言切换函数 ---
function updateUI(lang) {
  document.getElementById("ui-title").textContent = i18n[lang].title;
  document.getElementById("ui-desc").textContent = i18n[lang].desc;
  document.getElementById("ui-button").textContent = i18n[lang].button;
}

langSelect.addEventListener("change", () => {
  const newLang = langSelect.value;
  updateUI(newLang);
  chrome.storage.local.set({ language: newLang });
});

// --- 3. 保存并清理逻辑 ---
saveBtn.addEventListener("click", async () => {
  const lang = langSelect.value;
  const rawValue = regexInput.value.trim();
  const list = rawValue
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // 立即将按钮设为加载状态
  saveBtn.disabled = true;
  statusMsg.className = "info"; // 蓝色
  statusMsg.textContent = i18n[lang].cleaning;

  try {
    // A. 准备正则表达式对象
    const regexObjects = list
      .map((pattern) => {
        try {
          return new RegExp(pattern, "i");
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    // B. 先把正则保存到存储中
    await chrome.storage.local.set({ regexList: list });

    // C. 执行存量清理
    const historyItems = await chrome.history.search({
      text: "",
      startTime: 0,
      maxResults: 99999,
    });

    let deletedCount = 0;
    for (const item of historyItems) {
      const isMatch = regexObjects.some(
        (re) => re.test(item.url) || re.test(item.title)
      );
      if (isMatch) {
        await chrome.history.deleteUrl({ url: item.url });
        deletedCount++;
      }
    }

    // D. 全部流程走完，显示绿色成功提示
    statusMsg.className = "success"; // 切换到绿色类名
    statusMsg.textContent = i18n[lang].success.replace("{count}", deletedCount);

    // E. 延迟关闭
    setTimeout(() => {
      window.close();
    }, 1500);
  } catch (err) {
    console.error(err);
    statusMsg.className = "error"; // 红色
    statusMsg.textContent = i18n[lang].error;
    saveBtn.disabled = false; // 出错时恢复按钮
  }
});
