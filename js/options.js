// 语言选择js
document.addEventListener("DOMContentLoaded", function () {
  // 获取语言选择框和设置内容的元素
  const languageSelect = document.getElementById("languageSelect");
  const settingText = document.getElementById("setting");
  const currentLanguageText = document.getElementById("current_language");
  const selectLanguageText = document.getElementById("select_language");

  // 从 Chrome storage 中获取保存的语言设置
  chrome.storage.sync.get("language", function (data) {
    const language = data.language || "en"; // 默认使用英语
    languageSelect.value = language;
    updateContent(language);
  });

  // 当用户选择语言时，更新语言设置并更新页面内容
  languageSelect.addEventListener("change", function () {
    const selectedLanguage = this.value;
    chrome.storage.sync.set({ language: selectedLanguage }, function () {
      updateContent(selectedLanguage);
    });
  });

  // 根据选择的语言更新页面内容
  function updateContent(language) {
    fetch(`_locales/${language}/messages.json`)
      .then((response) => response.json())
      .then((messages) => {
        settingText.innerText = messages.setting.message;
        currentLanguageText.innerText = messages["current_language"].message;
        selectLanguageText.innerText = messages["select_language"].message;

        document.getElementById("background_color_label").textContent =
          messages.background_color_label.message;
        document.getElementById("white_black_theme").textContent =
          messages.white_black_theme.message;
        document.getElementById("white_black_theme1").textContent =
          messages.white_black_theme1.message;
        document.getElementById("white_black_theme2").textContent =
          messages.white_black_theme2.message;
        document.getElementById("white_black_theme3").textContent =
          messages.white_black_theme3.message;
        document.getElementById("white_black_theme4").textContent =
          messages.white_black_theme4.message;
        document.getElementById("theme_label").textContent =
          messages.theme_label.message;
        document.getElementById("test_editormd_textarea").textContent =
          messages.test_editormd_textarea.message;
      })
      .catch((error) => console.error("Error loading language file:", error));
  }
});

$(document).ready(function () {
  $('input[name="background-color"]').change(function () {
    const selectedColor = $(this).val();
    const textColor = $(this).data("text-color");

    chrome.storage.sync.set(
      {
        backgroundColor: selectedColor,
        textColor: textColor,
      },
      function () {
        console.log(
          "Background color and text color have been set to:",
          selectedColor,
          textColor
        );
      }
    );
  });

  // 恢复之前的设置
  chrome.storage.sync.get(["backgroundColor", "textColor"], function (result) {
    if (result.backgroundColor && result.textColor) {
      $(
        `input[name="background-color"][value="${result.backgroundColor}"]`
      ).prop("checked", true);
    }
  });
});

// 编辑器主题设置js
var testEditor;
function themeSelect(id, themes, lsKey, callback) {
  var select = $("#" + id);

  for (var i = 0, len = themes.length; i < len; i++) {
    var theme = themes[i];
    var selected = localStorage[lsKey] == theme ? ' selected="selected"' : "";

    select.append(
      '<option value="' + theme + '"' + selected + ">" + theme + "</option>"
    );
  }

  select.bind("change", function () {
    var theme = $(this).val();

    if (theme === "") {
      alert('theme == ""');
      return false;
    }

    console.log("lsKey =>", lsKey, theme);

    // 保存到 localStorage
    localStorage[lsKey] = theme;

    // 保存到 Chrome storage
    var storageObject = {};
    storageObject[lsKey] = theme;
    chrome.storage.sync.set(storageObject, function () {
      console.log("Theme saved to Chrome storage:", lsKey, theme);
    });

    callback(select, theme);
  });

  return select;
}

$(function () {
  testEditor = editormd("test-editormd", {
    height: 200,
    theme: localStorage.theme ? localStorage.theme : "default",
    previewTheme: localStorage.previewTheme
      ? localStorage.previewTheme
      : "default",
    editorTheme: localStorage.editorTheme
      ? localStorage.editorTheme
      : "default",
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
  });

  themeSelect(
    "editormd-theme-select",
    editormd.themes,
    "theme",
    function ($this, theme) {
      testEditor.setTheme(theme);
    }
  );

  themeSelect(
    "editor-area-theme-select",
    editormd.editorThemes,
    "editorTheme",
    function ($this, theme) {
      testEditor.setCodeMirrorTheme(theme);
    }
  );

  themeSelect(
    "preview-area-theme-select",
    editormd.previewThemes,
    "previewTheme",
    function ($this, theme) {
      testEditor.setPreviewTheme(theme);
    }
  );
});
