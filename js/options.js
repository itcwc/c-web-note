document.addEventListener('DOMContentLoaded', function() {
    // 获取语言选择框和设置内容的元素
    const languageSelect = document.getElementById('languageSelect');
    const settingText = document.getElementById('setting');
    const currentLanguageText = document.getElementById('current_language');
    const selectLanguageText = document.getElementById('select_language');

    // 从 Chrome storage 中获取保存的语言设置
    chrome.storage.sync.get('language', function(data) {
        const language = data.language || 'en'; // 默认使用英语
        languageSelect.value = language;
        updateContent(language);
    });

    // 当用户选择语言时，更新语言设置并更新页面内容
    languageSelect.addEventListener('change', function() {
        const selectedLanguage = this.value;
        chrome.storage.sync.set({ language: selectedLanguage }, function() {
            updateContent(selectedLanguage);
        });
    });

    // 根据选择的语言更新页面内容
    function updateContent(language) {
        fetch(`_locales/${language}/messages.json`)
            .then(response => response.json())
            .then(messages => {
                settingText.innerText = messages.setting.message;
                currentLanguageText.innerText = messages["current_language"].message;
                selectLanguageText.innerText = messages["select_language"].message;
            })
            .catch(error => console.error('Error loading language file:', error));
    }
});
