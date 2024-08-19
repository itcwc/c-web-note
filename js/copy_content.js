// 获取 URL 参数中的文本内容
const params = new URLSearchParams(window.location.search);
const text = params.get("text");

console.log(text);


// 处理 URL 解码
// try {
//   const decodedText = decodeURIComponent(text || "");
//   document.getElementById("content").innerText = decodedText;
// } catch (e) {
//   console.log("Error decoding URL:", e);
//   document.getElementById("content").innerText = "Error loading content.";
// }
