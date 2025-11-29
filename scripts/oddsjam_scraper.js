/**
 * OddsJam 页面内容脚本
 * 监听用户点击盘口，提取比赛时间并发送消息
 */

console.log('[OddsJam Scraper] 脚本已加载');

/**
 * 提取比赛信息（时间、运动类型、队名）
 * @returns {Object|null} - {time: string, sport: string, team1: string, team2: string} 或 null
 */
function extractMatchInfo() {
    try {
        console.log('[OddsJam Scraper] 开始提取比赛信息...');

        // 运动类型关键词（按长度排序，避免 Basketball 被 Football 误匹配）
        const sportKeywords = [
            'Basketball', 'American Football', 'Volleyball', 'Football',
            'Baseball', 'Cricket', 'Snooker', 'Tennis', 'Hockey',
            'Soccer', 'eSports', 'Boxing', 'Rugby', 'Golf', 'MMA'
        ];

        let foundTime = null;
        let foundSport = null;
        let foundTeam1 = null;
        let foundTeam2 = null;
        let timeElement = null;

        // 方法1: 提取队名（从 h1 或 h2 标签）
        const titleElements = document.querySelectorAll('h1, h2');
        for (const titleEl of titleElements) {
            const titleText = titleEl.textContent.trim();

            // 匹配 "Team1 vs Team2" 格式
            const vsMatch = titleText.match(/^(.+?)\s+vs\s+(.+?)$/i);
            if (vsMatch) {
                foundTeam1 = vsMatch[1].trim();
                foundTeam2 = vsMatch[2].trim();
                console.log('[OddsJam Scraper] 找到队名:', foundTeam1, 'vs', foundTeam2);
                break;
            }
        }

        // 方法2: 在所有元素中查找时间
        const allElements = document.querySelectorAll('*');

        for (const element of allElements) {
            if (foundTime) break;

            const text = element.textContent;
            const timeMatch = text.match(/[A-Za-z]{3},\s+[A-Za-z]{3}\s+\d{1,2}\s+at\s+\d{1,2}:\d{2}\s+[AP]M/);

            if (timeMatch && element.children.length === 0) {
                foundTime = timeMatch[0];
                timeElement = element;
                console.log('[OddsJam Scraper] 找到时间:', foundTime, '元素:', element);
                break;
            }
        }


        // 方法3: 在时间元素附近查找运动类型和联赛
        let foundLeague = null;

        if (timeElement) {
            // 向上查找最多5层父元素
            let searchScope = timeElement;
            for (let i = 0; i < 5; i++) {
                if (searchScope.parentElement) {
                    searchScope = searchScope.parentElement;
                } else {
                    break;
                }
            }

            console.log('[OddsJam Scraper] 在此范围搜索运动类型和联赛:', searchScope);

            // 在范围内查找运动类型和联赛
            const scopeElements = searchScope.querySelectorAll('*');

            // 常见联赛关键词
            const leagueKeywords = [
                'NBA', 'NFL', 'WNBA', 'MLB', 'NHL', 'MLS', 'NCAA',
                'Premier League', 'Champions League', 'La Liga', 'Serie A', 'Bundesliga',
                'Ligue 1', 'UEFA', 'EPL', 'FA Cup', 'EFL', 'Championship',
                'ATP', 'WTA', 'Grand Slam', 'Davis Cup', 'BJK Cup',
                'Euroleague', 'EuroBasket', 'FIBA', 'ACB'
            ];

            for (const element of scopeElements) {
                // 只看短文本的叶子节点
                if (element.children.length > 0) continue;

                const trimmedText = element.textContent.trim();
                if (trimmedText.length > 50) continue;

                // 查找运动类型
                if (!foundSport) {
                    for (const keyword of sportKeywords) {
                        if (trimmedText === keyword ||
                            trimmedText.toLowerCase() === keyword.toLowerCase() ||
                            (trimmedText.length < 20 && trimmedText.toLowerCase().includes(keyword.toLowerCase()))) {
                            foundSport = keyword;
                            console.log('[OddsJam Scraper] 找到运动类型:', foundSport, '文本:', trimmedText);
                            break;
                        }
                    }
                }

                // 查找联赛
                if (!foundLeague) {
                    for (const league of leagueKeywords) {
                        if (trimmedText === league || trimmedText.toLowerCase() === league.toLowerCase()) {
                            foundLeague = league;
                            console.log('[OddsJam Scraper] 找到联赛:', foundLeague, '文本:', trimmedText);
                            break;
                        }
                    }
                }

                if (foundSport && foundLeague) break;
            }
        }

        // 方法4: 如果方法3失败，全局精确匹配运动类型
        if (foundTime && !foundSport) {
            console.log('[OddsJam Scraper] 方法3未找到运动类型，尝试全局精确匹配...');

            for (const element of allElements) {
                if (foundSport) break;

                if (element.children.length > 0) continue;

                const trimmedText = element.textContent.trim();

                // 只匹配精确文本（避免误匹配）
                for (const keyword of sportKeywords) {
                    if (trimmedText === keyword || trimmedText.toLowerCase() === keyword.toLowerCase()) {
                        foundSport = keyword;
                        console.log('[OddsJam Scraper] 全局精确匹配到运动类型:', foundSport);
                        break;
                    }
                }
            }
        }

        if (foundTime) {
            const result = {
                time: foundTime,
                sport: foundSport || 'Unknown',
                team1: foundTeam1 || 'Unknown',
                team2: foundTeam2 || 'Unknown',
                league: foundLeague || 'Unknown'
            };
            console.log('[OddsJam Scraper] 提取成功:', result);
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

        if (!matchInfo) {
            console.error('[OddsJam Scraper] 未能提取比赛信息');
            return;
        }

        console.log('[OddsJam Scraper] 比赛信息:', matchInfo);

        // 检查Chrome API是否可用
        if (typeof chrome === 'undefined' || !chrome.runtime) {
            console.error('[OddsJam Scraper] Chrome扩展API不可用，请刷新扩展');
            alert('扩展需要重新加载！请到 chrome://extensions/ 刷新扩展后重试');
            return;
        }

        // 发送消息到 background script
        const message = {
            type: 'ODDSJAM_CLICK',
            matchTime: matchInfo.time,
            sportType: matchInfo.sport,
            team1: matchInfo.team1,
            team2: matchInfo.team2,
            league: matchInfo.league,
            timestamp: new Date().toISOString()
        };

        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                console.error('[OddsJam Scraper] 消息发送失败:', chrome.runtime.lastError.message);
            } else {
                console.log('[OddsJam Scraper] 消息已发送，响应:', response);
            }
        });
    }
}, true); // 使用捕获阶段

// 监听来自background的消息
if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'PING') {
            sendResponse({ status: 'active' });
        }
        return true;
    });
}

console.log('[OddsJam Scraper] 事件监听器已设置');
