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
    contexts: ["all"]
  });

});

function createNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "images/icon128.png", // Ensure this path is correct
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

      chrome.windows.create({
        url: `note_editor.html?width=${encodeURIComponent(width)}&height=${encodeURIComponent(height)}`,
        type: 'popup',
        width: width,
        height: height,
        left: Math.round((currentWindow.width - width) / 2),
        top: Math.round((currentWindow.height - height) / 2)
      });
    });
  } else if (info.menuItemId === "add-to-notes") {

    if (selectedText == null) {
      createNotification("没有选中内容。", "请先选中内容。如无内容，可以使用新建笔记项~");
    }

    chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
      const width = Math.round(currentWindow.width * 0.3);
      const height = Math.round(currentWindow.height * 0.5);

      chrome.windows.create({
        url: `note_editor.html?text=${encodeURIComponent(selectedText)}&width=${encodeURIComponent(width)}&height=${encodeURIComponent(height)}`,
        type: 'popup',
        width: width,
        height: height,
        left: Math.round((currentWindow.width - width) / 2),
        top: Math.round((currentWindow.height - height) / 2)
      });
    });

  } else if (info.menuItemId === "add-to-existing-note") {

    if (selectedText == null) {
      createNotification("没有选中内容。", "请先选中内容。如无内容，可以使用新建笔记项~");
    }

    chrome.runtime.sendMessage({
      selectedText: selectedText,
      addToExisting: true
    });

  } else {

    createNotification("找不到现有笔记。", "没有找到现有的注释窗口。请先创建一个新笔记。");

  }
});