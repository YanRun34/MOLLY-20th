/**
 * MOLLY 20周年 H5 UI修复脚本
 * 1. 修复封面图显示问题
 * 2. 在小游戏界面添加返回按钮（正确返回到上一层）
 */

(function() {
  'use strict';
  
  console.log('[UIFixes] UI修复脚本已加载');
  
  // 页面历史栈，用于记录访问路径
  let pageHistory = ['home'];
  let currentPage = 'home';
  
  // ==================== 修复1: 封面图显示 ====================
  
  function fixCoverImage() {
    const possibleSelectors = [
      'img[src*="kv"]',
      'img[src*="cover"]',
      'img[src*="hero"]',
      'img[src*="banner"]',
      'img[alt*="MOLLY"]',
      '.cover img',
      '.hero img',
      '.banner img',
      '.kv img'
    ];
    
    let coverImg = null;
    for (const selector of possibleSelectors) {
      coverImg = document.querySelector(selector);
      if (coverImg) break;
    }
    
    if (!coverImg) {
      const allImages = document.querySelectorAll('img');
      for (const img of allImages) {
        const src = img.src || '';
        const alt = img.alt || '';
        if (src.includes('molly') || alt.includes('MOLLY') || alt.includes('20周年')) {
          coverImg = img;
          break;
        }
      }
    }
    
    if (coverImg) {
      console.log('[UIFixes] 找到封面图元素:', coverImg);
      
      coverImg.onerror = function() {
        console.log('[UIFixes] 封面图加载失败，尝试修复路径');
        const possiblePaths = [
          './assets/worlds/molly-kv.png',
          '/assets/worlds/molly-kv.png',
          'assets/worlds/molly-kv.png',
          './worlds/molly-kv.png',
          '/worlds/molly-kv.png'
        ];
        
        let pathIndex = 0;
        const tryNextPath = () => {
          if (pathIndex < possiblePaths.length) {
            coverImg.src = possiblePaths[pathIndex];
            pathIndex++;
          }
        };
        
        coverImg.onerror = tryNextPath;
        tryNextPath();
      };
      
      if (coverImg.complete && coverImg.naturalWidth === 0) {
        coverImg.onerror();
      }
    } else {
      console.log('[UIFixes] 未找到封面图元素，尝试创建');
      createCoverImage();
    }
  }
  
  function createCoverImage() {
    const root = document.getElementById('root');
    if (!root) return;
    
    const existingCover = document.querySelector('.cover-image, .hero-image, .kv-image');
    if (existingCover) return;
    
    const firstScreen = root.querySelector('div');
    if (firstScreen) {
      const coverImg = document.createElement('img');
      coverImg.src = './assets/worlds/molly-kv.png';
      coverImg.alt = 'MOLLY 20周年';
      coverImg.className = 'cover-image-fixed';
      coverImg.style.cssText = `
        width: 100%;
        max-width: 400px;
        height: auto;
        display: block;
        margin: 20px auto;
        object-fit: contain;
      `;
      
      coverImg.onerror = function() {
        this.src = '/assets/worlds/molly-kv.png';
      };
      
      const titleElement = firstScreen.querySelector('h1, h2, .title');
      if (titleElement && titleElement.nextSibling) {
        titleElement.parentNode.insertBefore(coverImg, titleElement.nextSibling);
      } else {
        firstScreen.appendChild(coverImg);
      }
      
      console.log('[UIFixes] 已创建封面图元素');
    }
  }
  
  // ==================== 修复2: 添加返回按钮 ====================
  
  function addBackButton() {
    if (document.querySelector('.back-button')) return;
    
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = '← 返回';
    backButton.style.cssText = `
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 9999;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 20px;
      font-size: 14px;
      color: #333;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      display: none;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
    `;
    
    backButton.addEventListener('mouseenter', () => {
      backButton.style.background = 'rgba(255, 255, 255, 1)';
      backButton.style.transform = 'scale(1.05)';
    });
    
    backButton.addEventListener('mouseleave', () => {
      backButton.style.background = 'rgba(255, 255, 255, 0.9)';
      backButton.style.transform = 'scale(1)';
    });
    
    backButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (window.soundManager) {
        window.soundManager.play('tap');
      }
      
      handleBackNavigation();
    });
    
    document.body.appendChild(backButton);
    console.log('[UIFixes] 返回按钮已创建');
    
    observeForBackButton(backButton);
  }
  
  // 获取当前应用状态
  function getCurrentAppState() {
    const bodyText = document.body.textContent || '';
    
    // 检查是否在小游戏弹窗内
    const hasGameModal = document.querySelector('[class*="game-modal"]') || 
                         document.querySelector('[class*="mini-game"]') ||
                         (bodyText.includes('小游戏') && bodyText.includes('关闭')) ||
                         (bodyText.includes('森林寻宝') || bodyText.includes('看见我了么'));
    
    if (hasGameModal) {
      return 'game';
    }
    
    if (bodyText.includes('第二站') || bodyText.includes('选择情绪') || bodyText.includes('情绪卡片')) {
      return 'station2';
    }
    
    if (bodyText.includes('第三站') || bodyText.includes('MOLLY的') || bodyText.includes('成长旅程')) {
      return 'station3';
    }
    
    if (bodyText.includes('第一站') || bodyText.includes('找回丢失的颜色')) {
      return 'station1';
    }
    
    if (bodyText.includes('开启旅程') || bodyText.includes('20年后')) {
      return 'home';
    }
    
    return currentPage;
  }
  
  // 处理返回导航 - 返回到上一层
  function handleBackNavigation() {
    const currentState = getCurrentAppState();
    console.log('[UIFixes] 当前状态:', currentState, '历史:', pageHistory);
    
    // 如果在小游戏内，关闭游戏弹窗
    if (currentState === 'game') {
      closeGameModal();
      // 从历史中移除游戏状态
      if (pageHistory[pageHistory.length - 1] === 'game') {
        pageHistory.pop();
        currentPage = pageHistory[pageHistory.length - 1] || 'station3';
      }
      return;
    }
    
    // 根据当前状态决定返回到哪里
    switch(currentState) {
      case 'station1':
        // 从第一站返回首页
        goToHome();
        break;
      case 'station2':
        // 从第二站返回第一站
        goToStation1();
        break;
      case 'station3':
        // 从第三站返回第二站
        goToStation2();
        break;
      default:
        // 默认返回首页
        goToHome();
        break;
    }
  }
  
  // 返回首页
  function goToHome() {
    console.log('[UIFixes] 返回首页');
    
    // 查找并点击"返回"或"首页"按钮（如果有的话）
    const allButtons = document.querySelectorAll('button');
    for (const btn of allButtons) {
      const text = btn.textContent || '';
      // 排除我们自己的返回按钮
      if (btn.classList.contains('back-button')) continue;
      
      if (text.includes('返回') || text.includes('首页') || text.includes('Home')) {
        console.log('[UIFixes] 找到页面返回按钮，点击');
        btn.click();
        return;
      }
    }
    
    // 如果没有找到返回按钮，尝试通过刷新页面回到首页
    // 但保留URL参数或hash
    console.log('[UIFixes] 刷新页面回到首页');
    window.location.href = window.location.pathname;
  }
  
  // 返回第一站
  function goToStation1() {
    console.log('[UIFixes] 返回第一站');
    // 查找返回按钮或触发返回逻辑
    const backBtn = findNativeBackButton();
    if (backBtn) {
      backBtn.click();
    } else {
      goToHome();
    }
  }
  
  // 返回第二站
  function goToStation2() {
    console.log('[UIFixes] 返回第二站');
    const backBtn = findNativeBackButton();
    if (backBtn) {
      backBtn.click();
    } else {
      goToHome();
    }
  }
  
  // 查找原生的返回按钮
  function findNativeBackButton() {
    const allButtons = document.querySelectorAll('button');
    
    for (const btn of allButtons) {
      const text = btn.textContent || '';
      
      // 排除我们自己的返回按钮
      if (btn.classList.contains('back-button')) continue;
      
      // 查找返回按钮
      if (text.includes('返回') && text !== '← 返回') {
        return btn;
      }
      
      // 查找有返回图标的按钮
      const svg = btn.querySelector('svg');
      if (svg) {
        const svgHtml = svg.innerHTML || '';
        if (svgHtml.includes('arrow') || svgHtml.includes('back') || svgHtml.includes('chevron-left')) {
          return btn;
        }
      }
    }
    
    return null;
  }
  
  // 关闭游戏弹窗
  function closeGameModal() {
    console.log('[UIFixes] 关闭游戏弹窗');
    
    // 方法1: 查找关闭按钮（通过class或文字）
    const allButtons = document.querySelectorAll('button');
    for (const btn of allButtons) {
      const text = btn.textContent || '';
      const className = btn.className || '';
      
      if (text === '关闭' || text.includes('✕') || text.includes('×') || 
          className.includes('close') || className.includes('Close')) {
        console.log('[UIFixes] 找到关闭按钮，点击');
        btn.click();
        return;
      }
    }
    
    // 方法2: 触发 ESC 键
    console.log('[UIFixes] 触发 ESC 键关闭弹窗');
    const escEvent = new KeyboardEvent('keydown', { 
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      which: 27,
      bubbles: true
    });
    document.dispatchEvent(escEvent);
  }
  
  // 监听页面变化，控制返回按钮显示，并记录历史
  function observeForBackButton(backButton) {
    let lastState = null;
    
    const observer = new MutationObserver(() => {
      const state = getCurrentAppState();
      
      // 状态变化时记录历史
      if (state !== lastState && state !== 'unknown') {
        console.log('[UIFixes] 页面状态变化:', lastState, '->', state);
        
        if (lastState && state !== lastState) {
          // 如果是新页面，添加到历史
          if (pageHistory[pageHistory.length - 1] !== state) {
            pageHistory.push(state);
          }
        }
        
        currentPage = state;
        lastState = state;
      }
      
      // 在非首页显示返回按钮
      if (state !== 'home' && state !== 'unknown') {
        backButton.style.display = 'flex';
      } else {
        backButton.style.display = 'none';
        // 重置历史
        pageHistory = ['home'];
        currentPage = 'home';
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  
  // ==================== 修复1.5: 封面图手机端适配 ====================

  function fixCoverImageMobile() {
    // 查找封面图
    const coverImg = document.querySelector('img[alt*="MOLLY"], img[alt*="20周年"]');
    if (!coverImg) return;

    // 注入封面图适配CSS
    if (!document.getElementById('cover-mobile-css')) {
      const style = document.createElement('style');
      style.id = 'cover-mobile-css';
      style.textContent = `
        /* 封面图手机端完整显示 */
        img[alt*="MOLLY"], img[alt*="20周年"] {
          object-fit: contain !important;
          object-position: top center !important;
          width: 100% !important;
          height: auto !important;
          max-height: 100% !important;
          position: relative !important;
          inset: auto !important;
        }

        /* 封面容器适配 - 让容器高度自适应图片 */
        img[alt*="MOLLY"] ~ *,
        img[alt*="20周年"] ~ * {
          position: relative !important;
        }
      `;
      document.head.appendChild(style);
    }

    // 直接修改图片样式
    coverImg.style.objectFit = 'contain';
    coverImg.style.objectPosition = 'top center';
    coverImg.style.position = 'relative';
    coverImg.style.width = '100%';
    coverImg.style.height = 'auto';
    coverImg.style.maxHeight = '100vh';
    coverImg.style.inset = 'auto';

    console.log('[UIFixes] 封面图手机端适配已应用');
  }

  // ==================== 初始化 ====================
  
  function init() {
    console.log('[UIFixes] 开始初始化UI修复');
    
    setTimeout(() => {
      fixCoverImage();
      fixCoverImageMobile();
      addBackButton();
    }, 1000);
    
    setTimeout(() => {
      fixCoverImage();
      fixCoverImageMobile();
    }, 2000);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  window.UIFixes = {
    fixCoverImage,
    addBackButton,
    getCurrentAppState,
    pageHistory: () => pageHistory,
    currentPage: () => currentPage,
    goToHome,
    goToStation1,
    goToStation2
  };
  
})();
