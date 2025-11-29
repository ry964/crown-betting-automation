# OddsJam to Crown Auto-Navigator

一个Chrome浏览器扩展，用于自动从OddsJam网站跳转到皇冠(Crown)网站，并根据比赛时间自动选择相应的时间分类。

## 功能特性

- ✅ 自动检测OddsJam网站上的盘口点击
- ✅ 智能提取比赛开始时间
- ✅ 自动计算时间分类（In-Play/Today/Soon/Early）
- ✅ 自动跳转到皇冠网站
- ✅ 自动点击对应的时间分类标签
- ✅ 支持多个皇冠域名
- ✅ 重试机制保证稳定性

## 安装方法

### 1. 下载扩展文件

将整个 `oddsjam-crown-navigator` 文件夹保存到您的电脑上。

### 2. 在Chrome中加载扩展

1. 打开Chrome浏览器
2. 在地址栏输入 `chrome://extensions/` 并回车
3. 打开右上角的"开发者模式"开关
4. 点击"加载已解压的扩展程序"按钮
5. 选择 `oddsjam-crown-navigator` 文件夹
6. 扩展安装完成！

## 使用方法

1. **在OddsJam网站上**：
   - 访问任意比赛页面（例如：Chicago Bears vs Philadelphia Eagles）
   - 点击任意绿色的盘口方块（包含赔率和BET按钮）

2. **自动执行**：
   - 扩展会自动提取比赛时间
   - 计算时间分类
   - 跳转或激活皇冠网站标签页
   - 自动点击相应的时间分类（In-Play/Today/Soon/Early）

## 时间分类规则

| 时间差 | 分类 | 说明 |
|--------|------|------|
| 已开始（3小时内） | In-Play | 正在进行的比赛 |
| 同一天，未开始 | Today | 今天的比赛 |
| 未来24小时内 | Soon | 即将开始的比赛 |
| 24小时以上 | Early | 未来几天的比赛 |

## 支持的皇冠域名

- www.hga050.com
- www.hga039.com
- www.hga038.com
- www.hga035.com
- www.hga030.com
- www.mos055.com
- www.mos033.com
- www.mos022.com
- www.mos011.com

## 文件结构

```
oddsjam-crown-navigator/
├── manifest.json              # 扩展配置文件
├── background.js              # 后台服务Worker
├── scripts/
│   ├── oddsjam_scraper.js    # OddsJam页面脚本
│   └── crown_executor.js     # 皇冠页面脚本
├── utils/
│   └── time_parser.js        # 时间解析工具
└── README.md                 # 本文件
```

## 调试方法

### 查看日志

1. 打开Chrome开发者工具（F12）
2. 切换到"控制台(Console)"标签
3. 查看带有以下前缀的日志：
   - `[OddsJam Scraper]` - OddsJam页面脚本日志
   - `[Crown Executor]` - 皇冠页面脚本日志
   - `[Background]` - 后台服务日志

### 查看后台日志

1. 访问 `chrome://extensions/`
2. 找到 "OddsJam to Crown Navigator"
3. 点击"Service Worker"链接
4. 在打开的开发者工具中查看日志

## 常见问题

**Q: 点击盘口后没有反应？**
A: 请检查：
- 是否点击的是绿色盘口方块
- 打开控制台查看是否有错误日志
- 确认扩展已正确加载

**Q: 跳转到皇冠后没有自动点击？**
A: 可能原因：
- 页面DOM结构发生变化
- 网络延迟导致页面加载较慢
- 扩展会自动重试3次，请耐心等待

**Q: 如何添加更多皇冠域名？**
A: 编辑 `manifest.json` 和 `background.js`，在相应的域名列表中添加新域名。

## 技术说明

- **Manifest版本**: V3
- **权限**: tabs, activeTab, storage, scripting
- **浏览器**: Chrome 88+
- **架构**: Content Scripts + Background Service Worker

## 许可证

本项目仅供个人学习和研究使用。

## 更新日志

### v1.0.0 (2025-11-28)
- ✨ 初始版本
- ✅ 实现基本的自动跳转功能
- ✅ 实现时间分类自动识别
- ✅ 支持多个皇冠域名
