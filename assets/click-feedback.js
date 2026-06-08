/**
 * MOLLY 20周年 H5 点击反馈优化脚本 - 移动端适配版
 * 修复UI点击时只有放大没有回弹的问题，针对手机端优化
 */

(function() {
  'use strict';
  
  console.log('[ClickFeedback] 点击反馈优化脚本已加载 (移动端适配版)');
  
  // 检测是否为触摸设备
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // 添加CSS动画样式
  function injectClickFeedbackCSS() {
    if (document.getElementById('click-feedback-css')) return;
    
    const style = document.createElement('style');
    style.id = 'click-feedback-css';
    style.textContent = `
      /* 按钮点击反馈动画 - 移动端优化 */
      .click-feedback {
        transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1) !important;
        -webkit-tap-highlight-color: transparent !important;
        touch-action: manipulation !important;
      }
      
      .click-feedback:active,
      .click-feedback.clicking {
        transform: scale(0.92) !important;
      }
      
      /* 卡片点击反馈 - 移动端优化 */
      .card-click-feedback {
        transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), 
                    box-shadow 0.15s ease !important;
        -webkit-tap-highlight-color: transparent !important;
        touch-action: manipulation !important;
      }
      
      .card-click-feedback:active,
      .card-click-feedback.clicking {
        transform: scale(0.94) !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
      }
      
      /* 颜色按钮点击反馈 - 移动端优化 */
      .color-btn-feedback {
        transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1),
                    filter 0.1s ease !important;
        -webkit-tap-highlight-color: transparent !important;
        touch-action: manipulation !important;
      }
      
      .color-btn-feedback:active,
      .color-btn-feedback.clicking {
        transform: scale(0.9) !important;
        filter: brightness(0.85) !important;
      }
      
      /* 导航按钮点击反馈 - 移动端优化 */
      .nav-btn-feedback {
        transition: transform 0.08s cubic-bezier(0.4, 0, 0.2, 1) !important;
        -webkit-tap-highlight-color: transparent !important;
        touch-action: manipulation !important;
      }
      
      .nav-btn-feedback:active,
      .nav-btn-feedback.clicking {
        transform: scale(0.88) !important;
      }
      
      /* 禁用移动端默认的高亮效果 */
      button, [role="button"], .click-feedback, .card-click-feedback, 
      .color-btn-feedback, .nav-btn-feedback {
        -webkit-tap-highlight-color: transparent !important;
        -webkit-touch-callout: none !important;
        user-select: none !important;
      }
      
      /* 游戏区域触摸优化 - 确保canvas和游戏元素可正常点击 */
      canvas, [class*="game"], [class*="flower"], [class*="catch"],
      [data-world], svg, .game-area, .game-container {
        touch-action: auto !important;
        pointer-events: auto !important;
        -webkit-user-select: auto !important;
        user-select: auto !important;
      }
      
      /* 游戏容器和body在游戏时恢复触摸 */
      body:has(canvas), body:has([class*="game"]), body:has([class*="flower"]) {
        touch-action: auto !important;
      }
      
      /* 防止移动端双击缩放 - 但不影响游戏区域 */
      *:not(canvas):not([class*="game"]):not([class*="flower"]):not([class*="catch"]):not(svg):not(body):not(html) {
        touch-action: manipulation;
      }
    `;
    document.head.appendChild(style);
    console.log('[ClickFeedback] CSS样式已注入 (移动端适配)');
  }
  
  // 为所有按钮添加点击反馈
  function addClickFeedbackToButtons() {
    // 获取所有按钮和可点击元素
    const buttons = document.querySelectorAll('button, [role="button"], a, input[type="button"], input[type="submit"]');
    
    buttons.forEach(btn => {
      if (btn.dataset.clickFeedbackAdded) return;
      btn.dataset.clickFeedbackAdded = 'true';
      
      // 根据按钮类型添加不同的反馈类
      const className = btn.className || '';
      const text = btn.textContent || '';
      
      if (className.includes('color') || text.includes('颜色') || className.includes('yellow') || className.includes('blue') || className.includes('pink')) {
        btn.classList.add('color-btn-feedback');
      } else if (className.includes('card') || className.includes('world') || className.includes('journey')) {
        btn.classList.add('card-click-feedback');
      } else if (className.includes('nav') || text.includes('返回') || text.includes('关闭') || text.includes('静音')) {
        btn.classList.add('nav-btn-feedback');
      } else {
        btn.classList.add('click-feedback');
      }
      
      // 添加触摸/鼠标事件处理
      addPressFeedback(btn);
    });
    
    console.log('[ClickFeedback] 已为', buttons.length, '个按钮添加点击反馈');
  }
  
  // 为所有可点击的div元素添加反馈
  function addClickFeedbackToClickableDivs() {
    const divs = document.querySelectorAll('div[onclick], div[class*="clickable"], div[class*="selectable"]');
    
    divs.forEach(div => {
      if (div.dataset.clickFeedbackAdded) return;
      div.dataset.clickFeedbackAdded = 'true';
      
      div.classList.add('click-feedback');
      addPressFeedback(div);
    });
  }
  
  // 添加按压反馈效果 - 移动端优化
  function addPressFeedback(element) {
    let isPressed = false;
    let pressTimer = null;
    
    // 触摸开始 - 移动端主要交互方式
    element.addEventListener('touchstart', (e) => {
      isPressed = true;
      // 立即添加点击状态
      element.classList.add('clicking');
      
      // 清除之前的定时器
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    }, { passive: true });
    
    // 触摸结束
    element.addEventListener('touchend', () => {
      isPressed = false;
      // 短暂延迟后移除点击状态，让用户看到反馈
      pressTimer = setTimeout(() => {
        element.classList.remove('clicking');
      }, 100);
    }, { passive: true });
    
    // 触摸取消
    element.addEventListener('touchcancel', () => {
      isPressed = false;
      element.classList.remove('clicking');
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    }, { passive: true });
    
    // 触摸移动（手指滑出元素时取消）
    element.addEventListener('touchmove', (e) => {
      if (isPressed) {
        const touch = e.touches[0];
        const rect = element.getBoundingClientRect();
        
        // 检查手指是否还在元素内
        if (touch.clientX < rect.left || touch.clientX > rect.right ||
            touch.clientY < rect.top || touch.clientY > rect.bottom) {
          isPressed = false;
          element.classList.remove('clicking');
        }
      }
    }, { passive: true });
    
    // 鼠标事件（桌面端备用）
    element.addEventListener('mousedown', () => {
      isPressed = true;
      element.classList.add('clicking');
    }, { passive: true });
    
    element.addEventListener('mouseup', () => {
      isPressed = false;
      pressTimer = setTimeout(() => {
        element.classList.remove('clicking');
      }, 100);
    }, { passive: true });
    
    element.addEventListener('mouseleave', () => {
      if (isPressed) {
        isPressed = false;
        element.classList.remove('clicking');
      }
    }, { passive: true });
  }
  
  // 为旅程卡片添加点击反馈
  function addCardClickFeedback() {
    // 查找旅程卡片 - 扩大选择范围
    const cards = document.querySelectorAll('[class*="world"], [class*="card"], [class*="journey"], [class*="game"]');
    
    cards.forEach(card => {
      if (card.dataset.cardFeedbackAdded) return;
      card.dataset.cardFeedbackAdded = 'true';
      
      card.classList.add('card-click-feedback');
      addPressFeedback(card);
    });
    
    console.log('[ClickFeedback] 已为', cards.length, '个卡片添加点击反馈');
  }
  
  // 为颜色选择按钮添加反馈
  function addColorButtonFeedback() {
    // 查找颜色按钮
    const colorButtons = document.querySelectorAll('[class*="color"], div[style*="background"]');
    
    colorButtons.forEach(btn => {
      if (btn.dataset.colorFeedbackAdded) return;
      btn.dataset.colorFeedbackAdded = 'true';
      
      btn.classList.add('color-btn-feedback');
      addPressFeedback(btn);
    });
  }
  
  // 监听新添加的元素
  function observeNewElements() {
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'BUTTON' || 
                node.getAttribute('role') === 'button' ||
                node.querySelectorAll('button, [role="button"]').length > 0) {
              shouldUpdate = true;
            }
          }
        });
      });
      
      if (shouldUpdate) {
        setTimeout(() => {
          addClickFeedbackToButtons();
          addCardClickFeedback();
          addColorButtonFeedback();
          addClickFeedbackToClickableDivs();
        }, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // 防止移动端双击缩放
  function preventDoubleTapZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }

  // ==================== 泡泡玛特盲盒机跳转 ====================

  function addBlindBoxLink() {
    // 检查是否已添加
    if (document.getElementById('blind-box-link')) return;

    // 查找最终页面特征 - "开启最终旅程"按钮或完成页面
    const bodyText = document.body.textContent || '';
    const hasFinalButton = bodyText.includes('开启最终旅程');
    const isCompletePage = bodyText.includes('完成') && bodyText.includes('11');

    if (!hasFinalButton && !isCompletePage) return;

    console.log('[ClickFeedback] 检测到最终页面，添加盲盒机链接');

    // 注入CSS
    if (!document.getElementById('blind-box-css')) {
      const style = document.createElement('style');
      style.id = 'blind-box-css';
      style.textContent = `
        #blind-box-link {
          display: block;
          width: 80%;
          max-width: 300px;
          margin: 20px auto;
          padding: 16px 24px;
          background: linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%);
          color: #fff;
          text-align: center;
          text-decoration: none;
          border-radius: 30px;
          font-size: 18px;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        #blind-box-link:active {
          transform: scale(0.95);
          box-shadow: 0 2px 8px rgba(255, 107, 157, 0.3);
        }
        #blind-box-link .sub-text {
          display: block;
          font-size: 12px;
          font-weight: normal;
          margin-top: 4px;
          opacity: 0.9;
        }
      `;
      document.head.appendChild(style);
    }

    // 创建链接按钮
    const linkBtn = document.createElement('a');
    linkBtn.id = 'blind-box-link';
    linkBtn.href = '#小程序://泡泡抽盒机/ahqApPB0UAFrKFG';
    linkBtn.innerHTML = '🎁 前往泡泡抽盒机<span class="sub-text">开启你的专属MOLLY盲盒</span>';

    // 点击事件处理
    linkBtn.addEventListener('click', (e) => {
      // 阻止默认跳转，使用小程序链接
      e.preventDefault();
      
      const miniprogramUrl = '#小程序://泡泡抽盒机/ahqApPB0UAFrKFG';

      // 在微信环境中尝试跳转小程序
      if (typeof wx !== 'undefined' && wx.miniProgram) {
        wx.miniProgram.navigateTo({
          url: '/pages/index/index'
        });
        return;
      }

      // 复制小程序链接到剪贴板
      if (navigator.clipboard) {
        navigator.clipboard.writeText(miniprogramUrl).then(() => {
          alert('小程序链接已复制，请在微信中打开');
        }).catch(() => {
          // 备用复制方案
          const input = document.createElement('input');
          input.value = miniprogramUrl;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          alert('小程序链接已复制，请在微信中打开');
        });
      } else {
        // 备用复制方案
        const input = document.createElement('input');
        input.value = miniprogramUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('小程序链接已复制，请在微信中打开');
      }

      console.log('[ClickFeedback] 点击盲盒机链接');
    });

    // 查找插入位置 - 在"开启最终旅程"按钮后面或海报下载区域
    const finalBtn = Array.from(document.querySelectorAll('button')).find(
      btn => btn.textContent.includes('开启最终旅程') || (btn.getAttribute('aria-label') || '').includes('开启最终旅程')
    );

    if (finalBtn && finalBtn.parentElement) {
      // 在"开启最终旅程"按钮后面插入，并添加一些间距
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'margin-top: 24px; padding: 0 20px;';
      wrapper.appendChild(linkBtn);
      finalBtn.parentElement.insertBefore(wrapper, finalBtn.nextSibling);
    } else {
      // 查找海报下载区域或其他内容区域
      const contentArea = document.querySelector('[class*="poster"], [class*="download"], [class*="share"]') 
                          || document.getElementById('root') 
                          || document.body;
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'margin-top: 24px; padding: 0 20px;';
      wrapper.appendChild(linkBtn);
      contentArea.appendChild(wrapper);
    }

    console.log('[ClickFeedback] 盲盒机链接已添加');

    // 添加"再玩一次"按钮
    addReplayButton();
  }

  // ==================== 再玩一次按钮 ====================
  function addReplayButton() {
    // 检查是否已添加
    if (document.getElementById('replay-btn')) return;

    console.log('[ClickFeedback] 添加再玩一次按钮');

    // 注入CSS
    if (!document.getElementById('replay-btn-css')) {
      const style = document.createElement('style');
      style.id = 'replay-btn-css';
      style.textContent = `
        #replay-btn {
          display: block;
          width: 80%;
          max-width: 300px;
          margin: 16px auto;
          padding: 16px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          text-align: center;
          text-decoration: none;
          border-radius: 30px;
          font-size: 18px;
          font-weight: bold;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          border: none;
        }
        #replay-btn:active {
          transform: scale(0.95);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }
      `;
      document.head.appendChild(style);
    }

    // 创建按钮
    const replayBtn = document.createElement('button');
    replayBtn.id = 'replay-btn';
    replayBtn.textContent = '🔄 再玩一次';

    // 点击事件 - 刷新页面重新开始
    replayBtn.addEventListener('click', () => {
      window.location.reload();
      console.log('[ClickFeedback] 点击再玩一次');
    });

    // 查找插入位置 - 在盲盒机链接后面
    const blindBoxLink = document.getElementById('blind-box-link');
    if (blindBoxLink && blindBoxLink.parentElement) {
      blindBoxLink.parentElement.insertBefore(replayBtn, blindBoxLink.nextSibling);
    } else {
      // 查找"开启最终旅程"按钮
      const finalBtn = Array.from(document.querySelectorAll('button')).find(
        btn => btn.textContent.includes('开启最终旅程')
      );
      if (finalBtn && finalBtn.parentElement) {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'margin-top: 16px; padding: 0 20px;';
        wrapper.appendChild(replayBtn);
        finalBtn.parentElement.insertBefore(wrapper, finalBtn.nextSibling);
      } else {
        const contentArea = document.getElementById('root') || document.body;
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'margin-top: 16px; padding: 0 20px;';
        wrapper.appendChild(replayBtn);
        contentArea.appendChild(wrapper);
      }
    }

    console.log('[ClickFeedback] 再玩一次按钮已添加');
  }
  
  // 修复封面图手机端显示不全
  function fixCoverImageMobile() {
    const coverImg = document.querySelector('img[alt*="MOLLY"], img[alt*="20周年"]');
    if (!coverImg) return;
    if (coverImg.dataset.mobileCoverFixed) return;
    coverImg.dataset.mobileCoverFixed = 'true';

    // 注入CSS
    if (!document.getElementById('cover-mobile-fix-css')) {
      const style = document.createElement('style');
      style.id = 'cover-mobile-fix-css';
      style.textContent = `
        img.absolute.inset-0.w-full.h-full.object-cover.object-top,
        img[class*="object-cover"][class*="object-top"][alt*="MOLLY"],
        img[class*="object-cover"][class*="object-top"][alt*="20"] {
          object-fit: contain !important;
          object-position: top center !important;
          width: 100% !important;
          height: auto !important;
          max-height: none !important;
          min-height: 0 !important;
          position: relative !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          bottom: auto !important;
          inset: auto !important;
          display: block !important;
        }
      `;
      document.head.appendChild(style);
    }

    // 移除Tailwind裁剪class
    coverImg.classList.remove('object-cover');
    coverImg.classList.remove('absolute');
    coverImg.classList.remove('inset-0');
    coverImg.classList.remove('h-full');
    coverImg.classList.add('object-contain');
    coverImg.classList.add('relative');
    coverImg.classList.add('block');

    // inline style确保生效
    coverImg.style.cssText = 'object-fit:contain;object-position:top center;width:100%;height:auto;position:relative;top:auto;left:auto;right:auto;bottom:auto;display:block;max-width:100%;';

    console.log('[ClickFeedback] 封面图手机端适配已应用');
  }

  // 将"开启旅程"按钮定位到封面图中的按钮位置
  function fixStartButtonPosition() {
    // 不再修改按钮位置和样式，保持React原始渲染
    console.log('[ClickFeedback] 按钮位置保持原样');
  }

  // 初始化
  function init() {
    console.log('[ClickFeedback] 初始化点击反馈系统 (触摸设备:', isTouchDevice, ')');
    
    injectClickFeedbackCSS();
    fixCoverImageMobile();
    fixStartButtonPosition();
    addClickFeedbackToButtons();
    addCardClickFeedback();
    addColorButtonFeedback();
    addClickFeedbackToClickableDivs();
    observeNewElements();
    
    // 防止双击缩放
    if (isTouchDevice) {
      preventDoubleTapZoom();
    }
    
    // 延迟再次执行，确保动态内容也被处理
    setTimeout(() => {
      addClickFeedbackToButtons();
      addCardClickFeedback();
      addColorButtonFeedback();
      addClickFeedbackToClickableDivs();
    }, 1000);
    
    // 延迟执行按钮位置修复，确保React已渲染
    setTimeout(() => {
      fixStartButtonPosition();
    }, 2000);
    
    setTimeout(() => {
      addClickFeedbackToButtons();
      addCardClickFeedback();
      addColorButtonFeedback();
      addClickFeedbackToClickableDivs();
      fixStartButtonPosition();
      addBlindBoxLink();
    }, 2500);

    // 监听页面变化，检测最终页面
    observeForFinalPage();

    // 启用双击接花模式
    enableDoubleTapCatch();

    // 调整背景音乐音量
    adjustAudioVolume();
  }

  // 监听页面变化，检测是否到达最终页面
  function observeForFinalPage() {
    const observer = new MutationObserver(() => {
      addBlindBoxLink();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // 调整背景音乐音量（只调整背景音乐，不影响音效）
  function adjustAudioVolume() {
    // 不再强制修改音量，保持原样
    console.log('[ClickFeedback] 音频音量保持原样');
  }
  
  // ==================== 花花世界双击接花 ====================
  function enableDoubleTapCatch() {
    if (document.getElementById('double-tap-catch-css')) return;
    
    console.log('[ClickFeedback] 启用双击接花模式');
    
    // 注入CSS - 双击提示
    const style = document.createElement('style');
    style.id = 'double-tap-catch-css';
    style.textContent = `
      #double-tap-hint {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.7);
        color: #fff;
        padding: 12px 24px;
        border-radius: 20px;
        font-size: 16px;
        z-index: 9999;
        pointer-events: none;
        animation: doubleTapHintFade 3s ease forwards;
      }
      @keyframes doubleTapHintFade {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        85% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // 记录上一次点击的时间和位置
    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;
    const doubleTapDelay = 400; // 双击间隔（毫秒）
    const doubleTapDistance = 80; // 双击最大距离（像素）

    // 监听整个文档的触摸事件
    document.addEventListener('touchend', function(e) {
      const now = Date.now();
      const touch = e.changedTouches[0];
      const x = touch.clientX;
      const y = touch.clientY;

      // 检查是否为双击
      const timeDiff = now - lastTapTime;
      const distDiff = Math.sqrt((x - lastTapX) ** 2 + (y - lastTapY) ** 2);

      if (timeDiff < doubleTapDelay && distDiff < doubleTapDistance) {
        // 双击触发！模拟点击事件在双击位置
        const target = document.elementFromPoint(x, y);
        if (target) {
          // 模拟pointerdown + pointerup事件
          const events = ['pointerdown', 'pointerup', 'click', 'touchstart', 'touchend'];
          events.forEach(eventType => {
            const event = new PointerEvent(eventType, {
              bubbles: true,
              cancelable: true,
              clientX: x,
              clientY: y,
              pointerId: 1,
              pointerType: 'touch',
              isPrimary: true
            });
            target.dispatchEvent(event);
          });
          console.log('[ClickFeedback] 双击接花触发', x, y);
        }
        // 重置
        lastTapTime = 0;
        lastTapX = 0;
        lastTapY = 0;
      } else {
        lastTapTime = now;
        lastTapX = x;
        lastTapY = y;
      }
    }, { passive: true, capture: true });

    // 显示双击提示
    function showDoubleTapHint() {
      const hint = document.createElement('div');
      hint.id = 'double-tap-hint';
      hint.textContent = '👆 双击接花';
      document.body.appendChild(hint);
      setTimeout(() => hint.remove(), 3000);
    }

    // 延迟显示提示
    setTimeout(showDoubleTapHint, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  window.ClickFeedback = {
    refresh: () => {
      addClickFeedbackToButtons();
      addCardClickFeedback();
      addColorButtonFeedback();
      addClickFeedbackToClickableDivs();
    }
  };
  
})();
