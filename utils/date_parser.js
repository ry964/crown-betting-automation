/**
 * 日期解析工具
 * 将OddsJam的时间格式转换为皇冠网站的日期格式
 * 
 * 示例:
 * - 输入: "Sun, Nov 30 at 8:00 PM"
 * - 输出: "SUN 30 NOV"
 */

/**
 * 解析OddsJam时间字符串，提取日期信息
 * @param {string} oddsJamTime - OddsJam的时间字符串，如 "Sun, Nov 30 at 8:00 PM"
 * @returns {Object|null} - 返回包含dayOfWeek, day, month的对象，或null（如果解析失败）
 */
function parseOddsJamDate(oddsJamTime) {
    if (!oddsJamTime || typeof oddsJamTime !== 'string') {
        console.warn('[Date Parser] 无效的时间字符串:', oddsJamTime);
        return null;
    }

    try {
        // 匹配格式: "Sun, Nov 30 at 8:00 PM" 或 "Sun, Dec 7 at 12:00 PM"
        // 提取: 星期几, 月份, 日期
        const match = oddsJamTime.match(/^(\w+),\s+(\w+)\s+(\d+)/);

        if (!match) {
            console.warn('[Date Parser] 无法匹配日期格式:', oddsJamTime);
            return null;
        }

        const [_, dayOfWeek, month, day] = match;

        return {
            dayOfWeek: dayOfWeek.toUpperCase(),  // SUN
            day: day,                             // 30
            month: month.toUpperCase()            // NOV
        };
    } catch (error) {
        console.error('[Date Parser] 解析错误:', error, '输入:', oddsJamTime);
        return null;
    }
}

/**
 * 将解析的日期转换为皇冠格式的日期字符串
 * @param {Object} dateInfo - parseOddsJamDate返回的日期对象
 * @returns {string} - 皇冠格式的日期字符串，如 "SUN 30 NOV"
 */
function formatCrownDate(dateInfo) {
    if (!dateInfo || !dateInfo.dayOfWeek || !dateInfo.day || !dateInfo.month) {
        console.warn('[Date Parser] 无效的日期信息:', dateInfo);
        return null;
    }

    return `${dateInfo.dayOfWeek} ${dateInfo.day} ${dateInfo.month}`;
}

/**
 * 一步将OddsJam时间转换为皇冠日期格式
 * @param {string} oddsJamTime - OddsJam的时间字符串
 * @returns {string|null} - 皇冠格式的日期字符串，如 "SUN 30 NOV"，或null（如果解析失败）
 */
function convertToCrownDate(oddsJamTime) {
    const dateInfo = parseOddsJamDate(oddsJamTime);
    if (!dateInfo) return null;

    const crownDate = formatCrownDate(dateInfo);
    console.log(`[Date Parser] 转换: "${oddsJamTime}" → "${crownDate}"`);

    return crownDate;
}

// 如果在浏览器环境中，导出到全局
if (typeof window !== 'undefined') {
    window.parseOddsJamDate = parseOddsJamDate;
    window.formatCrownDate = formatCrownDate;
    window.convertToCrownDate = convertToCrownDate;
}

// 如果在Node.js环境中，使用CommonJS导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseOddsJamDate,
        formatCrownDate,
        convertToCrownDate
    };
}
