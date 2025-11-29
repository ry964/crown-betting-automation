# 诊断步骤

请帮我检查并发送以下控制台日志：

## 1. OddsJam 页面控制台

点击 Aston Villa 的 Soccer 比赛后，找到这些日志：

```
[OddsJam Scraper] 提取成功: {time: "...", sport: "..."}
```

**请确认**: `sport` 字段显示的是什么？应该是 "Soccer"

## 2. Background Service Worker 控制台

```
[Background] 运动类型: ??? → ???
```

**请确认**: 映射是否正确？应该是 `Soccer → Soccer`

## 3. 皇冠页面控制台

```
[Crown Executor] 接收到点击指令 - 分类: ???, 运动: ???
[Crown Executor] 🔄 开始轮询查找运动图标: ???
```

**请确认**: 
- 收到的运动类型是什么？
- 轮询过程中是否找到了 Soccer？

---

## 可能的原因分析

如果控制台显示：
- ✅ 提取: "Soccer"
- ✅ 映射: "Soccer → Soccer"  
- ❌ 未找到: Soccer 图标

**那说明**：`findSportIcon("Soccer")` 函数没找到 Soccer 图标

### 调试方法

在皇冠页面的控制台手动运行：

```javascript
// 查找所有包含 "soccer" 文本的元素
const elements = Array.from(document.querySelectorAll('*'));
const soccerElements = elements.filter(el => 
    el.textContent.toLowerCase().includes('soccer') && 
    el.textContent.length < 30
);
console.log('找到的 Soccer 元素:', soccerElements);
```

把结果截图或复制给我！
