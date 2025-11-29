/**
 * Background Service Worker
 * 处理OddsJam和皇冠之间的消息传递和标签页管理
 */

// 导入运动类型映射器
importScripts('utils/sport_mapper.js');

console.log('[Background] Service Worker 已启动');

// 皇冠网站域名列表
const CROWN_DOMAINS = [
    'hga050.com',
    'hga039.com',
    'hga038.com',
    'hga035.com',
    'hga030.com',
    'mos055.com',
    'mos033.com',
    'mos022.com',
    'mos011.com'
];

/**
 * 检查URL是否是皇冠网站
 * @param {string} url - URL字符串
 * @returns {boolean}
 */
function isCrownDomain(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        return CROWN_DOMAINS.some(domain =>
            hostname.includes(domain) || hostname.endsWith(domain)
        );
    } catch (error) {
        return false;
    }
}

/**
 * 查找皇冠标签页
 * @returns {Promise<chrome.tabs.Tab|null>}
 */
async function findCrownTab() {
    try {
        const tabs = await chrome.tabs.query({});

        for (const tab of tabs) {
            if (tab.url && isCrownDomain(tab.url)) {
                console.log('[Background] 找到皇冠标签页:', tab.id, tab.url);
                return tab;
            }
        }

        console.log('[Background] 未找到皇冠标签页');
        return null;
    } catch (error) {
        console.error('[Background] 查找标签页失败:', error);
        return null;
    }
}

/**
 * 计算时间分类
 * 这里简化版本，实际应该使用time_parser.js的逻辑
 * @param {string} timeString - 时间字符串
 * @returns {string} - 分类
 */
function calculateCategory(timeString) {
    try {
        // 解析时间 "Sat, Nov 29 at 4:00 AM"
        // 转换为标准格式: "Nov 29, 2024 4:00 AM"
        const match = timeString.match(/([A-Za-z]+)\s+(\d{1,2})\s+at\s+(\d{1,2}:\d{2}\s+[AP]M)/i);

        if (!match) {
            console.warn('[Background] 无法解析时间格式:', timeString);
            return 'Early';
        }

        const [_, month, day, time] = match;
        const currentYear = new Date().getFullYear();
        const dateString = `${month} ${day}, ${currentYear} ${time}`;
        const matchTime = new Date(dateString);

        const now = new Date();

        // 如果时间在过去，可能是明年
        if (matchTime < now && matchTime.getMonth() < now.getMonth()) {
            matchTime.setFullYear(currentYear + 1);
        }

        const diffMs = matchTime - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        console.log('[Background] 比赛时间:', matchTime.toLocaleString(), '| 时间差异:', Math.round(diffHours), '小时');

        // 比赛已开始
        if (diffHours < 0 && diffHours > -3) {
            return 'In-Play';
        }

        // 今天的比赛
        const isToday = matchTime.toDateString() === now.toDateString();
        if (isToday && diffHours >= 0) {
            return 'Today';
        }

        // 24小时内
        if (diffHours >= 0 && diffHours <= 24) {
            return 'Soon';
        }

        // 24小时以上
        return 'Early';
    } catch (error) {
        console.error('[Background] 计算分类失败:', error);
        return 'Early'; // 默认值
    }
}

/**
 * 处理OddsJam点击事件
 * @param {Object} message - 消息对象
 * @param {chrome.tabs.Tab} senderTab - 发送消息的标签页
 */
async function handleOddsJamClick(message, senderTab) {
    console.log('[Background] 处理OddsJam点击:', message);

    const matchTime = message.matchTime;
    const sportType = message.sportType || 'Unknown';

    const category = calculateCategory(matchTime);
    const mappedSport = mapSportType(sportType);

    console.log(`[Background] 计算结果 - 时间: ${matchTime}, 分类: ${category}`);
    console.log(`[Background] 运动类型: ${sportType} → ${mappedSport}`);

    // 查找或创建皇冠标签页
    let crownTab = await findCrownTab();

    if (crownTab) {
        // 激活现有标签页
        await chrome.tabs.update(crownTab.id, { active: true });
        await chrome.windows.update(crownTab.windowId, { focused: true });

        console.log('[Background] 激活现有皇冠标签页');

        // 发送点击指令（包含时间分类和运动类型）
        setTimeout(() => {
            chrome.tabs.sendMessage(crownTab.id, {
                type: 'CLICK_CATEGORY',
                category: category,
                sport: mappedSport
            }).catch(error => {
                console.error('[Background] 发送消息到皇冠页面失败:', error);
            });
        }, 500);
    } else {
        // 创建新标签页
        console.log('[Background] 创建新的皇冠标签页');

        // 使用第一个皇冠域名
        const crownUrl = `https://www.${CROWN_DOMAINS[0]}`;

        crownTab = await chrome.tabs.create({
            url: crownUrl,
            active: true
        });

        // 等待页面加载后发送点击指令
        const listener = (tabId, changeInfo) => {
            if (tabId === crownTab.id && changeInfo.status === 'complete') {
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabId, {
                        type: 'CLICK_CATEGORY',
                        category: category,
                        sport: mappedSport
                    }).catch(error => {
                        console.error('[Background] 发送消息到新皇冠页面失败:', error);
                    });
                }, 1000);

                chrome.tabs.onUpdated.removeListener(listener);
            }
        };

        chrome.tabs.onUpdated.addListener(listener);
    }
}

/**
 * 消息监听器
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[Background] 收到消息:', message.type, sender.tab?.id);

    if (message.type === 'ODDSJAM_CLICK') {
        handleOddsJamClick(message, sender.tab);
        sendResponse({ status: 'processing' });
    } else if (message.type === 'CROWN_PAGE_READY') {
        console.log('[Background] 皇冠页面已准备就绪');
        sendResponse({ status: 'acknowledged' });
    } else if (message.type === 'CLICK_SUCCESS') {
        console.log(`[Background] 点击成功: ${message.category}`);
        sendResponse({ status: 'acknowledged' });
    } else if (message.type === 'CLICK_FAILED') {
        console.error(`[Background] 点击失败: ${message.category}, 原因: ${message.reason}`);
        sendResponse({ status: 'acknowledged' });
    }

    return true;
});

// 扩展安装/更新时
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[Background] 扩展已安装/更新:', details.reason);
});

console.log('[Background] 消息监听器已设置');
