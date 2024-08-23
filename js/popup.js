// 打开设置
document.getElementById("settings-btn").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// 新建笔记
document.getElementById("new-note").addEventListener("click", () => {
  chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
    const width = Math.round(currentWindow.width * 0.3);
    const height = Math.round(currentWindow.height * 0.5);

    var themeColor = "#505050";
    var textColor = "#FFFFFF";

    var themeUrl = `&themeColor=${encodeURIComponent(
      themeColor
    )}&textColor=${encodeURIComponent(textColor)}`;

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
});

// 保存到云
document.getElementById("save-to-cloud").addEventListener("click", () => {
  createNotification("warning", "in_development");
});

// 强制复制
document.getElementById("forced-copy").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => document.body.innerText,
      },
      (result) => {
        const pageText = result[0].result;

        // 使用屏幕尺寸
        const width = Math.round(screen.width * 0.3);
        const height = Math.round(screen.height * 0.5);

        chrome.storage.sync.get(
          ["backgroundColor", "textColor"],
          function (result) {
            var themeColor = result.backgroundColor || "white";
            var textColor = result.textColor || "black";

            var themeUrl = `&themeColor=${encodeURIComponent(
              themeColor
            )}&textColor=${encodeURIComponent(textColor)}`;

            // 创建新窗口并展示内容
            chrome.windows.create({
              url:
                `copy_content.html?text=${encodeURIComponent(pageText)}` +
                themeUrl,
              type: "popup",
              width: width,
              height: height,
              left: Math.round((screen.width - width) / 2),
              top: Math.round((screen.height - height) / 2),
            });
          }
        );
      }
    );
  });
});

// 语言设置
function updateContent(language) {
  fetch(chrome.runtime.getURL(`_locales/${language}/messages.json`))
    .then((response) => response.json())
    .then((messages) => {
      // document.getElementById('name').textContent = messages.name.message;

      document.querySelectorAll(".name").forEach((element) => {
        element.textContent = messages.name.message;
      });

      // document.getElementById('description').textContent = messages.description;
      // document.getElementById('description1').textContent = messages.description1.message;
      // document.getElementById('description2').textContent = messages.description2.message;
      // document.getElementById('description3').textContent = messages.description3.message;
      // document.getElementById('description4').textContent = messages.description4.message;

      document
        .querySelectorAll(".description-text")
        .forEach((element, index) => {
          if (messages[`description${index + 1}`]) {
            element.textContent = messages[`description${index + 1}`].message;
          }
        });

      document.getElementById("forced-copy").textContent =
        messages.forced_copy.message;
      document.getElementById("new-note").textContent =
        messages.new_note.message;
      document.getElementById("save-to-cloud").textContent =
        messages.save_to_cloud.message;

      // class方式
      // document.querySelector('#forced-copy').textContent = messages.forced_copy.message;
      // document.querySelector('#new-note').textContent = messages.new_note.message;
      // document.querySelector('#save-to-cloud').textContent = messages.save_to_cloud.message;
    })
    .catch((error) => console.error("Error loading language file:", error));
}

chrome.storage.sync.get("language", function (data) {
  const language = data.language || "en";
  updateContent(language);
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
