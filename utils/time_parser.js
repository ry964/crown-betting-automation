/**
 * 时间解析和分类工具
 */

/**
 * 解析OddsJam的时间格式
 * 例如: "Sat, Nov 29 at 4:00 AM"
 * @param {string} timeString - OddsJam的时间字符串
 * @returns {Date|null} - 解析后的Date对象
 */
function parseOddsJamTime(timeString) {
    try {
        // 移除星期几部分，只保留日期和时间
        const cleanedString = timeString.replace(/^[A-Za-z]+,\s*/, '');

        // 获取当前年份
        const currentYear = new Date().getFullYear();

        // 构建完整的日期字符串
        const fullDateString = `${cleanedString} ${currentYear}`;

        // 解析日期
        const parsedDate = new Date(fullDateString);

        // 如果解析后的日期在当前日期之前，可能是明年的比赛
        const now = new Date();
        if (parsedDate < now && (parsedDate.getMonth() < now.getMonth())) {
            parsedDate.setFullYear(currentYear + 1);
        }

        return parsedDate;
    } catch (error) {
        console.error('[TimeParser] 解析时间失败:', error);
        return null;
    }
}

/**
 * 计算时间分类
 * @param {Date} matchTime - 比赛时间
 * @returns {string} - 时间分类 (In-Play/Today/Soon/Early)
 */
function calculateTimeCategory(matchTime) {
    const now = new Date();
    const diffMs = matchTime - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    // 比赛已开始（假设比赛时长约3小时）
    if (diffHours < 0 && diffHours > -3) {
        return 'In-Play';
    }

    // 检查是否是今天
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
}

/**
 * 从时间字符串直接获取分类
 * @param {string} timeString - OddsJam的时间字符串
 * @returns {string} - 时间分类
 */
function getCategoryFromTimeString(timeString) {
    const matchTime = parseOddsJamTime(timeString);
    if (!matchTime) {
        console.warn('[TimeParser] 无法解析时间，默认使用Today');
        return 'Today';
    }

    const category = calculateTimeCategory(matchTime);
    console.log(`[TimeParser] 时间: ${timeString} -> ${matchTime.toLocaleString()} -> 分类: ${category}`);
    return category;
}

// 导出函数（适用于Chrome扩展环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseOddsJamTime,
        calculateTimeCategory,
        getCategoryFromTimeString
    };
}
