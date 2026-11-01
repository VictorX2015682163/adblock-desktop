const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const os = require('os');

let mainWindow;
let isBlocking = false;
let blockedCount = 0;

// 广告域名列表
const adDomains = [
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.com',
  'connect.facebook.net',
  'ad.doubleclick.net',
  'static.doubleclick.net',
  'pagead2.googlesyndication.com',
  'adservice.google.com',
  'ads.youtube.com'
];

// 获取hosts文件路径
function getHostsPath() {
  return os.platform() === 'win32'
    ? 'C:\\Windows\\System32\\drivers\\etc\\hosts'
    : '/etc/hosts';
}

// 启动时检测hosts文件的实际状态
function syncBlockingState() {
  try {
    const hostsPath = getHostsPath();
    if (fs.existsSync(hostsPath)) {
      const content = fs.readFileSync(hostsPath, 'utf8');
      if (content.includes('# AD-BLOCKER-START')) {
        isBlocking = true;
        blockedCount = adDomains.length * 2;
      }
    }
  } catch (e) {
    // 读取失败则保持默认值
  }
}

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false
    },
    resizable: false,
    title: '广告屏蔽助手'
  });

  mainWindow.loadFile('src/index.html');
}

// 启用广告屏蔽
async function enableBlocking() {
  const hostsPath = getHostsPath();

  try {
    let hostsContent = '';

    if (fs.existsSync(hostsPath)) {
      hostsContent = fs.readFileSync(hostsPath, 'utf8');
    }

    // 检查是否已经添加过
    if (hostsContent.includes('# AD-BLOCKER-START')) {
      isBlocking = true;
      blockedCount = adDomains.length * 2;
      return { success: true, message: '广告屏蔽已启用' };
    }

    // 添加屏蔽规则
    let blockRules = '\n# AD-BLOCKER-START\n';
    adDomains.forEach(domain => {
      blockRules += `127.0.0.1 ${domain}\n`;
      blockRules += `127.0.0.1 www.${domain}\n`;
    });
    blockRules += '# AD-BLOCKER-END\n';

    hostsContent += blockRules;

    // 写入hosts文件（需要管理员权限）
    if (os.platform() === 'darwin' || os.platform() === 'linux') {
      const tempFile = path.join(os.tmpdir(), 'hosts_temp');
      fs.writeFileSync(tempFile, hostsContent);

      return new Promise((resolve) => {
        exec(`osascript -e 'do shell script "cp ${tempFile} ${hostsPath}" with administrator privileges'`, (error) => {
          if (error) {
            resolve({ success: false, message: '需要管理员权限' });
          } else {
            isBlocking = true;
            blockedCount = adDomains.length * 2;
            resolve({ success: true, message: '广告屏蔽已启用' });
          }
        });
      });
    } else {
      // Windows
      fs.writeFileSync(hostsPath, hostsContent);
      isBlocking = true;
      blockedCount = adDomains.length * 2;
      return { success: true, message: '广告屏蔽已启用' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// 禁用广告屏蔽
async function disableBlocking() {
  const hostsPath = getHostsPath();

  try {
    if (!fs.existsSync(hostsPath)) {
      return { success: true, message: '广告屏蔽已禁用' };
    }

    let hostsContent = fs.readFileSync(hostsPath, 'utf8');

    // 移除屏蔽规则
    const startMarker = '# AD-BLOCKER-START';
    const endMarker = '# AD-BLOCKER-END';

    const startIndex = hostsContent.indexOf(startMarker);
    const endIndex = hostsContent.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
      isBlocking = false;
      blockedCount = 0;
      return { success: true, message: '广告屏蔽已禁用' };
    }

    hostsContent = hostsContent.substring(0, startIndex) +
                   hostsContent.substring(endIndex + endMarker.length);

    // 写入hosts文件
    if (os.platform() === 'darwin' || os.platform() === 'linux') {
      const tempFile = path.join(os.tmpdir(), 'hosts_temp');
      fs.writeFileSync(tempFile, hostsContent);

      return new Promise((resolve) => {
        exec(`osascript -e 'do shell script "cp ${tempFile} ${hostsPath}" with administrator privileges'`, (error) => {
          if (error) {
            resolve({ success: false, message: '需要管理员权限' });
          } else {
            isBlocking = false;
            blockedCount = 0;
            resolve({ success: true, message: '广告屏蔽已禁用' });
          }
        });
      });
    } else {
      fs.writeFileSync(hostsPath, hostsContent);
      isBlocking = false;
      blockedCount = 0;
      return { success: true, message: '广告屏蔽已禁用' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// IPC 通信
ipcMain.handle('get-status', () => {
  return { isBlocking, blockedCount };
});

ipcMain.handle('toggle-blocking', async () => {
  if (isBlocking) {
    return await disableBlocking();
  } else {
    return await enableBlocking();
  }
});

// 应用启动
app.whenReady().then(() => {
  syncBlockingState();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
