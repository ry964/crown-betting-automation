/**
 * 皇冠网站执行脚本
 * 接收指令并点击对应的时间分类
 */

console.log('[Crown Executor] 脚本已加载');

/**
 * 查找导航栏中的时间分类按钮
 * @param {string} category - 时间分类 (In-Play/Today/Soon/Early等)
 * @returns {HTMLElement|null}
 */
/**
 * 查找导航栏中的时间分类按钮
 * @param {string} category - 时间分类 (In-Play/Today/Soon/Early等)
 * @returns {HTMLElement|null}
 */
function findCategoryButton(category) {
    try {
        console.log(`[Crown Executor] 开始查找分类按钮: ${category}`);

        const categoryLower = category.toLowerCase();

        // 定义别名映射
        const categoryAliases = {
            'in-play': ['in-play', 'inplay', 'live', '滚球', '即时'],
            'hot': ['hot', '🔥', '热门'],
            'today': ['today', '今天', '今日'],
            'soon': ['soon', '即将', '早盘'],
            'early': ['early', '早场', '早盘', '未来'],
            'outrights': ['outrights', '冠军', '优胜'],
            'parlay': ['parlay', 'parlays', '串关', '过关']
        };

        const searchTerms = categoryAliases[categoryLower] || [categoryLower];
        console.log(`[Crown Executor] 搜索关键词:`, searchTerms);

        // 方法1: 直接查找所有可见元素，通过文本内容匹配
        const allElements = document.querySelectorAll('*');
        const candidates = [];

        for (const element of allElements) {
            // 跳过不可见元素
            if (element.offsetParent === null) continue;

            // 获取元素的直接文本（不包括子元素）
            const directText = Array.from(element.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .join(' ')
                .toLowerCase();

            // 或者获取完整文本（如果没有太多子元素）
            const fullText = element.textContent.toLowerCase().trim();

            // 只考虑短文本元素（避免大容器）
            if (fullText.length > 30) continue;

            // 检查是否匹配
            for (const term of searchTerms) {
                if (directText === term || fullText === term ||
                    (fullText.length < 15 && fullText.includes(term))) {

                    // 确保元素是可点击的（有href或onclick或cursor pointer）
                    const isClickable =
                        element.tagName === 'A' ||
                        element.tagName === 'BUTTON' ||
                        element.onclick ||
                        element.getAttribute('href') ||
                        window.getComputedStyle(element).cursor === 'pointer';

                    if (isClickable || element.parentElement?.tagName === 'A') {
                        const targetElement = element.parentElement?.tagName === 'A' ? element.parentElement : element;
                        candidates.push({
                            element: targetElement,
                            text: fullText,
                            match: term
                        });
                        console.log(`[Crown Executor] 找到候选: "${fullText}" (匹配: ${term})`, targetElement);
                    }
                }
            }
        }

        // 如果找到候选，选择最佳匹配
        if (candidates.length > 0) {
            // 优先选择精确匹配
            const exactMatch = candidates.find(c =>
                searchTerms.some(term => c.text === term)
            );

            const selected = exactMatch || candidates[0];
            console.log(`[Crown Executor] 选择按钮:`, selected);
            return selected.element;
        }

        // 方法2: 如果方法1失败，尝试查找固定位置的导航栏
        console.log('[Crown Executor] 方法1未找到，尝试查找导航栏...');

        // 查找包含多个关键词的容器（很可能是导航栏）
        for (const element of allElements) {
            const text = element.textContent.toLowerCase();

            // 检查是否包含至少3个导航关键词
            const keywordMatches = [
                text.includes('in-play'),
                text.includes('today'),
                text.includes('early'),
                text.includes('soon'),
                text.includes('parlay')
            ].filter(Boolean).length;

            if (keywordMatches >= 3 && text.length < 300) {
                console.log('[Crown Executor] 找到导航栏容器:', element);

                // 在导航栏中查找匹配的子元素
                const children = element.querySelectorAll('*');
                for (const child of children) {
                    const childText = child.textContent.toLowerCase().trim();
                    if (childText.length < 20) {
                        for (const term of searchTerms) {
                            if (childText === term || childText.includes(term)) {
                                console.log(`[Crown Executor] 在导航栏中找到: "${childText}"`, child);
                                return child.tagName === 'A' ? child : child.closest('a, button, [onclick]');
                            }
                        }
                    }
                }
            }
        }

        console.warn('[Crown Executor] 所有方法都未找到分类按钮:', category);
        return null;
    } catch (error) {
        console.error('[Crown Executor] 查找按钮时出错:', error);
        return null;
    }
}

/**
 * 查找运动图标
 * @param {string} sportName - 运动名称 (Soccer/Basketball等)
 * @returns {HTMLElement|null}
 */
function findSportIcon(sportName) {
    try {
        console.log(`[Crown Executor] 开始查找运动图标: ${sportName}`);

        const sportLower = sportName.toLowerCase();

        // 查找所有可见元素
        const allElements = document.querySelectorAll('*');
        const candidates = [];

        for (const element of allElements) {
            // 跳过不可见元素
            if (element.offsetParent === null) continue;

            const fullText = element.textContent.toLowerCase().trim();

            // 只考虑短文本元素（避免大容器）
            if (fullText.length > 50) continue;

            // 更宽松的匹配：精确/开头/包含
            const isExactMatch = fullText === sportLower;
            const isStartMatch = fullText.startsWith(sportLower);
            const isIncludeMatch = fullText.length < 25 && fullText.includes(sportLower);

            if (isExactMatch || isStartMatch || isIncludeMatch) {
                // 放宽可点击性检查：包括DIV和SPAN
                const isClickable =
                    element.tagName === 'A' ||
                    element.tagName === 'BUTTON' ||
                    element.tagName === 'DIV' ||
                    element.tagName === 'SPAN' ||
                    element.onclick ||
                    element.getAttribute('href') ||
                    element.getAttribute('onclick') ||
                    window.getComputedStyle(element).cursor === 'pointer';

                // 或者父元素可点击
                const parentClickable =
                    element.parentElement?.tagName === 'A' ||
                    element.parentElement?.tagName === 'BUTTON' ||
                    element.parentElement?.tagName === 'DIV' ||
                    element.parentElement.onclick;

                if (isClickable || parentClickable) {
                    const targetElement = parentClickable ? element.parentElement : element;

                    candidates.push({
                        element: targetElement,
                        text: fullText,
                        matchType: isExactMatch ? 'exact' : (isStartMatch ? 'starts' : 'includes')
                    });

                    console.log(`[Crown Executor] 找到运动图标候选: "${fullText}" (${candidates[candidates.length - 1].matchType})`, targetElement);
                }
            }
        }

        // 如果找到候选，选择最佳匹配
        if (candidates.length > 0) {
            // 优先选择精确匹配
            const exactMatch = candidates.find(c => c.matchType === 'exact');
            const startsMatch = candidates.find(c => c.matchType === 'starts');
            const selected = exactMatch || startsMatch || candidates[0];

            console.log(`[Crown Executor] 选择运动图标 (${selected.matchType}):`, selected);
            return selected.element;
        }

        console.warn('[Crown Executor] 未找到运动图标:', sportName);
        return null;
    } catch (error) {
        console.error('[Crown Executor] 查找运动图标时出错:', error);
        return null;
    }
}

/**
 * 标准化队名（移除常见后缀，便于模糊匹配）
 * @param {string} teamName - 队名
 * @returns {string} - 标准化后的队名
 */
function normalizeTeamName(teamName) {
    if (!teamName || teamName === 'Unknown') return [];

    let normalized = teamName.toLowerCase().trim();

    // 移除常见后缀
    const suffixes = [
        'fc', 'football club', 'united', 'city', 'town', 'athletic',
        'warriors', 'celtics', 'timberwolves', 'afc', 'sfc', 'cfc',
        'hotspur', 'rovers', 'wanderers', 'albion', 'county'
    ];

    // 移除后缀
    for (const suffix of suffixes) {
        // 移除结尾的后缀（如 "Brentford FC" → "Brentford"）
        const pattern = new RegExp(`\\s+${suffix}$`, 'i');
        normalized = normalized.replace(pattern, '');
    }

    // 提取关键词（保留主要名称）
    const words = normalized.split(/\s+/).filter(w => w.length > 0);

    // 返回所有单词用于匹配
    return words;
}

/**
 * 在页面查找比赛
 * @param {string} team1 - 队名1
 * @param {string} team2 - 队名2  
 * @returns {HTMLElement|null} - 找到的比赛元素
 */
function findMatch(team1, team2) {
    try {
        console.log(`[Crown Executor] 🔍 开始搜索比赛: ${team1} vs ${team2}`);

        if (team1 === 'Unknown' || team2 === 'Unknown') {
            console.warn('[Crown Executor] 队名未知，无法搜索');
            return null;
        }

        // 标准化队名
        const team1Words = normalizeTeamName(team1);
        const team2Words = normalizeTeamName(team2);

        console.log('[Crown Executor] 搜索关键词:', team1Words, 'vs', team2Words);

        // 查找所有文本元素
        const allElements = document.querySelectorAll('*');
        const matchCandidates = [];

        console.log(`[Crown Executor] 📊 开始扫描${allElements.length}个元素...`);
        let checkedCount = 0;
        let visibleCount = 0;
        let sampleCount = 0;

        for (const element of allElements) {
            checkedCount++;

            // 跳过不可见元素
            if (element.offsetParent === null) continue;
            visibleCount++;

            // 跳过子元素过多的容器  
            if (element.children.length > 10) continue;

            const text = element.textContent.toLowerCase();

            // 采样调试：显示前10个有文本的可见元素
            if (sampleCount < 10 && text.trim().length > 0 && text.length < 200) {
                console.log(`[Crown Executor] 📄 样本${sampleCount + 1}: "${text.substring(0, 80)}..."`);
                sampleCount++;
            }

            // 只记录包含任一关键词的元素（移除长度限制）
            let hasAnyKeyword = false;
            for (const word of [...team1Words, ...team2Words]) {
                if (text.includes(word)) { // 移除 word.length > 2 限制
                    hasAnyKeyword = true;
                    break;
                }
            }

            if (hasAnyKeyword) {
                console.log(`[Crown Executor] 📝 发现含关键词的元素: "${text.substring(0, 100)}..."`);
            }

            // 检查是否包含两队的关键词
            let team1Matches = 0;
            let team2Matches = 0;

            for (const word of team1Words) {
                if (text.includes(word)) { // 移除 word.length > 2 限制
                    team1Matches++;
                }
            }

            for (const word of team2Words) {
                if (text.includes(word)) { // 移除 word.length > 2 限制
                    team2Matches++;
                }
            }

            // 如果同时包含两队的关键词
            if (team1Matches > 0 && team2Matches > 0) {
                matchCandidates.push({
                    element: element,
                    text: text.substring(0, 100), // 只保留前100字符用于日志
                    score: team1Matches + team2Matches
                });

                console.log(`[Crown Executor] ✅ 找到候选比赛 (得分${team1Matches + team2Matches}): "${text.substring(0, 80)}..."`, element);
            }
        }

        console.log(`[Crown Executor] 📊 统计: 检查${checkedCount}个元素, ${visibleCount}个可见, ${matchCandidates.length}个候选`);

        if (matchCandidates.length > 0) {
            // 按得分排序，选择最佳匹配
            matchCandidates.sort((a, b) => b.score - a.score);
            const best = matchCandidates[0];

            console.log(`[Crown Executor] ✅ 找到比赛！得分: ${best.score}`, best.element);
            return best.element;
        }

        console.warn('[Crown Executor] ❌ 未找到匹配的比赛');
        return null;
    } catch (error) {
        console.error('[Crown Executor] 搜索比赛时出错:', error);
        return null;
    }
}

/**
 * 展开联赛
 * @param {string} leagueName - 联赛名称 (如 "NBA")
 * @returns {Promise<boolean>} - 是否成功展开
 */
async function expandLeague(leagueName) {
    try {
        console.log(`[Crown Executor] 🔓 尝试展开联赛: ${leagueName}`);

        if (!leagueName || leagueName === 'Unknown') {
            console.log('[Crown Executor] 联赛未知，跳过展开');
            return false;
        }

        const leagueLower = leagueName.toLowerCase();
        const allElements = document.querySelectorAll('*');

        console.log(`[Crown Executor] 📊 扫描${allElements.length}个元素查找联赛: ${leagueName}`);
        let candidates = [];

        for (const element of allElements) {
            if (element.offsetParent === null) continue;

            const text = element.textContent.trim();
            const textLower = text.toLowerCase();

            // 精确匹配：文本恰好是联赛名 或 文本很短且包含联赛名
            const isExactMatch = textLower === leagueLower;
            const isShortMatch = text.length <= 20 && textLower.includes(leagueLower);

            // 也尝试匹配包含联赛名的独立单词（如 "NBA Matches" 或 "NBA"）
            const wordBoundaryMatch = new RegExp(`\\b${leagueLower}\\b`, 'i').test(text);

            if (isExactMatch || (isShortMatch && wordBoundaryMatch)) {
                candidates.push({
                    element: element,
                    text: text,
                    exactMatch: isExactMatch
                });

                console.log(`[Crown Executor] 📝 发现联赛候选: "${text}" (精确匹配: ${isExactMatch})`, element);
            }
        }

        console.log(`[Crown Executor] 📊 找到${candidates.length}个联赛候选元素`);

        // 优先选择精确匹配
        candidates.sort((a, b) => {
            if (a.exactMatch && !b.exactMatch) return -1;
            if (!a.exactMatch && b.exactMatch) return 1;
            return a.text.length - b.text.length; // 文本越短越好
        });

        for (const candidate of candidates) {
            const element = candidate.element;

            // 检查联赛是否已经展开
            let isExpanded = false;

            // 方法1: 检查元素本身和父元素的class
            const checkExpanded = (el) => {
                if (!el) return false;
                const className = el.className || '';
                const classLower = className.toString().toLowerCase();

                // 常见的展开状态class: open, opened, expanded, active, on
                // 常见的折叠状态class: closed, collapsed, off
                if (classLower.includes('open') ||
                    classLower.includes('expand') ||
                    classLower.includes('active') ||
                    classLower.includes(' on')) {
                    return true;
                }
                return false;
            };

            isExpanded = checkExpanded(element);

            // 也检查父元素（最多3层）
            if (!isExpanded) {
                let parent = element.parentElement;
                for (let i = 0; i < 3 && parent; i++) {
                    if (checkExpanded(parent)) {
                        isExpanded = true;
                        console.log(`[Crown Executor] 父元素${i + 1}层显示已展开状态`);
                        break;
                    }
                    parent = parent.parentElement;
                }
            }

            // 方法2: 检查附近是否有比赛元素（已展开的联赛下面应该有比赛）
            if (!isExpanded) {
                // 查找父容器中是否有比赛相关元素
                const container = element.closest('div[id*="league"], div[class*="league"]') || element.parentElement;
                if (container) {
                    const matchElements = container.querySelectorAll('[class*="match"], [class*="game"], [id*="match"], [id*="game"]');
                    if (matchElements.length > 0) {
                        isExpanded = true;
                        console.log(`[Crown Executor] 发现${matchElements.length}个比赛元素，联赛应该已展开`);
                    }
                }
            }

            if (isExpanded) {
                console.log(`[Crown Executor] ✅ 联赛 "${candidate.text}" 已经展开，跳过点击`);
                return true; // 已展开，无需点击
            }

            console.log(`[Crown Executor] 📍 联赛 "${candidate.text}" 似乎是折叠的，尝试展开`);

            // 检查元素本身或其父元素是否可点击
            let clickableElement = null;

            // 检查元素本身
            const elementClickable = element.tagName === 'DIV' ||
                element.tagName === 'A' ||
                element.onclick ||
                window.getComputedStyle(element).cursor === 'pointer';

            if (elementClickable) {
                clickableElement = element;
            } else {
                // 检查父元素（最多向上3层）
                let parent = element.parentElement;
                for (let i = 0; i < 3 && parent; i++) {
                    const parentClickable = parent.tagName === 'DIV' ||
                        parent.tagName === 'A' ||
                        parent.onclick ||
                        window.getComputedStyle(parent).cursor === 'pointer';

                    if (parentClickable) {
                        clickableElement = parent;
                        console.log(`[Crown Executor] 找到可点击的父元素 (${i + 1}层)`, parent);
                        break;
                    }
                    parent = parent.parentElement;
                }
            }

            if (clickableElement) {
                console.log(`[Crown Executor] ✅ 找到可点击的联赛元素: "${candidate.text}"`, clickableElement);

                // 点击展开
                clickableElement.click();
                console.log('[Crown Executor] ✅ 已点击展开联赛');

                // 等待加载
                await new Promise(resolve => setTimeout(resolve, 800));
                return true;
            }
        }

        console.log('[Crown Executor] ⚠️ 未找到需要展开的联赛元素（可能已全部展开）');
        return false;
    } catch (error) {
        console.error('[Crown Executor] 展开联赛时出错:', error);
        return false;
    }
}

/**
 * 点击运动图标（带轮询重试）
 * @param {string} sportName - 运动名称
 * @param {number} attemptCount - 当前尝试次数
 * @param {number} maxAttempts - 最大尝试次数
 */
function clickSportIcon(sportName, attemptCount = 0, maxAttempts = 10) {
    const retryInterval = 300; // 每300ms尝试一次

    console.log(`[Crown Executor] 尝试查找运动图标: ${sportName} (尝试 ${attemptCount + 1}/${maxAttempts})`);

    const icon = findSportIcon(sportName);

    if (icon) {
        // 找到了，点击
        icon.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
            icon.click();
            console.log(`[Crown Executor] ✅ 已点击运动图标: ${sportName}`);
            console.log('[Crown Executor] 🎉 点击序列完成');

            // 发送成功消息
            chrome.runtime.sendMessage({
                type: 'SPORT_CLICK_SUCCESS',
                sport: sportName
            });
        }, 200);
    } else {
        // 未找到，继续重试
        if (attemptCount < maxAttempts - 1) {
            console.log(`[Crown Executor] ⏳ 未找到运动图标，${retryInterval}ms后重试... (${attemptCount + 1}/${maxAttempts})`);
            setTimeout(() => {
                clickSportIcon(sportName, attemptCount + 1, maxAttempts);
            }, retryInterval);
        } else {
            console.error(`[Crown Executor] ❌ 经过${maxAttempts}次尝试后仍未找到运动图标: ${sportName}`);
            console.log('[Crown Executor] 💡 可能原因：该时间分类下不显示此运动类型');

            // 发送失败消息
            chrome.runtime.sendMessage({
                type: 'SPORT_CLICK_FAILED',
                sport: sportName,
                reason: `经过${maxAttempts}次尝试未找到运动图标`
            });
        }
    }
}

