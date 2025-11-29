/**
 * OddsJam 页面内容脚本
 * 监听用户点击盘口，提取比赛时间并发送消息
 */

console.log('[OddsJam Scraper] 脚本已加载');

/**
 * 提取比赛时间信息
 * @returns {string|null} - 比赛时间字符串
 */
function extractMatchTime() {
    try {
        // 查找包含时间信息的元素
        // 根据截图，时间显示在比赛标题附近，格式如 "Sat, Nov 29 at 4:00 AM"

        // 方法1: 通过页面标题区域查找
        const titleSection = document.querySelector('h1, h2, [class*="title"], [class*="header"]');
        if (titleSection) {
            const timeElement = titleSection.parentElement?.querySelector('[class*="time"], [class*="date"]');
            if (timeElement) {
                return timeElement.textContent.trim();
            }

            // 尝试在标题同级元素中查找
            const siblings = Array.from(titleSection.parentElement?.children || []);
            for (const sibling of siblings) {
                const text = sibling.textContent;
                // 匹配时间格式: "Day, Mon DD at HH:MM AM/PM"
                const timeMatch = text.match(/[A-Za-z]{3},\s+[A-Za-z]{3}\s+\d{1,2}\s+at\s+\d{1,2}:\d{2}\s+[AP]M/);
                if (timeMatch) {
                    return timeMatch[0];
                }
            }
        }

        // 方法2: 全局搜索时间格式
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
            const text = element.textContent;
            const timeMatch = text.match(/[A-Za-z]{3},\s+[A-Za-z]{3}\s+\d{1,2}\s+at\s+\d{1,2}:\d{2}\s+[AP]M/);
            if (timeMatch && element.children.length === 0) { // 确保是叶子节点
                return timeMatch[0];
            }
        }

        console.warn('[OddsJam Scraper] 未找到比赛时间');
        return null;
    } catch (error) {
        console.error('[OddsJam Scraper] 提取时间失败:', error);
        return null;
    }
}

/**
 * 检查点击的元素是否是盘口方块
 * @param {HTMLElement} element - 被点击的元素
 * @returns {boolean}
 */
function isOddsButton(element) {
    // 调试模式：输出点击的元素信息
    console.log('[OddsJam Scraper] 点击元素:', element.tagName, element.className, element.textContent.substring(0, 50));

    // 限制1: 元素不能太大（排除整个比赛区域的DIV）
    const rect = element.getBoundingClientRect();
    const isTooBig = rect.width > 300 || rect.height > 150;

    if (isTooBig) {
        console.log('[OddsJam Scraper] 元素太大，跳过:', `宽=${Math.round(rect.width)}px, 高=${Math.round(rect.height)}px`);
        return false;
    }

    // 检查元素及其父元素
    let currentElement = element;
    let depth = 0;
    const maxDepth = 5;

    let hasOddsIndicator = false;
    let hasBetButton = false;
    let hasOddsNumber = false;
    let hasGreenBackground = false;

    while (currentElement && depth < maxDepth) {
        // 确保className是字符串
        const className = String(currentElement.className || '').toLowerCase();
        const tagName = currentElement.tagName.toLowerCase();
        const text = currentElement.textContent || '';

        // 条件1: className包含odds相关的词
        if (className.includes('odd') || className.includes('market') || className.includes('price')) {
            hasOddsIndicator = true;
            console.log('[OddsJam Scraper] 找到odds标志:', className);
        }

        // 条件1.5: 检查是否有绿色背景（OddsJam的盘口特征）
        if (className.includes('brand-green') || className.includes('bg-green')) {
            hasGreenBackground = true;
            console.log('[OddsJam Scraper] 找到绿色背景');
        }

        // 条件2: 必须有BET按钮（放宽限制，depth <= 4）
        const directButton = currentElement.querySelector('button');
        if (directButton && depth <= 4) {
            hasBetButton = true;
            console.log('[OddsJam Scraper] 找到BET按钮');
        } else if (tagName === 'button' && text.includes('BET')) {
            hasBetButton = true;
            console.log('[OddsJam Scraper] 找到BET按钮');
        }

        // 条件3: 包含赔率数字（例如 +286, -150）
        // 但文本不能太长（排除包含整个页面文本的情况）
        if (text.length < 100 && /[+-]\d{2,3}/.test(text)) {
            hasOddsNumber = true;
            console.log('[OddsJam Scraper] 找到赔率数字:', text.match(/[+-]\d{2,3}/));
        }

        currentElement = currentElement.parentElement;
        depth++;
    }

    // 满足以下任一条件即可：
    // 1. 有绿色背景 AND 有赔率数字（最常见的情况）
    // 2. 有BET按钮 AND 有赔率数字
    // 3. 有odds相关class AND 有BET按钮
    const isValid =
        (hasGreenBackground && hasOddsNumber) ||  // 降低要求：绿色+数字即可
        (hasBetButton && hasOddsNumber) ||
        (hasOddsIndicator && hasBetButton);

    console.log('[OddsJam Scraper] 是否是有效点击:', isValid,
        '| 绿色背景:', hasGreenBackground,
        '| odds标志:', hasOddsIndicator,
        '| BET按钮:', hasBetButton,
        '| 赔率数字:', hasOddsNumber);

    return isValid;
}

/**
 * 点击事件处理
 */
document.addEventListener('click', (event) => {
    const target = event.target;

    // 检查是否点击了盘口方块
    if (isOddsButton(target)) {
        console.log('[OddsJam Scraper] 检测到盘口点击');

        // 提取比赛时间
        const matchTime = extractMatchTime();

        if (matchTime) {
            console.log('[OddsJam Scraper] 比赛时间:', matchTime);

            // 发送消息到background.js
            chrome.runtime.sendMessage({
                type: 'ODDSJAM_CLICK',
                matchTime: matchTime,
                timestamp: new Date().toISOString()
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('[OddsJam Scraper] 发送消息失败:', chrome.runtime.lastError);
                } else {
                    console.log('[OddsJam Scraper] 消息已发送，响应:', response);
                }
            });
        } else {
            console.warn('[OddsJam Scraper] 未能提取比赛时间');
        }
    }
}, true); // 使用捕获阶段

// 监听来自background的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PING') {
        sendResponse({ status: 'active' });
    }
    return true;
});

console.log('[OddsJam Scraper] 事件监听器已设置');
