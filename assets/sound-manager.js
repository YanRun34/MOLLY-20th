/**
 * MOLLY 20周年 H5 音效管理系统
 * 为每一次交互提供合适的音效反馈
 */

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.7;
    this.initialized = false;
    
    // 音效映射配置
    this.soundMap = {
      // 基础交互音效
      'tap': './assets/sfx/sfx-tap.mp3',           // 点击/轻触
      'collect': './assets/sfx/sfx-collect.mp3',   // 收集/获得
      'success': './assets/sfx/sfx-success.mp3',   // 成功/完成
      'complete': './assets/sfx/sfx-complete.mp3', // 关卡完成
      'thunder': './assets/sfx/sfx-thunder.mp3',   // 雷声/特殊事件
    };
    
    // 交互场景音效映射
    this.interactionSounds = {
      // 首页
      'start-journey': 'success',      // 开启旅程
      'mute-toggle': 'tap',            // 静音切换
      
      // 第一站：找回丢失的颜色
      'color-collect': 'collect',      // 收集颜色
      'color-complete': 'complete',    // 颜色关卡完成
      
      // 第二站：情绪选择
      'emotion-select': 'tap',         // 选择情绪
      'emotion-confirm': 'success',    // 确认情绪
      
      // 第三站：世界探索
      'world-enter': 'success',        // 进入世界
      'world-explore': 'tap',          // 探索世界
      
      // 结果页
      'poster-generate': 'complete',   // 生成海报
      'poster-save': 'success',        // 保存海报
      'share': 'collect',              // 分享
      'replay': 'tap',                 // 再玩一次
    };
  }
  
  // 初始化音效系统
  init() {
    if (this.initialized) return;
    
    Object.keys(this.soundMap).forEach(key => {
      const audio = new Audio(this.soundMap[key]);
      audio.preload = 'auto';
      audio.volume = this.volume;
      this.sounds[key] = audio;
    });
    
    this.initialized = true;
    console.log('[SoundManager] 音效系统已初始化');
  }
  
  // 播放指定音效
  play(soundName) {
    if (!this.enabled || !this.initialized) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      // 克隆音频对象以支持快速连续播放
      const clone = sound.cloneNode();
      clone.volume = this.volume;
      clone.play().catch(e => {
        // 自动播放策略可能会阻止播放，这是正常的
        console.log('[SoundManager] 播放被阻止:', e.message);
      });
    }
  }
  
  // 根据交互类型播放对应音效
  playForInteraction(interactionType) {
    const soundName = this.interactionSounds[interactionType];
    if (soundName) {
      this.play(soundName);
    }
  }
  
  // 设置音量
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }
  
  // 开启/关闭音效
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
  
  // 静音
  mute() {
    this.enabled = false;
  }
  
  // 取消静音
  unmute() {
    this.enabled = true;
  }
}

// 创建全局音效管理器实例
const soundManager = new SoundManager();

// 导出供其他模块使用
window.soundManager = soundManager;

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => {
  soundManager.init();
});

// 用户首次交互时初始化（解决自动播放策略限制）
document.addEventListener('click', () => {
  if (!soundManager.initialized) {
    soundManager.init();
  }
}, { once: true });

document.addEventListener('touchstart', () => {
  if (!soundManager.initialized) {
    soundManager.init();
  }
}, { once: true });

console.log('[SoundManager] 音效管理模块已加载');