/**
 * 点击分类按钮（并在成功后点击运动图标）
 * @param {string} category - 时间分类
 * @param {string} sportName - 运动名称（可选）
 * @param {number} retryCount - 重试次数
 */
function clickCategory(category, sportName = null, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 1000; // 1秒

    console.log(`[Crown Executor] 尝试点击分类: ${category} (尝试 ${retryCount + 1}/${maxRetries + 1})`);

    const button = findCategoryButton(category);

    if (button) {
        // 滚动到按钮位置
        button.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 稍作延迟后点击
        setTimeout(() => {
            button.click();
            console.log(`[Crown Executor] ✅ 已点击分类: ${category}`);

            // 发送成功消息
            chrome.runtime.sendMessage({
                type: 'CLICK_SUCCESS',
                category: category
            });

            // 如果提供了运动类型，开始轮询点击运动图标
            if (sportName) {
                console.log(`[Crown Executor] 🔄 开始轮询查找运动图标: ${sportName}`);
                console.log(`[Crown Executor] 📋 将每300ms尝试一次，最多尝试10次（共3秒）`);

                // 等待500ms让页面开始更新，然后开始轮询
                setTimeout(() => {
                    clickSportIcon(sportName, 0, 10);
                }, 500);
            } else {
                console.log('[Crown Executor] 🎉 点击序列完成');
            }
        }, 300);
    } else {
        if (retryCount < maxRetries) {
            console.log(`[Crown Executor] 未找到按钮，${retryDelay}ms后重试...`);
            setTimeout(() => {
                clickCategory(category, sportName, retryCount + 1);
            }, retryDelay);
        } else {
            console.error(`[Crown Executor] 多次尝试后仍未找到分类按钮: ${category}`);

            // 发送失败消息
            chrome.runtime.sendMessage({
                type: 'CLICK_FAILED',
                category: category,
                reason: '未找到对应的分类按钮'
            });
        }
    }
}

