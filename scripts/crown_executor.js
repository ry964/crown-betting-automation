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
    if (!teamName || teamName === 'Unknown') return '';

    let normalized = teamName.toLowerCase().trim();

    // 移除常见后缀
    const suffixes = ['fc', 'football club', 'united', 'city', 'town', 'athletic', 'warriors', 'celtics', 'timberwolves'];

    // 提取关键词（保留主要名称）
    const words = normalized.split(/\s+/);

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

        for (const element of allElements) {
            // 跳过不可见元素
            if (element.offsetParent === null) continue;

            // 跳过子元素过多的容器  
            if (element.children.length > 10) continue;

            const text = element.textContent.toLowerCase();

            // 检查是否包含两队的关键词
            let team1Matches = 0;
            let team2Matches = 0;

            for (const word of team1Words) {
                if (word.length > 2 && text.includes(word)) {
                    team1Matches++;
                }
            }

            for (const word of team2Words) {
                if (word.length > 2 && text.includes(word)) {
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

                console.log(`[Crown Executor] 找到候选比赛 (得分${team1Matches + team2Matches}): "${text.substring(0, 80)}..."`, element);
            }
        }

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

        for (const element of allElements) {
            if (element.offsetParent === null) continue;

            const text = element.textContent.toLowerCase().trim();

            // 匹配联赛名称
            if (text === leagueLower || text.includes(leagueLower)) {
                // 检查是否可点击
                const isClickable =
                    element.tagName === 'DIV' ||
                    element.tagName === 'A' ||
                    element.onclick ||
                    window.getComputedStyle(element).cursor === 'pointer';

                if (isClickable && text.length < 50) {
                    console.log(`[Crown Executor] 找到联赛元素: "${text}"`, element);

                    // 点击展开
                    element.click();
                    console.log('[Crown Executor] ✅ 已点击展开联赛');

                    // 等待加载
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return true;
                }
            }
        }

        console.log('[Crown Executor] 未找到可展开的联赛元素');
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

        console.log(`[Crown Executor] 接收到点击指令:`);
        console.log(`  分类: ${category}`);
        console.log(`  运动: ${sportName}`);
        console.log(`  队名: ${team1} vs ${team2}`);
        console.log(`  联赛: ${league}`);

        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // 开始跨时间分类搜索
        await searchMatchAcrossCategories(category, sportName, team1, team2, league);
    } else if (message.type === 'PING') {
        sendResponse({ status: 'active' });
    }

    return true;
});

/**
 * 跨时间分类搜索比赛
 * @param {string} initialCategory - 初步判断的时间分类
 * @param {string} sportName - 运动类型
 * @param {string} team1 - 队名1
 * @param {string} team2 - 队名2
 * @param {string} league - 联赛名称
 */
async function searchMatchAcrossCategories(initialCategory, sportName, team1, team2, league) {
    console.log('[Crown Executor] 🎯 开始跨时间分类搜索比赛');

    // 定义搜索顺序：先尝试初步判断的分类，再尝试其他分类
    const categories = ['Today', 'Soon', 'Early', 'In-Play'];

    // 将初步判断的分类放在最前面
    const searchOrder = [initialCategory, ...categories.filter(c => c !== initialCategory)];

    console.log('[Crown Executor] 搜索顺序:', searchOrder);

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

        // 6. 搜索比赛
        const matchElement = findMatch(team1, team2);

        if (matchElement) {
            console.log(`[Crown Executor] 🎉 在 ${category} 找到比赛！`);

            // 点击进入比赛详情
            matchElement.click();
            console.log('[Crown Executor] ✅ 已点击进入比赛');

            // 发送成功消息
            chrome.runtime.sendMessage({
                type: 'MATCH_FOUND',
                category: category,
                team1: team1,
                team2: team2
            });

            return; // 成功找到，结束搜索
        } else {
            console.log(`[Crown Executor] ❌ 在 ${category} 未找到比赛`);
        }
    }

    // 所有分类都搜索完毕，仍未找到
    console.error('[Crown Executor] ❌ 搜索完所有时间分类，未找到比赛');

    chrome.runtime.sendMessage({
        type: 'MATCH_NOT_FOUND',
        team1: team1,
        team2: team2
    });
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
