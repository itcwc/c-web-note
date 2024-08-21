// 编辑器
var editor;
$(function () {
  const params = new URLSearchParams(window.location.search);
  editor = editormd("editor", {
    height: params.get("height") * 0.8,
    path: "editormd/lib/",
    toolbarIcons: function () {
      return [
        "bold",
        "italic",
        "pagebreak",
        "|",
        "h1",
        "h2",
        "h3",
        "|",
        "hr",
        "quote",
        "list-ul",
        "list-ol",
        "|",
        "link",
        "image",
        "code",
        "preformatted-text",
        "code-block",
        "table",
        "datetime",
      ];
    },
    saveHTMLToTextarea: true,
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // 笔记
  const params = new URLSearchParams(window.location.search);
  const text = params.get("text") || "";
  const noteTextarea = document.getElementById("note");
  noteTextarea.value = text;

  // 添加笔记
  chrome.runtime.onMessage.addListener((message) => {
    // 获取当前语言
    chrome.storage.sync.get('language', (result) => {
      const currentLanguage = result.language || 'en'; // 默认语言为 'en'
  
      // 加载对应语言的消息文件
      fetch(chrome.runtime.getURL(`_locales/${currentLanguage}/messages.json`))
        .then(response => response.json())
        .then(messages => {
          // 获取本地化的消息
          const copyImageText = messages.copy_image?.message || '网页图片';
          const sourceLinkText = messages.source_link?.message || '来源链接_原始网页【如需保存请手动下载】';
  
          // 处理消息
          if (message.action === "saveImageToNote") {
            const imageUrl = message.imageUrl;
            const pageUrl = message.pageUrl;
            const imageMarkdown = `![${copyImageText}](${imageUrl})\n[${sourceLinkText}](${pageUrl})\n`;
  
            // 将图片的 Markdown 格式插入到编辑器中
            editor.insertValue(imageMarkdown);
          }
  
          if (message.addToExisting) {
            noteTextarea.value += `\n${message.selectedText}`;
            editor.setMarkdown(noteTextarea.value);
          }
        })
        .catch(error => console.error('Error loading language file:', error));
    });
  });

  // 导出
  const exportNote = () => {
    const format = document.getElementById("exportFormat").value;
    const content = noteTextarea.value;
    const renderedContent = editor.getHTML();

    switch (format) {
      case "md":
        const mdBlob = new Blob([content], {
          type: "text/markdown;charset=utf-8",
        });
        saveAs(mdBlob, "note.md");
        break;

      case "pdf":
        // 导出PDF文件
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
          console.error("jsPDF library is not loaded properly.");
          return;
        }
        const doc = new jsPDF();
        const PDFTempDiv = document.createElement("div");
        PDFTempDiv.innerHTML = renderedContent;

        doc.html(PDFTempDiv, {
          callback: function (doc) {
            doc.save("note.pdf");
          },
          x: 10,
          y: 10,
          width: 190, // mm
          windowWidth: 650, // 渲染器使用的窗口宽度
        });
        break;

      case "html":
        const htmlBlob = new Blob([renderedContent], {
          type: "text/html;charset=utf-8",
        });
        saveAs(htmlBlob, "note.html");
        break;

      case "docx":
        var converted = htmlDocx.asBlob(
          '<meta charset="UTF-8">' + renderedContent
        );
        saveAs(converted, "note.docx");
        break;

      case "txt":
        // 导出渲染后的 HTML 内容为纯文本
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = renderedContent;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        const txtBlob = new Blob([textContent], {
          type: "text/plain;charset=utf-8",
        });
        saveAs(txtBlob, "note.txt");
        break;

      default:
        console.error("Unsupported format");
    }
  };

  document.getElementById("exportNote").addEventListener("click", exportNote);
});

function parseHtmlToParagraphs(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const elements = doc.body.children;
  const paragraphs = [];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element.tagName === "P") {
      const text = new TextRun(element.textContent);
      paragraphs.push(new Paragraph({ children: [text] }));
    }
  }

  return paragraphs;
}

document.getElementById("save-to-cloud").addEventListener("click", () => {
  createNotification("warning", "in_development");
});

// 语言设置
function updateContent(language) {
  fetch(chrome.runtime.getURL(`_locales/${language}/messages.json`))
    .then((response) => response.json())
    .then((messages) => {
      document.getElementById("title").textContent =
        messages.note_editor_title.message;
      document.getElementById("md").textContent = messages.md.message;
      document.getElementById("pdf").textContent = messages.pdf.message;
      document.getElementById("html").textContent = messages.html.message;
      document.getElementById("docx").textContent = messages.docx.message;
      document.getElementById("txt").textContent = messages.txt.message;
      document.getElementById("exportNote").textContent =
        messages.exportNote.message;
      document.getElementById("user_manual").textContent =
        messages.user_manual.message;
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