/**
 * 监听来自background的消息
 */
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log('[Crown Executor] 收到消息:', message);

    if (message.type === 'CLICK_CATEGORY') {
        const category = message.category;
        const sportName = message.sport;
        const team1 = message.team1;
        const team2 = message.team2;
        const league = message.league;
        const matchTime = message.time; // ✅ 新增：获取比赛时间

        console.log(`[Crown Executor] 接收到点击指令:`);
        console.log(`  分类: ${category}`);
        console.log(`  运动: ${sportName}`);
        console.log(`  队名: ${team1} vs ${team2}`);
        console.log(`  联赛: ${league}`);
        console.log(`  时间: ${matchTime}`);

        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // 执行跨分类搜索（忽略category，使用固定顺序）
        try {
            await searchMatchAcrossCategories(sportName, team1, team2, league, matchTime);
        } catch (error) {
            console.error('[Crown Executor] 执行出错:', error);
        }
    } else if (message.type === 'PING') {
        sendResponse({ status: 'active' });
    }

    return true;
});

/**
 * 检测并处理日期选择页面（足球等运动需要选择日期）
 * @param {string} team1 - 队伍1名称
 * @param {string} team2 - 队伍2名称
 * @param {string} matchTime - 比赛时间（如 "Mon, Dec 1 at 4:00 AM"）
 * @returns {Promise<boolean>} - 是否处理了日期选择
 */
