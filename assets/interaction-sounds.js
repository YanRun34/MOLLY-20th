/**
 * MOLLY 20周年 H5 交互音效增强脚本
 * 自动为页面上的交互元素添加音效反馈
 */

(function() {
  'use strict';
  
  // 等待音效管理器准备就绪
  function waitForSoundManager(callback) {
    if (window.soundManager) {
      callback();
    } else {
      setTimeout(() => waitForSoundManager(callback), 100);
    }
  }
  
  // 主初始化函数
  function initInteractionSounds() {
    const sm = window.soundManager;
    if (!sm) {
      console.warn('[InteractionSounds] 音效管理器未找到');
      return;
    }
    
    console.log('[InteractionSounds] 初始化交互音效系统');
    
    // ==================== 首页交互音效 ====================
    
    // 监听"开启旅程"按钮
    document.addEventListener('click', (e) => {
      const target = e.target;
      const text = target.textContent || target.innerText || '';
      
      // 开启旅程按钮
      if (text.includes('开启旅程') || target.closest('[class*="start"]') || target.closest('[class*="journey"]')) {
        sm.playForInteraction('start-journey');
        console.log('[InteractionSounds] 播放：开启旅程音效');
        return;
      }
      
      // 静音按钮
      if (text.includes('静音') || text.includes('声音') || target.closest('[class*="mute"]') || target.closest('[class*="sound"]')) {
        sm.playForInteraction('mute-toggle');
        console.log('[InteractionSounds] 播放：静音切换音效');
        return;
      }
    }, true);
    
    // ==================== 第一站：颜色收集音效 ====================
    
    // 监听颜色块点击（黄、蓝、粉）
    const colorMap = {
      '黄色': 'collect',
      '蓝色': 'collect',
      '粉色': 'collect',
      'yellow': 'collect',
      'blue': 'collect',
      'pink': 'collect'
    };
    
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // 检查是否是颜色块
      const isColorBlock = target.closest('[class*="color"]') || 
                           target.closest('[style*="background"]') ||
                           target.closest('button');
      
      if (isColorBlock) {
        const text = target.textContent || '';
        const style = target.getAttribute('style') || '';
        const className = target.className || '';
        
        // 检测颜色
        const isYellow = text.includes('黄') || style.includes('yellow') || style.includes('ffd') || style.includes('ffe');
        const isBlue = text.includes('蓝') || style.includes('blue') || style.includes('87ceeb') || style.includes('b7d7ff');
        const isPink = text.includes('粉') || style.includes('pink') || style.includes('ffb6c1') || style.includes('ffc0cb');
        
        if (isYellow || isBlue || isPink || className.includes('color')) {
          sm.play('collect');
          console.log('[InteractionSounds] 播放：收集颜色音效');
        }
      }
    }, true);
    
    // 监听进度变化 - 当收集完成时播放完成音效
    let lastProgress = 0;
    const progressObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          const progressText = document.body.textContent;
          const match = progressText.match(/已找回颜色[：:]\s*(\d)\s*\/\s*3/);
          if (match) {
            const currentProgress = parseInt(match[1]);
            if (currentProgress === 3 && lastProgress < 3) {
              setTimeout(() => {
                sm.play('complete');
                console.log('[InteractionSounds] 播放：颜色关卡完成音效');
              }, 300);
            }
            lastProgress = currentProgress;
          }
        }
      });
    });
    
    // 开始观察页面变化
    progressObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    // ==================== 通用按钮点击音效 ====================
    
    // 为所有按钮添加点击音效
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // 检查是否是按钮
      const isButton = target.tagName === 'BUTTON' || 
                       target.closest('button') ||
                       target.getAttribute('role') === 'button' ||
                       target.classList.contains('btn') ||
                       target.classList.toString().includes('button');
      
      if (isButton) {
        // 延迟一点播放，避免与特定音效冲突
        setTimeout(() => {
          const text = target.textContent || target.innerText || '';
          
          // 根据按钮文本判断音效类型
          if (text.includes('完成') || text.includes('确认') || text.includes('确定')) {
            sm.play('success');
            console.log('[InteractionSounds] 播放：成功音效');
          } else if (text.includes('下一') || text.includes('继续')) {
            sm.play('tap');
            console.log('[InteractionSounds] 播放：点击音效');
          } else if (text.includes('返回') || text.includes('后退')) {
            sm.play('tap');
            console.log('[InteractionSounds] 播放：点击音效');
          }
        }, 10);
      }
    }, true);
    
    // ==================== 情绪选择音效 ====================
    
    document.addEventListener('click', (e) => {
      const target = e.target;
      const text = target.textContent || '';
      
      // 检测情绪卡片
      const emotions = ['渴望被理解', '理想主义', '怀念童年', '自我保护', '缺乏安全感', '孤独幻想', '渴望治愈', '想回家', '热爱生活'];
      const isEmotionCard = emotions.some(emotion => text.includes(emotion));
      
      if (isEmotionCard || target.closest('[class*="emotion"]') || target.closest('[class*="card"]')) {
        sm.playForInteraction('emotion-select');
        console.log('[InteractionSounds] 播放：选择情绪音效');
      }
    }, true);
    
    // ==================== 世界探索音效 ====================
    
    document.addEventListener('click', (e) => {
      const target = e.target;
      const text = target.textContent || '';
      
      // 检测世界卡片
      const worlds = ['看着我', '花花世界', '童年森林', '我的国度', '一起听打雷', '城堡外的星星', '抱你入睡', '红顶小屋', '我是蜂子'];
      const isWorldCard = worlds.some(world => text.includes(world));
      
      if (isWorldCard || target.closest('[class*="world"]')) {
        sm.playForInteraction('world-enter');
        console.log('[InteractionSounds] 播放：进入世界音效');
      }
    }, true);
    
    // ==================== 结果页音效 ====================
    
    document.addEventListener('click', (e) => {
      const target = e.target;
      const text = target.textContent || '';
      
      // 生成海报
      if (text.includes('生成海报') || text.includes('查看结果') || text.includes('我的海报')) {
        sm.playForInteraction('poster-generate');
        console.log('[InteractionSounds] 播放：生成海报音效');
        return;
      }
      
      // 保存海报
      if (text.includes('保存') || text.includes('下载')) {
        sm.playForInteraction('poster-save');
        console.log('[InteractionSounds] 播放：保存海报音效');
        return;
      }
      
      // 分享
      if (text.includes('分享') || text.includes('转发')) {
        sm.playForInteraction('share');
        console.log('[InteractionSounds] 播放：分享音效');
        return;
      }
      
      // 再玩一次
      if (text.includes('再玩') || text.includes('重来') || text.includes('重新开始')) {
        sm.playForInteraction('replay');
        console.log('[InteractionSounds] 播放：再玩一次音效');
        return;
      }
    }, true);
    
    // ==================== 特殊场景音效 ====================
    
    // 雷声场景
    document.addEventListener('click', (e) => {
      const target = e.target;
      const text = target.textContent || '';
      
      if (text.includes('打雷') || text.includes('雷声') || text.includes('thunder')) {
        sm.play('thunder');
        console.log('[InteractionSounds] 播放：雷声音效');
      }
    }, true);
    
    console.log('[InteractionSounds] 交互音效系统初始化完成');
  }
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      waitForSoundManager(initInteractionSounds);
    });
  } else {
    waitForSoundManager(initInteractionSounds);
  }
  
  // 提供手动触发音效的全局函数
  window.playInteractionSound = function(type) {
    if (window.soundManager) {
      window.soundManager.playForInteraction(type);
    }
  };
  
  window.playSound = function(name) {
    if (window.soundManager) {
      window.soundManager.play(name);
    }
  };
  
})();
