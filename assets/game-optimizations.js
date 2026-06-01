/**
 * MOLLY 20周年 H5 小游戏优化脚本 v3
 * 1. 红顶小屋：不修改窗户原始数字，只增强交互效果（悬停放大+发光）
 * 2. 花花世界：放慢花瓣飘落速度，增大花瓣和点击区域
 * 3. 返回按钮：移到左下角，避免与右上角静音按钮重叠
 * 4. 小游戏返回逻辑：关闭弹窗返回成长旅程界面
 */

(function() {
  'use strict';

  console.log('[GameOptimizations] 小游戏优化脚本v3已加载');

  // ==================== 修复0: 返回按钮位置调整 ====================

  function fixBackButtonPosition() {
    const backButton = document.querySelector('.back-button');
    if (!backButton) return;

    // 将返回按钮固定在左上角，与右上角静音按钮分开
    backButton.style.top = '16px';
    backButton.style.bottom = 'auto';
    backButton.style.left = '16px';
    backButton.style.right = 'auto';
    backButton.style.display = 'flex'; // 确保按钮可见
    console.log('[GameOptimizations] 返回按钮位置已调整到左上角');
  }

  // ==================== 优化1: 红顶小屋 - 保留原始数字，增强交互 ====================

  function optimizeHouseGame() {
    const bodyText = document.body.textContent || '';
    if (!bodyText.includes('点亮小屋') && !bodyText.includes('按 3→1→4→2')) {
      return;
    }

    console.log('[GameOptimizations] 检测到红顶小屋游戏，开始优化');

    // 查找游戏弹窗容器
    let gameContainer = document.querySelector('div[class*="fixed"][class*="inset"]') ||
                        document.querySelector('[class*="game-modal"]') ||
                        document.querySelector('[class*="mini-game"]');

    if (!gameContainer) {
      const headings = document.querySelectorAll('h3');
      for (const h of headings) {
        if (h.textContent.includes('点亮小屋')) {
          let container = h.closest('div') || h.parentElement;
          while (container && container !== document.body) {
            if (container.querySelector('button')) break;
            container = container.parentElement;
          }
          if (container) {
            gameContainer = container;
            break;
          }
        }
      }
    }
    if (!gameContainer) return;

    // 查找所有窗户按钮（排除关闭按钮和返回按钮）
    const allButtons = gameContainer.querySelectorAll('button');
    const windowButtons = Array.from(allButtons).filter(btn => {
      const text = (btn.textContent || '').trim();
      return text !== '关闭' && !text.includes('✕') && !text.includes('×') &&
             !btn.classList.contains('back-button') && !btn.classList.contains('game-hint');
    });

    console.log('[GameOptimizations] 窗户按钮数量:', windowButtons.length);

    // 只取前4个窗户按钮（排除多余的按钮）
    const targetWindows = windowButtons.slice(0, 4);

    targetWindows.forEach((win) => {
      if (win.dataset.houseOptimized) return;
      win.dataset.houseOptimized = 'true';

      // 不添加数字标签，保持原始外观

      // 确保窗户有相对定位
      const computedPos = getComputedStyle(win).position;
      if (computedPos === 'static') {
        win.style.position = 'relative';
      }

      // 增强交互效果
      win.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
      win.style.cursor = 'pointer';

      win.addEventListener('mouseenter', () => {
        win.style.transform = 'scale(1.15)';
        win.style.boxShadow = '0 4px 16px rgba(255,200,50,0.5)';
        win.style.zIndex = '10';
      });

      win.addEventListener('mouseleave', () => {
        win.style.transform = 'scale(1)';
        win.style.boxShadow = 'none';
        win.style.zIndex = '';
      });
    });

    // 修改提示文字：只修改直接包含提示文字的叶子节点，不破坏父容器
    const allElements = document.querySelectorAll('p, span, div');
    allElements.forEach(el => {
      // 只处理没有子元素的叶子节点，避免误删父容器内容
      if (el.children.length > 0) return;
      if (el.textContent.includes('按 3→1→4→2') || el.textContent.includes('顺序点击窗户')) {
        el.textContent = '自己找顺序把全部窗户点亮';
      }
    });

    console.log('[GameOptimizations] 红顶小屋窗户交互已增强（无数字标签）');
  }

  // ==================== 优化2: 花花世界 - 放慢花瓣、增大花瓣、优化点击 ====================

  function optimizeFlowerGame() {
    const bodyText = document.body.textContent || '';
    if (!bodyText.includes('花花世界') && !bodyText.includes('收集花瓣')) {
      return;
    }

    console.log('[GameOptimizations] 检测到花花世界游戏，开始优化v4');

    // 注入CSS来修改花瓣动画速度和大小
    injectFlowerCSS();

    // 查找游戏容器
    let gameContainer = document.querySelector('div[class*="fixed"][class*="inset"]') ||
                        document.querySelector('[class*="game-modal"]') ||
                        document.querySelector('[class*="mini-game"]');

    if (!gameContainer) {
      const headings = document.querySelectorAll('h3');
      for (const h of headings) {
        if (h.textContent.includes('花花世界') || h.textContent.includes('收集花瓣')) {
          let container = h.closest('div') || h.parentElement;
          while (container && container !== document.body) {
            if (container.querySelector('button')) break;
            container = container.parentElement;
          }
          if (container) {
            gameContainer = container;
            break;
          }
        }
      }
    }
    if (!gameContainer) return;

    // 优化所有可点击元素
    optimizeFlowerClickables(gameContainer);
    
    // 为花瓣添加专门的触摸优化
    optimizeFlowerPetals(gameContainer);

    console.log('[GameOptimizations] 花花世界交互已优化v4');
  }

  // 优化可点击元素
  function optimizeFlowerClickables(gameContainer) {
    const clickables = gameContainer.querySelectorAll('button, svg, [class*="petal"], div[style*="absolute"]');

    clickables.forEach(el => {
      if (el.dataset.flowerOptimized) return;

      const text = (el.textContent || '').trim();
      if (text === '关闭' || text.includes('✕') || text.includes('×') ||
          el.classList.contains('back-button') || el.classList.contains('game-hint')) {
        return;
      }

      // 增大点击热区
      el.style.minWidth = '60px';
      el.style.minHeight = '60px';
      el.style.cursor = 'pointer';
      
      // 确保元素可以被点击
      el.style.pointerEvents = 'auto';
      
      // 添加触摸反馈
      addTouchFeedback(el);

      el.dataset.flowerOptimized = 'true';
    });
  }

  // 专门优化花瓣元素
  function optimizeFlowerPetals(gameContainer) {
    // 查找所有可能是花瓣的元素
    const petals = gameContainer.querySelectorAll('div, span, svg, img');
    
    petals.forEach(petal => {
      if (petal.dataset.petalOptimized) return;
      
      // 检查是否是花瓣（通过样式或类名判断）
      const style = petal.getAttribute('style') || '';
      const className = petal.className || '';
      
      const isPetal = style.includes('animation') || 
                      style.includes('absolute') ||
                      className.includes('petal') ||
                      className.includes('flower') ||
                      petal.tagName === 'SVG' ||
                      petal.tagName === 'IMG';
      
      if (!isPetal) return;
      
      // 排除关闭按钮等
      const text = (petal.textContent || '').trim();
      if (text === '关闭' || text.includes('✕') || text.includes('×')) return;

      petal.dataset.petalOptimized = 'true';
      
      // 设置花瓣样式
      petal.style.pointerEvents = 'auto';
      petal.style.cursor = 'pointer';
      
      // 增大点击区域
      if (petal.style) {
        petal.style.minWidth = petal.style.minWidth || '50px';
        petal.style.minHeight = petal.style.minHeight || '50px';
      }
      
      // 添加点击事件处理
      addPetalClickHandler(petal);
    });
  }

  // 添加触摸反馈
  function addTouchFeedback(el) {
    // 触摸开始
    el.addEventListener('touchstart', (e) => {
      el.style.transform = 'scale(1.3)';
      el.style.filter = 'brightness(1.4) drop-shadow(0 0 15px rgba(255,182,193,1))';
      el.style.zIndex = '1000';
      el.style.transition = 'transform 0.1s ease, filter 0.1s ease';
    }, { passive: true });
    
    // 触摸结束
    el.addEventListener('touchend', () => {
      setTimeout(() => {
        el.style.transform = 'scale(1)';
        el.style.filter = 'none';
        el.style.zIndex = '';
      }, 100);
    }, { passive: true });
    
    // 触摸取消
    el.addEventListener('touchcancel', () => {
      el.style.transform = 'scale(1)';
      el.style.filter = 'none';
      el.style.zIndex = '';
    }, { passive: true });
    
    // 鼠标事件（桌面端）
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.5)';
      el.style.filter = 'brightness(1.3) drop-shadow(0 0 12px rgba(255,182,193,0.9))';
      el.style.zIndex = '100';
      el.style.transition = 'transform 0.15s ease, filter 0.15s ease';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.filter = 'none';
      el.style.zIndex = '';
    });
  }

  // 添加花瓣点击处理器
  function addPetalClickHandler(petal) {
    // 确保花瓣有点击事件
    petal.addEventListener('click', (e) => {
      console.log('[GameOptimizations] 花瓣被点击');
      // 触发原始点击事件
      e.stopPropagation();
    });
    
    // 触摸事件
    petal.addEventListener('touchstart', (e) => {
      petal.style.transform = 'scale(1.2)';
      petal.style.filter = 'brightness(1.2)';
      petal.style.transition = 'transform 0.1s ease';
      
      // 触发点击
      setTimeout(() => {
        petal.click();
      }, 50);
    }, { passive: true });
    
    petal.addEventListener('touchend', () => {
      setTimeout(() => {
        petal.style.transform = 'scale(1)';
        petal.style.filter = 'none';
      }, 100);
    }, { passive: true });
  }

  // 注入花瓣优化CSS
  let flowerCSSInjected = false;
  function injectFlowerCSS() {
    if (flowerCSSInjected) return;
    flowerCSSInjected = true;

    const style = document.createElement('style');
    style.id = 'flower-optimization-css';
    style.textContent = `
      /* 花瓣飘落速度减慢 - 覆盖所有可能的动画 */
      @keyframes fall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: 0.8; }
      }

      @keyframes falling {
        0% { transform: translateY(-10vh) rotate(0deg); }
        100% { transform: translateY(110vh) rotate(360deg); }
      }

      @keyframes drop {
        0% { top: -10%; }
        100% { top: 110%; }
      }

      @keyframes float-down {
        0% { transform: translateY(-100px) rotate(0deg); }
        100% { transform: translateY(calc(100vh + 100px)) rotate(360deg); }
      }

      /* 让所有动画元素变慢 - 花瓣飘落更慢 */
      div[style*="animation"] > div[style*="absolute"],
      div[style*="animation"] > span[style*="absolute"],
      div[style*="animation"] > svg,
      [class*="petal"],
      [class*="flower"] > div,
      [class*="game"] div[style*="absolute"] {
        animation-duration: 10s !important;
        animation-iteration-count: infinite !important;
      }

      /* 花瓣点击区域增大 - 移动端优化 */
      [class*="petal"], [class*="flower"] > div, [class*="game"] div[style*="absolute"] {
        min-width: 60px !important;
        min-height: 60px !important;
        padding: 15px !important;
        margin: 8px !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      /* 花瓣变大 */
      [class*="petal"] svg,
      [class*="petal"] img,
      [class*="flower"] > div > svg,
      [class*="flower"] > div > img {
        width: 56px !important;
        height: 56px !important;
        min-width: 56px !important;
        min-height: 56px !important;
        pointer-events: auto !important;
      }
      
      /* 确保游戏容器内的所有元素都可以被点击 */
      [class*="game-modal"] *,
      [class*="mini-game"] *,
      div[class*="fixed"] * {
        pointer-events: auto !important;
      }
      
      /* 花瓣悬停/触摸效果 */
      [class*="petal"]:active,
      [class*="flower"] > div:active {
        transform: scale(1.2) !important;
        filter: brightness(1.2) !important;
      }
    `;
    document.head.appendChild(style);

    console.log('[GameOptimizations] 花瓣优化CSS已注入v4');
  }

  // ==================== 优化3: 返回逻辑修复 ====================

  function fixBackButtonLogic() {
    const backButton = document.querySelector('.back-button');
    if (!backButton || backButton.dataset.v3fixed) return;

    console.log('[GameOptimizations] 修复返回按钮逻辑v3');

    // 调整位置到左上角，与右上角静音按钮分开
    backButton.style.top = '16px';
    backButton.style.bottom = 'auto';
    backButton.style.left = '16px';
    backButton.style.display = 'flex';

    // 移除旧事件监听器（通过克隆）
    const newBtn = backButton.cloneNode(true);
    backButton.parentNode.replaceChild(newBtn, backButton);

    // 添加新的点击事件
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (window.soundManager) {
        window.soundManager.play('tap');
      }

      handleSmartBackNavigation();
    });

    newBtn.dataset.v3fixed = 'true';
    console.log('[GameOptimizations] 返回按钮点击事件已绑定');
  }

  function handleSmartBackNavigation() {
    const bodyText = document.body.textContent || '';

    // 检查是否在小游戏弹窗内（优先检测）
    // 游戏弹窗特征：有关闭按钮 + 游戏标题 + 进度显示（如 0/4）
    const hasCloseButton = bodyText.includes('关闭');
    const hasProgress = /\d+\s*\/\s*\d+/.test(bodyText);
    
    // 游戏标题列表
    const gameTitles = ['点亮小屋', '收集花瓣', '看见我了么', '森林寻宝', '建造', 
                       '听打雷', '星星', '入睡', '蜂子', '看着我', '国度', 
                       '第一只MOLLY', '长大后的自己', '调色记忆'];
    const hasGameTitle = gameTitles.some(title => bodyText.includes(title));
    
    // 如果同时满足：有关闭按钮 + 有进度显示 + 有游戏标题 = 在游戏内
    if (hasCloseButton && hasProgress && hasGameTitle) {
      console.log('[GameOptimizations] 在小游戏内，关闭弹窗返回成长旅程');
      closeGameModal();
      return;
    }

    // 在成长旅程主页面（不在游戏内），不执行返回
    if (bodyText.includes('MOLLY的') && bodyText.includes('成长旅程') && !hasGameTitle) {
      console.log('[GameOptimizations] 已在成长旅程页面，无需返回');
      return;
    }

    // 其他情况返回首页
    console.log('[GameOptimizations] 返回首页');
    window.location.href = window.location.pathname;
  }

  function closeGameModal() {
    const allButtons = document.querySelectorAll('button');
    for (const btn of allButtons) {
      const text = (btn.textContent || '').trim();
      const cls = btn.className || '';
      if (text === '关闭' || cls.includes('close') || cls.includes('Close')) {
        btn.click();
        return;
      }
    }
  }

  // ==================== 监听页面变化 ====================

  function observePageChanges() {
    const observer = new MutationObserver(() => {
      optimizeHouseGame();
      optimizeFlowerGame();
      fixBackButtonLogic();
      fixBackButtonPosition();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // ==================== 初始化 ====================

  function init() {
    console.log('[GameOptimizations] 初始化小游戏优化v3');

    setTimeout(() => {
      fixBackButtonPosition();
      optimizeHouseGame();
      optimizeFlowerGame();
      fixBackButtonLogic();
      observePageChanges();
    }, 1000);

    setTimeout(() => {
      fixBackButtonPosition();
      optimizeHouseGame();
      optimizeFlowerGame();
    }, 2500);

    setTimeout(() => {
      fixBackButtonPosition();
    }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.GameOptimizations = {
    optimizeHouseGame,
    optimizeFlowerGame,
    fixBackButtonLogic,
    fixBackButtonPosition
  };

})();
