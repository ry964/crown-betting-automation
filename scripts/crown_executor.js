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
            if (fullText.length > 30) continue;

            // 检查是否匹配运动名称
            if (fullText === sportLower ||
                (fullText.length < 20 && fullText.includes(sportLower))) {

                // 确保元素是可点击的
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
                        text: fullText
                    });
                    console.log(`[Crown Executor] 找到运动图标候选: "${fullText}"`, targetElement);
                }
            }
        }

        // 如果找到候选，选择最佳匹配
        if (candidates.length > 0) {
            // 优先选择精确匹配
            const exactMatch = candidates.find(c => c.text === sportLower);
            const selected = exactMatch || candidates[0];
            console.log(`[Crown Executor] 选择运动图标:`, selected);
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
 * 点击运动图标
 * @param {string} sportName - 运动名称
 * @param {number} retryCount - 重试次数
 */
function clickSportIcon(sportName, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 1000;

    console.log(`[Crown Executor] 尝试点击运动图标: ${sportName} (尝试 ${retryCount + 1}/${maxRetries + 1})`);

    const icon = findSportIcon(sportName);

    if (icon) {
        // 滚动到图标位置
        icon.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 稍作延迟后点击
        setTimeout(() => {
            icon.click();
            console.log(`[Crown Executor] 已点击运动图标: ${sportName}`);
            console.log('[Crown Executor] 点击序列完成 ✅');

            // 发送成功消息
            chrome.runtime.sendMessage({
                type: 'SPORT_CLICK_SUCCESS',
                sport: sportName
            });
        }, 300);
    } else {
        if (retryCount < maxRetries) {
            console.log(`[Crown Executor] 未找到运动图标，${retryDelay}ms后重试...`);
            setTimeout(() => {
                clickSportIcon(sportName, retryCount + 1);
            }, retryDelay);
        } else {
            console.error(`[Crown Executor] 多次尝试后仍未找到运动图标: ${sportName}`);

            // 发送失败消息
            chrome.runtime.sendMessage({
                type: 'SPORT_CLICK_FAILED',
                sport: sportName,
                reason: '未找到对应的运动图标'
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
            console.log(`[Crown Executor] 已点击分类: ${category}`);

            // 发送成功消息
            chrome.runtime.sendMessage({
                type: 'CLICK_SUCCESS',
                category: category
            });

            // 如果提供了运动类型，等待页面更新后点击运动图标
            if (sportName) {
                console.log(`[Crown Executor] 等待页面更新后点击运动图标: ${sportName}`);
                setTimeout(() => {
                    clickSportIcon(sportName);
                }, 800); // 等待800ms让页面更新
            } else {
                console.log('[Crown Executor] 点击序列完成 ✅');
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Crown Executor] 收到消息:', message);

    if (message.type === 'CLICK_CATEGORY') {
        const category = message.category;
        const sportName = message.sport;
        console.log(`[Crown Executor] 接收到点击指令 - 分类: ${category}, 运动: ${sportName}`);

        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                clickCategory(category, sportName);
            });
        } else {
            clickCategory(category, sportName);
        }

        sendResponse({ status: 'processing', category: category, sport: sportName });
    } else if (message.type === 'PING') {
        sendResponse({ status: 'active' });
    }

    return true;
});

console.log('[Crown Executor] 消息监听器已设置');

// 页面加载完成后通知background
if (document.readyState === 'complete') {
    chrome.runtime.sendMessage({ type: 'CROWN_PAGE_READY' });
} else {
    window.addEventListener('load', () => {
        chrome.runtime.sendMessage({ type: 'CROWN_PAGE_READY' });
    });
}
