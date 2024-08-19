document.getElementById("new-note").addEventListener("click", () => {
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
});

// document.getElementById("save-to-cloud").addEventListener("click", () => {
//     createNotification("开发中敬请期待", "开发中敬请期待V1.0");
// });

// document.getElementById("forced-copy").addEventListener("click", () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     chrome.scripting.executeScript({
//       target: { tabId: tabs[0].id },
//       func: () => document.body.innerText,
//     }, (result) => {
//       const pageText = result[0].result;
//       const width = Math.round(window.innerWidth * 0.3);
//       const height = Math.round(window.innerHeight * 0.5);

//       // 创建新窗口并展示内容
//       chrome.windows.create({
//         url: `copy_content.html?text=${encodeURIComponent(pageText)}`,
//         type: 'popup',
//         width: width,
//         height: height,
//         left: Math.round((window.innerWidth - width) / 2),
//         top: Math.round((window.innerHeight - height) / 2),
//       });
//     });
//   });
// });

function createNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "../images/icon128.png", // Ensure this path is correct
    title: title,
    message: message,
  });
}
