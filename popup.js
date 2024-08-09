document.getElementById("new-note").addEventListener("click", () => {
  chrome.windows.getCurrent({ populate: true }, (currentWindow) => {
    const width = Math.round(currentWindow.width * 0.3);
    const height = Math.round(currentWindow.height * 0.5);

    chrome.windows.create({
      url: `note_editor.html?width=${encodeURIComponent(
        width
      )}&height=${encodeURIComponent(height)}`,
      type: "popup",
      width: width,
      height: height,
      left: Math.round((currentWindow.width - width) / 2),
      top: Math.round((currentWindow.height - height) / 2),
    });
  });
});

document.getElementById("save-to-cloud").addEventListener("click", () => {
    createNotification("开发中敬请期待", "开发中敬请期待V1.0");
});

// document.getElementById("forced-copy").addEventListener("click", () => {
//     createNotification("开发中敬请期待", "开发中敬请期待V1.0");
// });

function createNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "images/icon128.png", // Ensure this path is correct
    title: title,
    message: message,
  });
}
