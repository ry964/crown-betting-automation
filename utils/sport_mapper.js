/**
 * Sport Type Mapper
 * 映射 OddsJam 运动类型到皇冠网站的运动类型
 */

// OddsJam → Crown 运动类型映射
const SPORT_MAPPING = {
    // 直接对应
    'soccer': 'Soccer',
    'basketball': 'Basketball',
    'tennis': 'Tennis',
    'volleyball': 'Volleyball',
    'snooker': 'Snooker',
    'esports': 'eSports',
    'e-sports': 'eSports',

    // 映射到 Other Sports
    'football': 'Other Sports',  // 美式足球
    'american football': 'Other Sports',
    'baseball': 'Other Sports',
    'hockey': 'Other Sports',
    'ice hockey': 'Other Sports',
    'mma': 'Other Sports',
    'boxing': 'Other Sports',
    'cricket': 'Other Sports',
    'rugby': 'Other Sports',
    'golf': 'Other Sports',
    'motorsport': 'Other Sports',
    'auto racing': 'Other Sports',
    'darts': 'Other Sports',
    'handball': 'Other Sports',
    'table tennis': 'Other Sports',
    'badminton': 'Other Sports',
    'aussie rules': 'Other Sports',
    'futsal': 'Other Sports',
    'beach volleyball': 'Other Sports',
    'water polo': 'Other Sports'
};

/**
 * 映射运动类型
 * @param {string} oddsJamSport - OddsJam的运动类型
 * @returns {string} - 皇冠网站的运动类型
 */
function mapSportType(oddsJamSport) {
    if (!oddsJamSport) {
        console.warn('[Sport Mapper] 未提供运动类型，返回默认值');
        return 'Other Sports';
    }

    const normalized = oddsJamSport.toLowerCase().trim();
    const mapped = SPORT_MAPPING[normalized];

    if (mapped) {
        console.log(`[Sport Mapper] 映射: ${oddsJamSport} → ${mapped}`);
        return mapped;
    }

    // 未知运动类型，默认 Other Sports
    console.warn(`[Sport Mapper] 未知运动类型: ${oddsJamSport}，映射到 Other Sports`);
    return 'Other Sports';
}

/**
 * 获取所有支持的运动类型
 * @returns {Array<string>} - 皇冠支持的运动类型列表
 */
function getSupportedSports() {
    return [
        'Soccer',
        'Basketball',
        'eSports',
        'Tennis',
        'Volleyball',
        'Snooker',
        'Other Sports'
    ];
}
