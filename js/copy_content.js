// 获取 URL 参数中的文本内容
const params = new URLSearchParams(window.location.search);
const text = params.get("text");
document.getElementById("content").innerText = text;

// 语言设置
function updateContent(language) {
  fetch(chrome.runtime.getURL(`_locales/${language}/messages.json`))
    .then((response) => response.json())
    .then((messages) => {
      document.getElementById("title").textContent =
        messages.copy_content_title.message;
    })
    .catch((error) => console.error("Error loading language file:", error));
}

chrome.storage.sync.get("language", function (data) {
  const language = data.language || "en";
  updateContent(language);
});
