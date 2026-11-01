const { ipcRenderer } = require('electron');

const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const blockedCount = document.getElementById('blockedCount');
const toggleBtn = document.getElementById('toggleBtn');
const message = document.getElementById('message');

// 更新界面
function updateUI(isBlocking, count) {
  if (isBlocking) {
    statusIcon.textContent = '✅';
    statusText.textContent = '广告屏蔽已启用';
    blockedCount.textContent = count;
    toggleBtn.textContent = '禁用屏蔽';
    toggleBtn.className = 'toggle-button active';
  } else {
    statusIcon.textContent = '❌';
    statusText.textContent = '广告屏蔽已禁用';
    blockedCount.textContent = '0';
    toggleBtn.textContent = '启用屏蔽';
    toggleBtn.className = 'toggle-button inactive';
  }
}

// 加载状态
async function loadStatus() {
  const status = await ipcRenderer.invoke('get-status');
  updateUI(status.isBlocking, status.blockedCount);
}

// 切换屏蔽状态
toggleBtn.addEventListener('click', async () => {
  toggleBtn.disabled = true;
  message.textContent = '处理中...';

  try {
    const result = await ipcRenderer.invoke('toggle-blocking');

    if (result.success) {
      message.textContent = result.message;
      await loadStatus();
    } else {
      message.textContent = '错误: ' + result.message;
    }
  } catch (err) {
    message.textContent = '错误: ' + err.message;
  }

  toggleBtn.disabled = false;
});

// 初始加载
loadStatus();