async function detectAndNavigateDateSelection(team1, team2, matchTime) {
    try {
        console.log('[Crown Executor] 🔍 检测日期选择页面...');

        // 检测是否有日期按钮（ALL DATES, SUN 30 NOV等）
        const allElements = document.querySelectorAll('*');
        let hasDateButtons = false;

        for (const el of allElements) {
            if (el.offsetParent === null) continue; // 跳过不可见元素

            const text = el.textContent.trim().toUpperCase();

            // 检查是否包含"ALL DATES"或日期格式（如"SUN 30 NOV"）
            if (text === 'ALL DATES' || /^(MON|TUE|WED|THU|FRI|SAT|SUN)\s+\d+\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)/.test(text)) {
                hasDateButtons = true;
                console.log('[Crown Executor] 🗓️ 检测到日期选择页面');
                break;
            }
        }

        if (!hasDateButtons) {
            return false; // 没有日期选择页面
        }

        // ✅ 使用date_parser.js解析比赛时间
        let targetDate = null;
        if (matchTime && typeof convertToCrownDate === 'function') {
            targetDate = convertToCrownDate(matchTime);
            console.log(`[Crown Executor] 📅 目标日期: "${targetDate}"`);
        }

        // 查找匹配的日期按钮
        const dateButtons = [];

        for (const el of allElements) {
            if (el.offsetParent === null) continue;

            const text = el.textContent.trim().toUpperCase();

            // 查找日期格式的按钮（如SUN 30 NOV, MON 1 DEC）
            if (/^(MON|TUE|WED|THU|FRI|SAT|SUN)\s+\d+\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)/.test(text) && text.length < 100) {
                dateButtons.push({
                    element: el,
                    date: text.match(/^[A-Z]+\s+\d+\s+[A-Z]+/)[0],
                    fullText: text
                });
            }

            // 也查找"ALL MATCHES"按钮
            if (text.includes('ALL MATCHES') && text.length < 100) {
                dateButtons.push({
                    element: el,
                    date: 'ALL MATCHES',
                    fullText: text
                });
            }
        }

        console.log(`[Crown Executor] 📋 找到${dateButtons.length}个日期按钮`);

        // 优先尝试匹配精确日期
        if (targetDate) {
            for (const btn of dateButtons) {
                if (btn.fullText.includes(targetDate)) {
                    console.log(`[Crown Executor] 🎯 找到匹配日期: "${btn.fullText}"`);
                    btn.element.click();
                    console.log('[Crown Executor] ✅ 已点击匹配日期按钮');
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    return true;
                }
            }

            console.log('[Crown Executor] ⚠️ 未找到精确匹配的日期，尝试临近日期（时差容错）...');

            // TODO: 实现±1天的日期容错
            // 由于涉及日期计算，暂时先点击第一个日期按钮
        }

        // 如果没找到精确匹配，尝试点击"ALL MATCHES"或第一个日期
        for (const btn of dateButtons) {
            if (btn.date === 'ALL MATCHES') {
                console.log(`[Crown Executor] 📋 点击"ALL MATCHES": "${btn.fullText}"`);
                btn.element.click();
                console.log('[Crown Executor] ✅ 已点击"ALL MATCHES"按钮');
                await new Promise(resolve => setTimeout(resolve, 1500));
                return true;
            }
        }

        // 最后尝试点击第一个日期按钮
        if (dateButtons.length > 0 && dateButtons[0].date !== 'ALL MATCHES') {
            const btn = dateButtons[0];
            console.log(`[Crown Executor] 📅 点击第一个日期: "${btn.fullText}"`);
            btn.element.click();
            console.log('[Crown Executor] ✅ 已点击日期按钮');
            await new Promise(resolve => setTimeout(resolve, 1500));
            return true;
        }

        console.log('[Crown Executor] ⚠️ 未找到合适的日期按钮');
        return false;

    } catch (error) {
        console.error('[Crown Executor] ❌ 日期选择导航出错:', error);
        return false;
    }
}

