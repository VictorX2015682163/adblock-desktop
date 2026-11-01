# 广告屏蔽助手 🛡️

一个简洁美观的桌面应用，通过修改系统hosts文件来屏蔽广告域名。

## 功能特点

✅ **系统级屏蔽** - 修改hosts文件，对所有浏览器生效
✅ **可视化界面** - 美观的GUI界面，操作简单
✅ **一键开关** - 快速启用或禁用广告屏蔽
✅ **实时统计** - 显示已屏蔽的广告域名数量
✅ **跨平台** - 支持 macOS、Windows、Linux

## 安装方法

### 方式一：从源码运行（推荐）

1. 确保已安装 Node.js (v16+)

2. 打开终端，进入项目目录：
   ```bash
   cd ~/Desktop/ad-blocker-app
   ```

3. 安装依赖：
   ```bash
   npm install
   ```

4. 启动应用：
   ```bash
   npm start
   ```

### 方式二：打包成独立应用

1. 安装依赖后，运行打包命令：
   ```bash
   npm run build
   ```

2. 打包完成后，在 `dist` 目录找到安装包

## 使用方法

1. **启动应用** - 双击应用图标或运行 `npm start`

2. **启用屏蔽** - 点击"启用屏蔽"按钮
   - macOS: 会弹出管理员密码输入框
   - Windows: 需要以管理员身份运行

3. **查看统计** - 界面显示已屏蔽的广告域名数量

4. **禁用屏蔽** - 点击"禁用屏蔽"按钮恢复正常

## 工作原理

应用通过修改系统的 hosts 文件来屏蔽广告：

- **macOS/Linux**: `/etc/hosts`
- **Windows**: `C:\Windows\System32\drivers\etc\hosts`

将广告域名指向 `127.0.0.1`（本地回环地址），使浏览器无法访问这些广告服务器。

## 屏蔽的广告域名

默认屏蔽以下常见广告域名：

- doubleclick.net (Google 广告)
- googlesyndication.com (Google AdSense)
- googleadservices.com (Google 广告服务)
- google-analytics.com (Google 分析)
- googletagmanager.com (Google 标签管理)
- ads.youtube.com (YouTube 广告)
- 等等...

## 注意事项

⚠️ **管理员权限**
- macOS: 首次使用需要输入管理员密码
- Windows: 需要以管理员身份运行应用

⚠️ **DNS 缓存**
- 启用屏蔽后，可能需要清除浏览器缓存
- macOS: `sudo dscacheutil -flushcache`
- Windows: `ipconfig /flushdns`

⚠️ **备份提醒**
- 应用会自动备份原始 hosts 文件
- 如遇问题，可手动恢复 hosts 文件

## 文件结构

```
ad-blocker-app/
├── package.json          # 项目配置
├── src/
│   ├── main.js          # Electron 主进程
│   ├── index.html       # 界面HTML
│   └── renderer.js      # 渲染进程脚本
└── README.md            # 说明文档
```

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **Node.js** - JavaScript 运行时
- **原生 API** - 文件系统操作

## 常见问题

**Q: 为什么需要管理员权限？**
A: 修改 hosts 文件需要系统管理员权限。

**Q: 会影响正常网站吗？**
A: 不会，只屏蔽已知的广告域名。

**Q: 如何添加自定义屏蔽域名？**
A: 编辑 `src/main.js` 中的 `adDomains` 数组。

**Q: 如何卸载？**
A: 点击"禁用屏蔽"按钮，然后删除应用即可。

## 许可证

MIT License

---

**享受无广告的清爽浏览体验！** 🎉
