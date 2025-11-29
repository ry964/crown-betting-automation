/**
 * 调试辅助脚本
 * 用于在浏览器控制台中运行，帮助分析页面结构
 */

// ========== OddsJam 页面分析 ==========

/**
 * 分析 OddsJam 页面上的所有可点击元素
 * 在 OddsJam 页面的控制台中运行此函数
 */
function analyzeOddsJamPage() {
    console.log('========== OddsJam 页面结构分析 ==========');

    // 查找所有可能的盘口元素
    const potentialOddsElements = document.querySelectorAll('[class*="odd"], [class*="bet"], [class*="market"], button');

    console.log(`找到 ${potentialOddsElements.length} 个可能的盘口相关元素`);

    // 按类型分组
    const groups = {
        hasOdds: [],
        hasBet: [],
        hasButton: [],
        hasNumber: []
    };

    potentialOddsElements.forEach(el => {
        const className = el.className.toLowerCase();
        const text = el.textContent;

        if (className.includes('odd')) groups.hasOdds.push(el);
        if (className.includes('bet')) groups.hasBet.push(el);
        if (el.tagName === 'BUTTON') groups.hasButton.push(el);
        if (/[+-]\d{2,3}/.test(text)) groups.hasNumber.push(el);
    });

    console.log('分组统计:');
    console.log('- 包含"odd"的元素:', groups.hasOdds.length);
    console.log('- 包含"bet"的元素:', groups.hasBet.length);
    console.log('- Button元素:', groups.hasButton.length);
    console.log('- 包含赔率数字的元素:', groups.hasNumber.length);

    // 获取前5个带赔率数字的元素详情
    console.log('\n前5个带赔率的元素详情:');
    groups.hasNumber.slice(0, 5).forEach((el, i) => {
        console.log(`${i + 1}.`, {
            tag: el.tagName,
            class: el.className,
            text: el.textContent.substring(0, 100),
            html: el.outerHTML.substring(0, 200)
        });
    });

    // 返回结果供进一步分析
    return {
        total: potentialOddsElements.length,
        groups: groups,
        sampleElements: groups.hasNumber.slice(0, 5)
    };
}

/**
 * 点击监听器 - 帮助识别实际点击的元素
 * 在 OddsJam 页面的控制台中运行此函数
 */
function enableClickDebug() {
    console.log('========== 点击调试已启用 ==========');
    console.log('请点击绿色的盘口方块，我会显示元素详情');

    document.addEventListener('click', function debugClickHandler(e) {
        console.log('\n===== 点击事件详情 =====');
        console.log('目标元素:', e.target);
        console.log('标签:', e.target.tagName);
        console.log('Class:', e.target.className);
        console.log('文本:', e.target.textContent.substring(0, 100));

        // 向上遍历5层父元素
        let parent = e.target;
        for (let i = 0; i < 5 && parent; i++) {
            console.log(`父元素 ${i + 1}:`, {
                tag: parent.tagName,
                class: parent.className,
                text: parent.textContent.substring(0, 50)
            });
            parent = parent.parentElement;
        }

        console.log('========================\n');
    }, true);

    console.log('点击调试器已设置！现在可以点击页面元素了。');
    console.log('要停止调试，刷新页面即可。');
}

// ========== 皇冠页面分析 ==========

/**
 * 分析皇冠页面的导航结构
 * 在皇冠页面的控制台中运行此函数
 */
function analyzeCrownPage() {
    console.log('========== 皇冠页面结构分析 ==========');

    // 查找所有链接和按钮
    const allLinks = document.querySelectorAll('a, button, [role="button"]');
    console.log(`找到 ${allLinks.length} 个链接/按钮`);

    // 查找导航区域
    const navElements = document.querySelectorAll('nav, [class*="nav"], [class*="menu"], [class*="header"]');
    console.log(`找到 ${navElements.length} 个可能的导航区域`);

    // 列出所有短文本链接（可能是导航）
    const shortLinks = Array.from(allLinks)
        .filter(link => link.textContent.trim().length < 20 && link.textContent.trim().length > 0)
        .map(link => ({
            text: link.textContent.trim(),
            tag: link.tagName,
            class: link.className,
            href: link.getAttribute('href')
        }));

    console.log('\n所有短文本链接/按钮 (可能的导航项):');
    shortLinks.forEach((link, i) => {
        console.log(`${i + 1}. "${link.text}" | tag: ${link.tag} | class: ${link.class}`);
    });

    // 查找包含特定关键词的元素
    const keywords = ['today', 'early', 'soon', 'in-play', 'live', '今天', '早盘', '滚球'];
    console.log('\n包含关键词的链接:');
    keywords.forEach(keyword => {
        const matches = shortLinks.filter(link =>
            link.text.toLowerCase().includes(keyword) ||
            (link.href && link.href.toLowerCase().includes(keyword))
        );
        if (matches.length > 0) {
            console.log(`"${keyword}":`, matches);
        }
    });

    return {
        totalLinks: allLinks.length,
        navElements: navElements.length,
        shortLinks: shortLinks
    };
}

/**
 * 导出页面结构为JSON
 */
function exportPageStructure() {
    const structure = {
        url: window.location.href,
        title: document.title,
        links: Array.from(document.querySelectorAll('a')).slice(0, 50).map(a => ({
            text: a.textContent.trim().substring(0, 50),
            href: a.getAttribute('href'),
            class: a.className
        })),
        buttons: Array.from(document.querySelectorAll('button')).slice(0, 20).map(b => ({
            text: b.textContent.trim().substring(0, 50),
            class: b.className
        }))
    };

    console.log('页面结构JSON:');
    console.log(JSON.stringify(structure, null, 2));

    // 复制到剪贴板
    const jsonStr = JSON.stringify(structure, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
        console.log('✅ 已复制到剪贴板！');
    });

    return structure;
}

// ========== 使用说明 ==========
console.log(`
========================================
调试辅助脚本已加载！

可用函数：

1. analyzeOddsJamPage()
   - 在 OddsJam 页面分析所有盘口元素
   
2. enableClickDebug()
   - 在 OddsJam 页面启用点击调试
   - 会显示每次点击的元素详情
   
3. analyzeCrownPage()
   - 在皇冠页面分析导航结构
   - 列出所有可能的时间分类链接
   
4. exportPageStructure()
   - 导出页面结构为JSON
   - 自动复制到剪贴板

使用方法：
直接在控制台中输入函数名并回车
例如：analyzeOddsJamPage()
========================================
`);
