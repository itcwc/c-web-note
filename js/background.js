chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "new-note",
    title: "新建笔记",
    contexts: ["all"],
  });
  chrome.contextMenus.create({
    id: "add-to-notes",
    title: "添加内容到新笔记",
    contexts: ["all"],
  });
  chrome.contextMenus.create({
    id: "add-to-existing-note",
    title: "添加内容到现有笔记",
    contexts: ["all"],
  });
  // 添加新的右键菜单项用于保存图片到 MD 笔记
});
chrome.contextMenus.create({
  id: "save-image-to-notes",
  title: "保存图片到现有笔记",
  contexts: ["image"],
});

function createNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "../images/icon128.png", // Ensure this path is correct
    title: title,
    message: message,
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;

  if (info.menuItemId === "new-note") {
    chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
      const width = Math.round(currentWindow.width * 0.3);
      const height = Math.round(currentWindow.height * 0.5);

      chrome.windows.create(
        {
          url: `note_editor.html?width=${encodeURIComponent(
            width
          )}&height=${encodeURIComponent(height)}`,
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
    });
  }

  // 添加内容到新笔记
  if (info.menuItemId === "add-to-notes") {
    if (selectedText == null) {
      createNotification(
        "warning",
        "请先选中内容。如无内容，可以使用新建笔记项~"
      );
      return
    }

    chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
      const width = Math.round(currentWindow.width * 0.3);
      const height = Math.round(currentWindow.height * 0.5);

      chrome.windows.create(
        {
          url: `note_editor.html?text=${encodeURIComponent(
            selectedText
          )}&width=${encodeURIComponent(width)}&height=${encodeURIComponent(
            height
          )}`,
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
    });
  }

  // 添加内容到现有笔记
  if (info.menuItemId === "add-to-existing-note") {
    if (selectedText == null) {
      createNotification(
        "warning",
        "请先选中内容。如无内容，可以使用新建笔记项~"
      );
      return
    }

    chrome.storage.local.get("editorWindowId", (result) => {
      if (!result.editorWindowId) {
        createNotification("warning", "请先打开笔记编辑器~");
      }
      return
    });

    chrome.runtime.sendMessage({
      selectedText: selectedText,
      addToExisting: true,
    });
  }

  if (info.menuItemId === "save-image-to-notes") {
    const imageUrl = info.srcUrl;
    const pageUrl = info.pageUrl;
    chrome.storage.local.get("editorWindowId", (result) => {
      if (!result.editorWindowId) {
        createNotification("warning", "请先打开笔记编辑器~");
      }
      return
    });

    // 发送消息到 note_editor.html 以保存图片信息
    chrome.runtime.sendMessage({
      action: "saveImageToNote",
      imageUrl: imageUrl,
      pageUrl: pageUrl,
    });
  }
});
