const { contextBridge, ipcRenderer } = require('electron');

// 向渲染进程暴露一些安全的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取平台信息
  platform: process.platform,

  // 版本信息
  versions: process.versions,

  // 应用名称
  appName: '苹果的活儿'
});

// 移除不必要的菜单项
window.addEventListener('DOMContentLoaded', () => {
  // 可以在这里添加一些初始化逻辑
});