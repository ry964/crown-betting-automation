# 安装和使用指南

## 快速开始

### 第一步：准备扩展文件

确保您已经有完整的 `oddsjam-crown-navigator` 文件夹，包含以下文件：

```
oddsjam-crown-navigator/
├── manifest.json
├── background.js
├── scripts/
│   ├── oddsjam_scraper.js
│   └── crown_executor.js
├── utils/
│   └── time_parser.js
└── README.md
```

### 第二步：加载到Chrome浏览器

1. **打开扩展管理页面**
   - 在Chrome地址栏输入：`chrome://extensions/`
   - 或者点击：菜单 → 更多工具 → 扩展程序

2. **启用开发者模式**
   - 在页面右上角找到"开发者模式"开关
   - 点击开启

3. **加载扩展**
   - 点击左上角的"加载已解压的扩展程序"按钮
   - 选择 `oddsjam-crown-navigator` 文件夹
   - 点击"选择"

4. **确认安装**
   - 扩展图标应该出现在扩展列表中
   - 状态应该显示为"已启用"

### 第三步：开始使用

1. **访问OddsJam**
   - 打开 https://oddsjam.com
   - 找到任意比赛页面

2. **点击盘口**
   - 点击绿色的盘口方块（带有赔率和BET按钮的区域）

3. **自动跳转**
   - 扩展会自动：
     - 提取比赛时间
     - 计算时间分类
     - 跳转到皇冠网站
     - 点击对应的时间分类

## 测试步骤

### 测试1: 检查扩展是否正常加载

1. 打开 `chrome://extensions/`
2. 找到 "OddsJam to Crown Navigator"
3. 确认状态为"已启用"
4. 点击"Service Worker"查看后台日志

### 测试2: 测试OddsJam点击检测

1. 访问OddsJam的比赛页面
2. 按F12打开开发者工具
3. 切换到"控制台"标签
4. 点击任意绿色盘口方块
5. 在控制台中应该看到：
   ```
   [OddsJam Scraper] 检测到盘口点击
   [OddsJam Scraper] 比赛时间: Sat, Nov 29 at 4:00 AM
   ```

### 测试3: 测试自动跳转

1. 确保已打开至少一个皇冠网站标签页
2. 在OddsJam点击盘口
3. 观察是否自动切换到皇冠标签页
4. 观察是否自动点击了对应的时间分类

## 调试技巧

### 查看OddsJam脚本日志

```javascript
// 在OddsJam页面的控制台中查看
// 过滤显示: [OddsJam Scraper]
```

### 查看皇冠脚本日志

```javascript
// 在皇冠页面的控制台中查看
// 过滤显示: [Crown Executor]
```

### 查看后台服务日志

1. 打开 `chrome://extensions/`
2. 找到扩展
3. 点击 "Service Worker"
4. 在打开的开发者工具中查看日志

### 手动测试消息传递

在OddsJam页面的控制台中运行：

```javascript
chrome.runtime.sendMessage({
  type: 'ODDSJAM_CLICK',
  matchTime: 'Sat, Nov 29 at 4:00 AM',
  timestamp: new Date().toISOString()
}, (response) => {
  console.log('响应:', response);
});
```

## 故障排除

### 问题1: 点击后没有任何反应

**检查清单：**
- [ ] 扩展是否已启用？
- [ ] 是否点击了正确的目标（绿色盘口方块）？
- [ ] 控制台是否有错误信息？
- [ ] 尝试刷新页面后重试

### 问题2: 跳转了但没有自动点击

**检查清单：**
- [ ] 皇冠页面是否完全加载？
- [ ] 查看皇冠页面的控制台日志
- [ ] 检查导航栏是否存在
- [ ] 扩展会自动重试3次，等待几秒

### 问题3: 时间分类不正确

**检查清单：**
- [ ] 查看后台日志中的时间计算结果
- [ ] 确认本地时间设置正确
- [ ] 检查比赛时间是否正确提取

## 高级配置

### 修改时间分类规则

编辑 `background.js` 中的 `calculateCategory` 函数：

```javascript
// 修改时间阈值
if (diffHours >= 0 && diffHours <= 24) {
  return 'Soon';  // 可以改为其他小时数
}
```

### 添加新的皇冠域名

1. 编辑 `manifest.json` 的 `host_permissions`：
```json
"host_permissions": [
  "https://*.新域名.com/*"
]
```

2. 编辑 `background.js` 的 `CROWN_DOMAINS` 数组：
```javascript
const CROWN_DOMAINS = [
  '新域名.com'
];
```

### 调整重试次数和延迟

编辑 `scripts/crown_executor.js`：

```javascript
function clickCategory(category, retryCount = 0) {
  const maxRetries = 3;      // 修改重试次数
  const retryDelay = 1000;   // 修改延迟时间(毫秒)
  // ...
}
```

## 下一步

- 在实际环境中测试各种场景
- 根据需要调整时间分类规则
- 添加更多自定义功能
- 向我反馈使用体验和改进建议

## 获取帮助

如果遇到问题，请提供：
1. 扩展版本号
2. Chrome版本
3. 控制台错误日志
4. 问题复现步骤
