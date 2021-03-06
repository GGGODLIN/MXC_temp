let hidden, visibilityChange;

if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

export const visisblityChange = ({ onShow, onHide }) => {
  // 如果浏览器不支持addEventListener 或 Page Visibility API 给出警告
  if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
    console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
  } else {
    // 处理页面可见属性的改变
    document.addEventListener(visibilityChange, () => {
      if (document[hidden]) {
        onHide && onHide();
      } else {
        onShow && onShow();
      }
    }, false);
  }
}
