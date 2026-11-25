/* Authentic Traditional Tarot Spread Definitions (pure spatial layout & placement order, no interpretation copy) */
window.TAROT_SPREADS = (() => {
  const SPREADS = [
    {
      id: 'single_oracle',
      name: '单卡指引',
      en: 'SINGLE ORACLE',
      category: '日常 · 聚焦',
      count: 1,
      cardScale: 1.24,
      brief: '凝神抽取一张核心牌，适合单一聚焦问题或每日启示',
      slots: [
        { order: 1, label: '核心指引', en: 'THE ORACLE', x: 50, y: 50, rot: 0 },
      ],
    },
    {
      id: 'time_stream',
      name: '时间之流',
      en: 'TIME STREAM',
      category: '进程 · 趋势',
      count: 3,
      cardScale: 1.06,
      brief: '线性三牌阵，依序呈现过往脉络、当下节点与未来走向',
      slots: [
        { order: 1, label: '过去', en: 'PAST', x: 24, y: 50, rot: 0 },
        { order: 2, label: '现在', en: 'PRESENT', x: 50, y: 50, rot: 0 },
        { order: 3, label: '未来', en: 'FUTURE', x: 76, y: 50, rot: 0 },
      ],
    },
    {
      id: 'holy_triangle',
      name: '圣三角牌阵',
      en: 'HOLY TRIANGLE',
      category: '综合 · 剖析',
      count: 3,
      cardScale: 1.02,
      brief: '经典三角结构，观照现状、深层动因与演进趋向',
      slots: [
        { order: 1, label: '现状核心', en: 'PRESENT', x: 50, y: 27, rot: 0 },
        { order: 2, label: '隐秘成因', en: 'CAUSE', x: 28, y: 71, rot: 0 },
        { order: 3, label: '未来趋向', en: 'OUTCOME', x: 72, y: 71, rot: 0 },
      ],
    },
    {
      id: 'two_choice',
      name: '二择一牌阵',
      en: 'TWO PATHS',
      category: '抉择 · 路径',
      count: 5,
      cardScale: 0.96,
      brief: '经典 V 字分叉布局，对照两条抉择路径的发展与归宿',
      slots: [
        { order: 1, label: '当下现状', en: 'CORE', x: 50, y: 78, rot: 0 },
        { order: 2, label: '方案A · 过程', en: 'PATH A', x: 33, y: 49, rot: -5 },
        { order: 3, label: '方案A · 结果', en: 'RESULT A', x: 20, y: 22, rot: -9 },
        { order: 4, label: '方案B · 过程', en: 'PATH B', x: 67, y: 49, rot: 5 },
        { order: 5, label: '方案B · 结果', en: 'RESULT B', x: 80, y: 22, rot: 9 },
      ],
    },
    {
      id: 'relation_mirror',
      name: '关系之镜',
      en: 'MIRROR OF BONDS',
      category: '情感 · 人际',
      count: 5,
      cardScale: 0.94,
      brief: '五牌镜像排布，映射己方心境、对方立场与关系连结',
      slots: [
        { order: 1, label: '你的心境', en: 'SELF', x: 22, y: 42, rot: 0 },
        { order: 2, label: '对方心境', en: 'OTHER', x: 78, y: 42, rot: 0 },
        { order: 3, label: '彼此连结', en: 'BOND', x: 50, y: 19, rot: 0 },
        { order: 4, label: '现实课题', en: 'CHALLENGE', x: 50, y: 50, rot: 0 },
        { order: 5, label: '共鸣走向', en: 'HORIZON', x: 50, y: 81, rot: 0 },
      ],
    },
    {
      id: 'hexagram',
      name: '六芒星牌阵',
      en: 'STAR OF SOLOMON',
      category: '深度 · 破局',
      count: 7,
      cardScale: 0.88,
      brief: '所罗门双三角交错布局加中心定局，适合复杂局面全貌梳理',
      slots: [
        { order: 1, label: '过去', en: 'PAST', x: 50, y: 16, rot: 0 },
        { order: 2, label: '现在', en: 'PRESENT', x: 73, y: 67, rot: 0 },
        { order: 3, label: '未来', en: 'FUTURE', x: 27, y: 67, rot: 0 },
        { order: 4, label: '应对建议', en: 'ADVICE', x: 50, y: 84, rot: 0 },
        { order: 5, label: '外界环境', en: 'OUTER', x: 27, y: 33, rot: 0 },
        { order: 6, label: '内心期许', en: 'INNER', x: 73, y: 33, rot: 0 },
        { order: 7, label: '最终归宿', en: 'OUTCOME', x: 50, y: 50, rot: 0 },
      ],
    },
    {
      id: 'venus_love',
      name: '维纳斯之爱',
      en: 'VENUS LOVE',
      category: '爱情 · 深度',
      count: 8,
      cardScale: 0.88,
      brief: '经典八牌情感阵，双列映照双方内心、态度与关系归宿',
      slots: [
        { order: 1, label: '己方想法', en: 'YOUR MIND', x: 24, y: 18, rot: 0 },
        { order: 2, label: '己方态度', en: 'YOUR HEART', x: 24, y: 50, rot: 0 },
        { order: 3, label: '己方现状', en: 'YOUR STATE', x: 24, y: 82, rot: 0 },
        { order: 4, label: '对方想法', en: 'THEIR MIND', x: 76, y: 18, rot: 0 },
        { order: 5, label: '对方态度', en: 'THEIR HEART', x: 76, y: 50, rot: 0 },
        { order: 6, label: '对方现状', en: 'THEIR STATE', x: 76, y: 82, rot: 0 },
        { order: 7, label: '关系阻碍', en: 'OBSTACLE', x: 50, y: 34, rot: 0 },
        { order: 8, label: '情感归宿', en: 'DESTINY', x: 50, y: 67, rot: 0 },
      ],
    },
    {
      id: 'celtic_cross',
      name: '凯尔特十字',
      en: 'CELTIC CROSS',
      category: '古典 · 权威',
      count: 10,
      cardScale: 0.86,
      brief: '最古老权威的十牌大阵：左侧圣十字（第2张横压交错）+ 右侧四阶权杖柱',
      slots: [
        { order: 1, label: '现状核心', en: 'PRESENT', x: 35, y: 50, rot: 0 },
        { order: 2, label: '阻碍 / 助力', en: 'CROSSING', x: 35, y: 50, rot: 90, isCrossing: true },
        { order: 3, label: '意识目标', en: 'CROWN', x: 35, y: 17, rot: 0 },
        { order: 4, label: '潜意识根基', en: 'ROOT', x: 35, y: 83, rot: 0 },
        { order: 5, label: '过往余韵', en: 'PAST', x: 15, y: 50, rot: 0 },
        { order: 6, label: '近景未来', en: 'NEAR FUTURE', x: 55, y: 50, rot: 0 },
        { order: 7, label: '自我姿态', en: 'SELF', x: 82, y: 86, rot: 0 },
        { order: 8, label: '外界映照', en: 'ENVIRONMENT', x: 82, y: 62, rot: 0 },
        { order: 9, label: '希望与畏惧', en: 'HOPES & FEARS', x: 82, y: 38, rot: 0 },
        { order: 10, label: '终局归宿', en: 'OUTCOME', x: 82, y: 14, rot: 0 },
      ],
    },
  ];

  function makeMiniDiagramSvg(spread) {
    const slots = spread.slots;
    const w = spread.count >= 8 ? 10.5 : (spread.count >= 5 ? 12.5 : 15.5);
    const h = w * 1.48;

    // Fine astronomical constellation threads linking reading order
    let threads = '';
    if (slots.length > 1) {
      const pts = slots.map(s => `${s.x},${s.y}`).join(' ');
      threads = `<polyline points="${pts}" fill="none" stroke="rgba(205, 174, 114, 0.22)" stroke-width="0.65" stroke-dasharray="1.6 2.2" />`;
    }

    // Subtle hairline observatory reticle in background
    const reticle = `
      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(205, 174, 114, 0.08)" stroke-width="0.55" />
      <line x1="8" y1="50" x2="92" y2="50" stroke="rgba(205, 174, 114, 0.06)" stroke-width="0.45" />
      <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(205, 174, 114, 0.06)" stroke-width="0.45" />
    `;

    const rects = slots.map((s, idx) => {
      const isAccent = s.isCrossing || idx === 0;
      const fill = s.isCrossing
        ? 'rgba(218, 184, 118, 0.28)'
        : (idx === 0 ? 'rgba(205, 174, 114, 0.14)' : 'rgba(12, 10, 16, 0.85)');
      const stroke = s.isCrossing
        ? 'rgba(244, 224, 174, 0.92)'
        : (idx === 0 ? 'rgba(226, 196, 134, 0.86)' : 'rgba(205, 174, 114, 0.56)');
      const x = s.x - w / 2;
      const y = s.y - h / 2;
      return `
        <g transform="rotate(${s.rot || 0} ${s.x} ${s.y})">
          <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="1" fill="${fill}" stroke="${stroke}" stroke-width="${isAccent ? '1.0' : '0.8'}" />
          <rect x="${(x + 1.4).toFixed(1)}" y="${(y + 1.4).toFixed(1)}" width="${(w - 2.8).toFixed(1)}" height="${(h - 2.8).toFixed(1)}" rx="0.4" fill="none" stroke="${stroke}" stroke-width="0.35" opacity="0.45" />
        </g>
      `;
    }).join('');
    return `<svg viewBox="0 0 100 100" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">${reticle}${threads}${rects}</svg>`;
  }

  return {
    list: SPREADS,
    getById(id) {
      return SPREADS.find(s => s.id === id) || SPREADS[1];
    },
    makeMiniDiagramSvg,
  };
})();
