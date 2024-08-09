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

function createNotification(title, message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "images/icon128.png", // Ensure this path is correct
    title: title,
    message: message,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // 笔记
  const params = new URLSearchParams(window.location.search);
  const text = params.get("text") || "";
  const noteTextarea = document.getElementById("note");
  noteTextarea.value = text;

  // 添加笔记
  chrome.runtime.onMessage.addListener((message) => {
    if (message.addToExisting) {
      console.log(message.selectedText);
      noteTextarea.value += `\n${message.selectedText}`;
      editor.setMarkdown(noteTextarea.value);
    }
  });

  // 保存按钮
  // document.getElementById('save').addEventListener('click', () => {
  //   const noteContent = noteTextarea.value;
  //   // 在这里实现保存笔记的逻辑，例如保存到本地存储或发送到服务器
  //   console.log('Note saved:', noteContent);
  //   createNotification("保存笔记代码！")
  //   window.close();
  // });

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
        
        var converted = htmlDocx.asBlob('<meta charset="UTF-8">'+renderedContent);
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


// document.getElementById("save-to-cloud").addEventListener("click", () => {
//   createNotification("开发中敬请期待", "开发中敬请期待V1.0");
// });