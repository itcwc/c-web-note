// 动态更新右键菜单
function updateContextMenu(language) {
  // 移除现有菜单
  chrome.contextMenus.removeAll(() => {
    // 通过 fetch 加载对应语言的消息文件
    fetch(chrome.runtime.getURL(`_locales/${language}/messages.json`))
      .then((response) => response.json())
      .then((messages) => {
        const getLocalizedText = (key) => messages[key]?.message || key;

        chrome.contextMenus.create({
          id: "new-note",
          title: getLocalizedText("new_note"),
          contexts: ["all"],
        });
        chrome.contextMenus.create({
          id: "add-to-notes",
          title: getLocalizedText("add_to_notes"),
          contexts: ["all"],
        });
        chrome.contextMenus.create({
          id: "add-to-existing-note",
          title: getLocalizedText("add_to_existing_note"),
          contexts: ["all"],
        });
        chrome.contextMenus.create({
          id: "save-image-to-notes",
          title: getLocalizedText("save_image_to_notes"),
          contexts: ["image"],
        });
      })
      .catch((error) => console.error("Error loading language file:", error));
  });
}

// 初始创建菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("language", (result) => {
    const currentLanguage = result.language || "en"; // 默认语言为 'en'
    updateContextMenu(currentLanguage);
  });
});

// 监听配置文件变化
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.language) {
    const newLanguage = changes.language.newValue || "en";
    updateContextMenu(newLanguage);
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;

  if (info.menuItemId === "new-note") {
    chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
      const width = Math.round(currentWindow.width * 0.3);
      const height = Math.round(currentWindow.height * 0.5);

      chrome.storage.sync.get(
        ["backgroundColor", "textColor"],
        function (result) {
          var themeColor = result.backgroundColor || "white";
          var textColor = result.textColor || "black";

          console.log(themeColor, textColor);

          var themeUrl = `&themeColor=${encodeURIComponent(
            themeColor
          )}&textColor=${encodeURIComponent(textColor)}`;

          chrome.windows.create(
            {
              url:
                `note_editor.html?width=${encodeURIComponent(
                  width
                )}&height=${encodeURIComponent(height)}` + themeUrl,
              type: "popup",
              width: width,
              height: height,
              left: Math.round((currentWindow.width - width) / 2),
              top: Math.round((currentWindow.height - height) / 2),
            },
            (newWindow) => {
              // 保存窗口ID到 chrome.storage
              chrome.storage.local.set({ editorWindowId: newWindow.id });

              // 监听窗口关闭事件
              chrome.windows.onRemoved.addListener(function (windowId) {
                if (windowId === newWindow.id) {
                  // 窗口关闭时删除存储的ID
                  chrome.storage.local.remove("editorWindowId");
                }
              });
            }
          );
        }
      );
    });
  }

  // 添加内容到新笔记
  if (info.menuItemId === "add-to-notes") {
    if (selectedText == null) {
      createNotification("warning", "warning");
      return;
    }

    chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
      const width = Math.round(currentWindow.width * 0.3);
      const height = Math.round(currentWindow.height * 0.5);

      chrome.storage.sync.get(
        ["backgroundColor", "textColor"],
        function (result) {
          var themeColor = result.backgroundColor || "white";
          var textColor = result.textColor || "black";

          var themeUrl = `&themeColor=${encodeURIComponent(
            themeColor
          )}&textColor=${encodeURIComponent(textColor)}`;

          chrome.windows.create(
            {
              url:
                `note_editor.html?text=${encodeURIComponent(
                  selectedText
                )}&width=${encodeURIComponent(
                  width
                )}&height=${encodeURIComponent(height)}` + themeUrl,
              type: "popup",
              width: width,
              height: height,
              left: Math.round((currentWindow.width - width) / 2),
              top: Math.round((currentWindow.height - height) / 2),
            },
            (newWindow) => {
              // 保存窗口ID到 chrome.storage
              chrome.storage.local.set({ editorWindowId: newWindow.id });

              // 监听窗口关闭事件
              chrome.windows.onRemoved.addListener(function (windowId) {
                if (windowId === newWindow.id) {
                  // 窗口关闭时删除存储的ID
                  chrome.storage.local.remove("editorWindowId");
                }
              });
            }
          );
        }
      );
    });
  }

  // 添加内容到现有笔记
  if (info.menuItemId === "add-to-existing-note") {
    if (selectedText == null) {
      createNotification("warning", "warning");
      return;
    }

    chrome.storage.local.get("editorWindowId", (result) => {
      if (!result.editorWindowId) {
        createNotification("warning", "warning1");
      }
      return;
    });

    chrome.runtime.sendMessage({
      selectedText: selectedText,
      addToExisting: true,
    });
  }

  if (info.menuItemId === "save-image-to-notes") {
    const imageUrl = info.srcUrl;
    const pageUrl = info.pageUrl;

    // 从 chrome.storage.local 获取 editorWindowId
    chrome.storage.local.get("editorWindowId", (result) => {
      const editorWindowId = result.editorWindowId;

      // 如果没有 editorWindowId，显示警告并退出
      if (!editorWindowId) {
        createNotification("warning", "warning1");
        return;
      }

      // 检查窗口是否存在
      chrome.windows.get(editorWindowId, (window) => {
        if (chrome.runtime.lastError || !window) {
          // 如果窗口不存在，移除存储的 ID 并通知用户
          chrome.storage.local.remove("editorWindowId");
          createNotification("warning", "warning1");
          return;
        }

        // 如果窗口存在，发送消息到 note_editor.html 以保存图片信息
        chrome.runtime.sendMessage({
          action: "saveImageToNote",
          imageUrl: imageUrl,
          pageUrl: pageUrl,
        });
      });
    });
  }
});

function createNotification(notificationType, messageKey) {
  chrome.storage.sync.get("language", function (data) {
    const currentLanguage = data.language || "en"; // 默认使用英语
    // 加载对应语言的消息文件
    fetch(chrome.runtime.getURL(`../_locales/${currentLanguage}/messages.json`))
      .then((response) => response.json())
      .then((messages) => {
        // 获取本地化的消息
        const message = messages[messageKey]?.message || messageKey;

        chrome.notifications.create({
          type: "basic",
          iconUrl: "../images/icon128.png", // 确保路径正确
          title: notificationType,
          message: message,
        });
      });
  });
}
