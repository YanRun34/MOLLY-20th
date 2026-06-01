/**
 * 路径修复脚本 - 必须在所有其他脚本之前加载
 * 用于 GitHub Pages 子目录部署
 */
(function() {
  var basePath = '/MOLLY-20th/';
  var isInSubdir = window.location.pathname.startsWith(basePath);
  
  if (!isInSubdir) return;
  
  console.log('[PathFix] 检测到 GitHub Pages 子目录部署，启用路径修复');
  
  // 1. 拦截 fetch
  var originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (typeof url === 'string' && url.startsWith('/assets/')) {
      url = basePath + url.slice(1);
      console.log('[PathFix] fetch 路径修复:', arguments[0], '->', url);
    }
    return originalFetch.call(this, url, options);
  };
  
  // 2. 拦截 XMLHttpRequest
  var originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    if (typeof url === 'string' && url.startsWith('/assets/')) {
      url = basePath + url.slice(1);
      console.log('[PathFix] XHR 路径修复:', arguments[1], '->', url);
    }
    return originalOpen.apply(this, arguments);
  };
  
  // 3. 拦截 Image 的 src 设置
  var originalSrcSetter = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src').set;
  Object.defineProperty(HTMLImageElement.prototype, 'src', {
    set: function(value) {
      if (typeof value === 'string' && value.startsWith('/assets/')) {
        value = basePath + value.slice(1);
        console.log('[PathFix] Image.src 路径修复:', arguments[0], '->', value);
      }
      originalSrcSetter.call(this, value);
    },
    get: function() {
      return originalSrcSetter.call(this);
    }
  });
  
  // 4. 拦截创建 style/link 元素时的路径
  var originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    var element = originalCreateElement.call(document, tagName);
    if (tagName.toLowerCase() === 'img') {
      // 已经通过 HTMLImageElement.prototype.src 拦截了
    }
    return element;
  };
  
  // 5. 拦截 audio/video 的 src
  var originalAudioSrcSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src').set;
  Object.defineProperty(HTMLMediaElement.prototype, 'src', {
    set: function(value) {
      if (typeof value === 'string' && value.startsWith('/assets/')) {
        value = basePath + value.slice(1);
      }
      originalAudioSrcSetter.call(this, value);
    },
    get: function() {
      return originalAudioSrcSetter.call(this);
    }
  });
  
  console.log('[PathFix] 路径修复已启用');
})();
