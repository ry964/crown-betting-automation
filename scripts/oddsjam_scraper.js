/**
 * OddsJam 页面内容脚本
 * 监听用户点击盘口，提取比赛时间并发送消息
 */

console.log('[OddsJam Scraper] 脚本已加载');

/**
 * 提取比赛信息（时间和运动类型）
 * @returns {Object|null} - {time: string, sport: string} 或 null
 */
function extractMatchInfo() {
    try {
        console.log('[OddsJam Scraper] 开始提取比赛信息...');

        // 查找包含时间和运动信息的元素
        // 格式：队名 + 时间 + 运动类型
        // 例如："Aston Villa FC vs Wolverhampton Wanderers FC"
        //       "Sun, Nov 30 at 10:05 PM"
        //       "Soccer"

        // 方法1: 通过页面标题区域查找
        const titleSection = document.querySelector('h1, h2, [class*="title"], [class*="header"]');
        if (titleSection) {
            const container = titleSection.parentElement;
            const allText = container?.textContent || '';

            // 提取时间
            const timeMatch = allText.match(/[A-Za-z]{3},\s+[A-Za-z]{3}\s+\d{1,2}\s+at\s+\d{1,2}:\d{2}\s+[AP]M/);

            // 提取运动类型（在时间之后的单独文本）
            const sportKeywords = ['Soccer', 'Basketball', 'Football', 'Tennis', 'Baseball',
                'Hockey', 'Volleyball', 'MMA', 'Boxing', 'eSports',
                'Snooker', 'Cricket', 'Rugby', 'Golf'];

            let sportType = null;
            for (const keyword of sportKeywords) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                if (regex.test(allText)) {
                    sportType = keyword;
                    break;
                }
            }

            if (timeMatch) {
                const result = {
                    time: timeMatch[0],
                    sport: sportType || 'Unknown'
                };
                console.log('[OddsJam Scraper] 提取成功:', result);
                return result;
            }
        }

        // 方法2: 全局搜索时间格式
        const allElements = document.querySelectorAll('*');
        let foundTime = null;
        let foundSport = null;

        for (const element of allElements) {
            const text = element.textContent;

            // 查找时间
            if (!foundTime) {
                const timeMatch = text.match(/[A-Za-z]{3},\s+[A-Za-z]{3}\s+\d{1,2}\s+at\s+\d{1,2}:\d{2}\s+[AP]M/);
                if (timeMatch && element.children.length === 0) {
                    foundTime = timeMatch[0];
                }
            }

            // 查找运动类型（短文本，包含运动关键词）
            if (!foundSport && element.children.length === 0) {
                const trimmedText = text.trim();
                const sportKeywords = ['Soccer', 'Basketball', 'Football', 'Tennis', 'Baseball',
                    'Hockey', 'Volleyball', 'MMA', 'Boxing', 'eSports',
                    'Snooker', 'Cricket', 'Rugby', 'Golf'];

                for (const keyword of sportKeywords) {
                    if (trimmedText === keyword || trimmedText.toLowerCase() === keyword.toLowerCase()) {
                        foundSport = keyword;
                        break;
                    }
                }
            }

            if (foundTime && foundSport) break;
        }

        if (foundTime) {
            const result = {
                time: foundTime,
                sport: foundSport || 'Unknown'
            };
            console.log('[OddsJam Scraper] 提取成功 (方法2):', result);
            return result;
        }

        console.warn('[OddsJam Scraper] 未找到比赛信息');
        return null;
    } catch (error) {
        console.error('[OddsJam Scraper] 提取信息失败:', error);
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

        // 提取比赛信息
        const matchInfo = extractMatchInfo();

        if (matchInfo && matchInfo.time) {
            console.log('[OddsJam Scraper] 比赛信息:', matchInfo);

            // 发送消息到background.js
            chrome.runtime.sendMessage({
                type: 'ODDSJAM_CLICK',
                matchTime: matchInfo.time,
                sportType: matchInfo.sport,
                timestamp: new Date().toISOString()
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('[OddsJam Scraper] 发送消息失败:', chrome.runtime.lastError);
                } else {
                    console.log('[OddsJam Scraper] 消息已发送，响应:', response);
                }
            });
        } else {
            console.warn('[OddsJam Scraper] 未能提取比赛信息');
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