/**
 * 跨时间分类搜索比赛
 * @param {string} sportName - 运动类型
 * @param {string} team1 - 队名1
 * @param {string} team2 - 队名2
 * @param {string} league - 联赛名称
 * @param {string} matchTime - 比赛时间（如 "Mon, Dec 1 at 4:00 AM"）
 */
async function searchMatchAcrossCategories(sportName, team1, team2, league, matchTime) {
    console.log('[Crown Executor] 🎯 开始跨时间分类搜索比赛');

    // ✅ 固定搜索顺序：Early → Today（最优路径）
    const searchOrder = ['Early', 'Today'];

    console.log('[Crown Executor] 🔄 固定搜索顺序:', searchOrder);

    for (const category of searchOrder) {
        console.log(`\n[Crown Executor] 📂 尝试在 ${category} 分类中搜索...`);

        // 1. 点击时间分类
        const categoryButton = findCategoryButton(category);
        if (categoryButton) {
            categoryButton.click();
            console.log(`[Crown Executor] ✅ 已点击分类: ${category}`);
            console.log('[Crown Executor] ⏳ 等待1.5秒让页面加载...');
            await new Promise(resolve => setTimeout(resolve, 1500)); // 增加到1.5秒
        } else {
            console.warn(`[Crown Executor] ⚠️ 未找到分类按钮: ${category}`);
            continue;
        }

        // 2. 轮询等待运动图标出现
        console.log('[Crown Executor] 🔄 开始轮询等待运动图标出现...');
        let sportIcon = null;
        let attempts = 0;
        const maxAttempts = 10; // 最多尝试10次
        const pollInterval = 500; // 每500ms检查一次

        while (attempts < maxAttempts) {
            sportIcon = findSportIcon(sportName);
            if (sportIcon) {
                console.log(`[Crown Executor] ✅ 找到运动图标 (尝试 ${attempts + 1}/${maxAttempts})`);
                break;
            }
            attempts++;
            console.log(`[Crown Executor] ⏳ 运动图标未出现，${pollInterval}ms后重试 (${attempts}/${maxAttempts})...`);
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        if (!sportIcon) {
            console.warn(`[Crown Executor] ⚠️ 轮询${maxAttempts}次后仍未找到运动图标: ${sportName}`);
            continue;
        }

        // 3. 点击运动图标
        sportIcon.click();
        console.log(`[Crown Executor] ✅ 已点击运动图标: ${sportName}`);

        // 3.5. 检测并处理日期选择页面（足球等运动需要）
        await new Promise(resolve => setTimeout(resolve, 1500)); // 等待页面响应

        const hasDateSelection = await detectAndNavigateDateSelection(team1, team2, matchTime);

        if (hasDateSelection) {
            console.log('[Crown Executor] ✅ 已完成日期选择导航');
        } else {
            console.log('[Crown Executor] ℹ️ 未检测到日期选择页面，继续正常流程');
        }

        // 4. 轮询等待比赛列表加载
        console.log('[Crown Executor] 🔄 等待比赛列表加载...');
        let matchListLoaded = false;
        let loadAttempts = 0;
        const maxLoadAttempts = 10; // 最多等10秒
        const loadCheckInterval = 1000; // 每1秒检查一次

        while (loadAttempts < maxLoadAttempts) {
            // 检查是否有比赛元素（不管是哪场）
            const matchElements = document.querySelectorAll('[class*="match"], [class*="game"], [class*="event"], [id*="game"]');

            // 过滤可见元素
            const visibleMatches = Array.from(matchElements).filter(el => el.offsetParent !== null);

            if (visibleMatches.length > 0) {
                console.log(`[Crown Executor] ✅ 比赛列表已加载 (发现${visibleMatches.length}场比赛)`);
                matchListLoaded = true;
                break;
            }

            loadAttempts++;
            if (loadAttempts < maxLoadAttempts) {
                console.log(`[Crown Executor] ⏳ 比赛列表未加载，1秒后重试 (${loadAttempts}/${maxLoadAttempts})...`);
                await new Promise(resolve => setTimeout(resolve, loadCheckInterval));
            }
        }

        if (!matchListLoaded) {
            console.warn(`[Crown Executor] ⚠️ 等待${maxLoadAttempts}秒后，比赛列表仍未加载`);
            console.log('[Crown Executor] 跳过本分类，尝试下一个...');
            continue; // 跳到下一个时间分类
        }

        console.log('[Crown Executor] ⏳ 比赛列表加载完成，再等1秒确保内容稳定...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 5. 尝试展开联赛
        if (league && league !== 'Unknown') {
            await expandLeague(league);
            console.log('[Crown Executor] ⏳ 联赛展开后等待0.5秒...');
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 6. 第一次搜索比赛
        let matchElement = findMatch(team1, team2);

        if (!matchElement) {
            console.log('[Crown Executor] 📜 第一次未找到，尝试滚动并展开所有联赛...');

            // 滚动到页面底部
            window.scrollTo(0, document.body.scrollHeight);
            console.log('[Crown Executor] ⬇️ 已滚动到页面底部');
            await new Promise(resolve => setTimeout(resolve, 1000)); // 等待加载

            // 展开所有折叠的联赛（查找类似"ENGLISH PREMIER LEAGUE"的标题）
            const leagueHeaders = document.querySelectorAll('*');
            let expandedCount = 0;

            for (const header of leagueHeaders) {
                // 跳过不可见元素
                if (header.offsetParent === null) continue;

                const text = header.textContent.trim().toUpperCase();

                // ✅ 扩展关键词，包含Italy
                const hasLeagueName = text.includes('LEAGUE') ||
                    text.includes('PREMIER') ||
                    text.includes('SERIE') ||
                    text.includes('LIGA') ||
                    text.includes('DIVISION') ||
                    text.includes('CHAMPIONSHIP') ||
                    text.includes('FIGHTING') ||
                    text.includes('UFC') ||
                    text.includes('BOXING') ||
                    text.includes('CUP') ||
                    text.includes('TOURNAMENT') ||
                    text.includes('ITALY') ||  // ✅ 新增
                    text.includes('SPAIN') ||  // ✅ 新增
                    text.includes('GERMANY') ||  // ✅ 新增
                    text.includes('FRANCE') ||  // ✅ 新增
                    text.includes('ENGLAND');  // ✅ 新增

                // ✅ 放宽限制：移除children.length检查，只保留文本长度检查
                if (hasLeagueName && text.length < 100 && text.length > 3) {
                    // 尝试点击展开
                    try {
                        header.click();
                        console.log(`[Crown Executor] 🔓 点击展开: "${text.substring(0, 50)}"`);
                        expandedCount++;
                        await new Promise(resolve => setTimeout(resolve, 200)); // 等待展开
                    } catch (e) {
                        // 忽略点击错误
                    }
                }
            }

            console.log(`[Crown Executor] 📊 共展开${expandedCount}个联赛`);

            // 立即滚回顶部
            window.scrollTo(0, 0);
            console.log('[Crown Executor] ⬆️ 滚回顶部');

            // 滚回顶部后等待内容稳定
            console.log('[Crown Executor] ⏳ 等待2秒让展开的内容加载...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 第二次搜索
            console.log('[Crown Executor] 🔍 第二次搜索比赛...');
            matchElement = findMatch(team1, team2);
        }

        if (matchElement) {
            console.log(`[Crown Executor] 🎉 在 ${category} 找到比赛！`);

            // 点击比赛进入详情页
            const clicked = await clickMatchToEnterDetails(matchElement, team1, team2);

            if (clicked) {
                console.log('[Crown Executor] ✅ 已进入比赛详情页');

                // 发送成功消息
                chrome.runtime.sendMessage({
                    type: 'MATCH_FOUND',
                    category: category,
                    sport: sportName,
                    team1: team1,
                    team2: team2
                });

                return true;
            } else {
                console.warn('[Crown Executor] ⚠️ 找到比赛但未能点击进入详情页');
                // 继续搜索其他分类
            }
        } else {
            console.log(`[Crown Executor] ❌ 在 ${category} 未找到比赛`);
        }
    }

    // 所有分类都搜索完毕，仍未找到
    console.log('[Crown Executor] ❌ 搜索完所有时间分类，未找到比赛');

    // 发送失败消息
    chrome.runtime.sendMessage({
        type: 'MATCH_NOT_FOUND',
        sport: sportName,
        team1: team1,
        team2: team2
    });

    return false;
}

/**
 * Placeholder for normalizeTeamName function.
 * This function is assumed to exist elsewhere in the codebase or needs to be defined.
 * For the purpose of this edit, a basic implementation is provided to ensure syntactical correctness.
 * In a real scenario, this would contain logic to clean and standardize team names.
 */
function normalizeTeamName(name) {
    return name.toLowerCase().split(/\s+/);
}

/**
 * 点击比赛元素中的队名进入详情页
 * @param {HTMLElement} matchElement - 比赛元素
 * @param {string} team1 - 队伍1名称
 * @param {string} team2 - 队伍2名称
 * @returns {Promise<boolean>} - 是否成功点击
 */
async function clickMatchToEnterDetails(matchElement, team1, team2) {
    try {
        console.log('[Crown Executor] 🖱️ 尝试点击队名进入比赛详情...');

        // 在比赛元素及其子元素中查找队名
        const allElements = matchElement.querySelectorAll('*');
        const candidates = [];

        const team1Words = normalizeTeamName(team1);
        const team2Words = normalizeTeamName(team2);

        // 查找包含队名的可点击元素
        for (const el of allElements) {
            if (el.offsetParent === null) continue; // 跳过不可见元素

            const text = el.textContent.toLowerCase();

            // 检查是否包含队名关键词
            let hasTeamName = false;
            for (const word of [...team1Words, ...team2Words]) {
                if (text.includes(word)) {
                    hasTeamName = true;
                    break;
                }
            }

            if (hasTeamName && el.children.length <= 3) {
                // 检查元素是否可点击（有onclick、是链接、或有cursor:pointer样式）
                const style = window.getComputedStyle(el);
                const isClickable = el.onclick ||
                    el.tagName === 'A' ||
                    style.cursor === 'pointer' ||
                    el.hasAttribute('onclick');

                if (isClickable || el.parentElement?.onclick || el.parentElement?.tagName === 'A') {
                    candidates.push({
                        element: el,
                        text: text.substring(0, 50)
                    });
                }
            }
        }

        console.log(`[Crown Executor] 找到${candidates.length}个可点击的队名候选`);

        // 尝试点击第一个候选（通常是主队或客队名）
        if (candidates.length > 0) {
            const candidate = candidates[0];
            console.log(`[Crown Executor] 🖱️ 点击队名: "${candidate.text}"`, candidate.element);

            // 尝试点击元素本身或其父元素
            let clickTarget = candidate.element;
            if (candidate.element.parentElement?.onclick || candidate.element.parentElement?.tagName === 'A') {
                clickTarget = candidate.element.parentElement;
            }

            clickTarget.click();
            console.log('[Crown Executor] ✅ 已点击队名');

            // 等待页面跳转
            await new Promise(resolve => setTimeout(resolve, 1000));
            return true;
        }

        // 如果没找到可点击的队名，尝试点击整个比赛元素
        console.log('[Crown Executor] ⚠️ 未找到可点击的队名，尝试点击整个比赛元素');
        matchElement.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;

    } catch (error) {
        console.error('[Crown Executor] ❌ 点击队名出错:', error);
        return false;
    }
}

console.log('[Crown Executor] 脚本已加载');
console.log('[Crown Executor] 消息监听器已设置');

// 页面加载完成后通知background
if (document.readyState === 'complete') {
    chrome.runtime.sendMessage({ type: 'CROWN_PAGE_READY' });
} else {
    window.addEventListener('load', () => {
        chrome.runtime.sendMessage({ type: 'CROWN_PAGE_READY' });
    });
}
