"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const navItems = [
  ["数据", "#data"],
  ["为什么不择时", "#timing"],
  ["抗波动系统", "#system"],
];

type ChartPoint = {
  index: number;
  year: number;
  series: "纳斯达克 100" | "标普 500";
  value: number;
};

const stats = [
  { value: "14.0%", label: "纳斯达克 100 · 40 年年化", accent: "lime" },
  { value: "9.1%", label: "标普 500 · 40 年年化", accent: "orange" },
  { value: "100%", label: "持有 20 年以上的历史胜率", accent: "cream" },
];

const annualReturns = [
  [1986, 6.9, 14.6], [1987, 10.5, 2.0], [1988, 13.5, 12.4], [1989, 26.2, 27.3],
  [1990, -10.4, -6.6], [1991, 65.0, 26.3], [1992, 8.9, 4.5], [1993, 10.6, 7.1],
  [1994, 1.5, -1.5], [1995, 42.5, 34.1], [1996, 42.5, 20.3], [1997, 20.6, 31.0],
  [1998, 85.3, 26.7], [1999, 102.0, 19.5], [2000, -36.8, -10.1], [2001, -32.7, -13.0],
  [2002, -37.6, -23.4], [2003, 49.1, 26.4], [2004, 10.4, 9.0], [2005, 1.5, 3.0],
  [2006, 6.8, 13.6], [2007, 18.7, 3.5], [2008, -41.9, -38.5], [2009, 53.5, 23.5],
  [2010, 19.2, 12.8], [2011, 2.7, 0.0], [2012, 16.8, 13.4], [2013, 35.0, 29.6],
  [2014, 17.9, 11.4], [2015, 8.4, -0.7], [2016, 5.9, 9.5], [2017, 31.5, 19.4],
  [2018, -1.0, -6.2], [2019, 38.0, 28.9], [2020, 47.6, 16.3], [2021, 26.6, 26.9],
  [2022, -33.0, -19.4], [2023, 53.8, 24.2], [2024, 24.9, 23.3], [2025, 20.2, 16.4],
] as const;

const formatReturn = (value: number) => {
  const normalized = Math.abs(value) < 0.05 ? 0 : value;
  return `${normalized > 0 ? "+" : ""}${normalized.toFixed(1)}`;
};

const timingDetails = [
  {
    no: "01",
    title: "在市场中的时间，比买卖的时机重要",
    intro: "长期来看，大约只有 5% 的回报来自买卖时机，95% 来自资产配置和基金选择",
    points: [
      "只要把投资周期拉长，频繁折腾产生的佣金、汇率摩擦和税收成本，会持续蚕食复利",
      "试图抄底或止盈，最终收益往往不如简单、长期、低成本地持有",
    ],
  },
  {
    no: "02",
    title: "美股具有牛长熊短的物理属性",
    intro: "历史上，美股牛市平均接近 5 年，熊市平均不到 1 年",
    points: [
      "超过 80% 的时间，美股都在震荡上涨或创造新高",
      "选择持币等待暴跌，往往会错过上涨、分红和成分股更新带来的机会成本",
      "历史统计中，超过 70% 的时间一次性投入的表现优于分批建仓，因为长期向上的势头不会等人",
    ],
  },
  {
    no: "03",
    title: "短期预测股市，是不可能完成的任务",
    intro: "股市是一个庞大、复杂、无法稳定预测的混沌系统",
    points: [
      "即使是华尔街顶尖的专业基金经理，在 20 年窗口里也只有约 3% 能够持续击败简单的指数基金",
      "如果专业机构都很难做到，普通投资者更不应该把长期财富押在短期预测上",
    ],
  },
] as const;

const systemDetails = [
  {
    no: "A",
    title: "财务维度 · 构筑安全边际",
    intro: "投资的第一原则不是赚得最多，而是永远留在牌桌上",
    book: { mark: "L", title: "通往财富自由之路", author: "李笑来", insight: "永远不要押上全部" },
    points: [
    "永远不要押上全部：为了规避被清退、再无机会的终极风险，克制一瞬间的冲动比预测未来更重要",
    "准备 6–12 个月基本开支的紧急储备金，让自己不会在回撤底部被迫割肉套现",
    "拥有投资之外的稳定收入，不要让日常生活完全依赖股票涨跌，这样才能给投资款足够长的时间",
    ],
  },
  {
    no: "B",
    title: "认知维度 · 把回撤重新命名",
    intro: "美股的波动不是受罚，而是为了获得长期回报必须支付的入场费",
    book: { mark: "G", title: "聪明的投资者", author: "Benjamin Graham", insight: "市场先生的价格为你服务" },
    points: [
    "把回撤当作入场费：就像去游乐园需要买门票，知道价格之后就不会因为门票本身而惊慌",
    "拒绝为市场先生的疯癫买单：他的价格是为你服务的，不是来指导你的；极度悲观时，低价也可能意味着更多份额",
    "看透两个周期：短期像随机漫步，真正的长期趋势往往要拉到至少两个周期之后才会显现",
    ],
  },
  {
    no: "C",
    title: "实操维度 · 用定投战胜本能",
    intro: "定投不是为了预测底部，而是用固定规则把恐惧转化成份额",
    book: { mark: "M", title: "金钱心理学", author: "Morgan Housel", insight: "为计划赶不上变化做好预案" },
    points: [
    "2000 年互联网泡沫顶部进场：一次性投入约 6 年才实现盈利，按月定投约 3 年 5 个月走出熊市",
    "2008 年金融海啸顶部进场：一次性投入约 5 年 1 个月，定投约 2 年 4 个月扭亏为盈",
    "2022 年熊市顶部进场：一次性投入约 2 年，定投约 15 个月开始获得正收益",
    "股市中表现最好的往往是忘了自己有账户的人和不幸去世的人，因为他们没有频繁折腾",
    ],
  },
  {
    no: "D",
    title: "心智维度 · 让自己睡得安稳",
    intro: "控制情绪很难，但可以通过元认知和合适的配置，减少情绪对行动的支配",
    book: { mark: "M", title: "金钱心理学", author: "Morgan Housel", insight: "选择能让你晚上睡着的方案" },
    points: [
    "激活元认知：告诉自己“我知道我正在因为账户短期波动产生非理性的恐惧”，把注意力拉回财富全景",
    "记住“这，也将成为过去”：牛市狂热与熊市悲观都会过去，钟摆终究会摆回均值",
    "用能让你睡踏实的方式理财：如果天天因为回撤失眠，说明股票配置已经超过了自己的心理安全边际",
  ],
  },
] as const;

function AnnualReturnsSplitBars({ selectedPoint, onSelect, onOpenDetail }: { selectedPoint: ChartPoint | null; onSelect: (point: ChartPoint | null) => void; onOpenDetail: (point: ChartPoint) => void }) {
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const chartBounds = { left: 78, right: 972, top: 26, bottom: 300, min: -50, max: 110 };
  const renderPanel = (rows: readonly (readonly [number, number, number])[], startIndex: number, period: string) => {
    const chartX = (index: number) => chartBounds.left + (index / rows.length) * (chartBounds.right - chartBounds.left) + ((chartBounds.right - chartBounds.left) / rows.length) / 2;
    const chartY = (value: number) => chartBounds.top + ((chartBounds.max - value) / (chartBounds.max - chartBounds.min)) * (chartBounds.bottom - chartBounds.top);
    const zeroY = chartY(0);
    const barWidth = 15;
    const yearTicks = new Set([0, 4, 9, 14, 19]);
    return <article className="split-bar-card" key={period}><div className="split-bar-card-head"><strong>{period}</strong><span>年度价格收益</span></div><div className="split-bar-scroll"><svg className="split-bar-chart" viewBox="0 0 1000 360" role="img" aria-label={`${period} 纳斯达克 100 与标普 500 年度收益柱状图`}>
      {[-50, 0, 50, 100].map((value) => <g key={value}><line className={value === 0 ? "chart-zero-line" : "chart-grid-line"} x1={chartBounds.left} x2={chartBounds.right} y1={chartY(value)} y2={chartY(value)} /><text className="chart-axis-label" x="4" y={chartY(value) + 5}>{value > 0 ? `+${value}%` : `${value}%`}</text></g>)}
      {rows.map(([year, nasdaq, sp], localIndex) => { const index = startIndex + localIndex; const center = chartX(localIndex); const nasdaqSelected = selectedPoint?.index === index && selectedPoint.series === "纳斯达克 100"; const spSelected = selectedPoint?.index === index && selectedPoint.series === "标普 500"; const nasdaqTop = Math.min(zeroY, chartY(nasdaq)); const nasdaqHeight = Math.abs(zeroY - chartY(nasdaq)); const spTop = Math.min(zeroY, chartY(sp)); const spHeight = Math.abs(zeroY - chartY(sp)); const nasdaqPoint = { index, year, series: "纳斯达克 100" as const, value: nasdaq }; const spPoint = { index, year, series: "标普 500" as const, value: sp }; const selectNasdaq = () => { onSelect(nasdaqPoint); onOpenDetail(nasdaqPoint); }; const selectSp = () => { onSelect(spPoint); onOpenDetail(spPoint); }; const activateWithKeyboard = (event: React.KeyboardEvent<SVGRectElement>, select: () => void) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(); } }; return <g key={year}><rect className={`chart-bar chart-bar-blue${nasdaqSelected ? " is-selected" : ""}`} x={center - barWidth - 2} y={nasdaqTop} width={barWidth} height={Math.max(nasdaqHeight, 2)} rx="2" tabIndex={0} role="button" aria-label={`${year} 纳斯达克 100 ${formatReturn(nasdaq)}%`} onClick={selectNasdaq} onKeyDown={(event) => activateWithKeyboard(event, selectNasdaq)} onMouseEnter={() => setHoveredPoint(nasdaqPoint)} onMouseLeave={() => setHoveredPoint(null)} onFocus={() => setHoveredPoint(nasdaqPoint)} onBlur={() => setHoveredPoint(null)}><title>{`${year} 纳斯达克 100：${formatReturn(nasdaq)}%`}</title></rect><rect className={`chart-bar chart-bar-orange${spSelected ? " is-selected" : ""}`} x={center + 2} y={spTop} width={barWidth} height={Math.max(spHeight, 2)} rx="2" tabIndex={0} role="button" aria-label={`${year} 标普 500 ${formatReturn(sp)}%`} onClick={selectSp} onKeyDown={(event) => activateWithKeyboard(event, selectSp)} onMouseEnter={() => setHoveredPoint(spPoint)} onMouseLeave={() => setHoveredPoint(null)} onFocus={() => setHoveredPoint(spPoint)} onBlur={() => setHoveredPoint(null)}><title>{`${year} 标普 500：${formatReturn(sp)}%`}</title></rect><text className={`chart-value-label chart-value-blue${nasdaqSelected ? " is-selected" : ""}`} x={center - barWidth / 2 - 2} y={nasdaq >= 0 ? nasdaqTop - 8 : nasdaqTop + nasdaqHeight + 17} textAnchor="middle">{formatReturn(nasdaq)}%</text><text className={`chart-value-label chart-value-orange${spSelected ? " is-selected" : ""}`} x={center + barWidth / 2 + 2} y={sp >= 0 ? spTop - 8 : spTop + spHeight + 17} textAnchor="middle">{formatReturn(sp)}%</text></g>; })}
      {rows.map(([year], localIndex) => yearTicks.has(localIndex) && <text className="chart-year-label" key={year} x={chartX(localIndex)} y="344" textAnchor="middle">{year}</text>)}
    </svg></div></article>;
  };
  return (
    <div className="annual-returns-split-bars">
      <div className="split-bars-legend"><span><i className="legend-blue" /> 纳斯达克 100</span><span><i className="legend-orange" /> 标普 500</span><small>点击柱体放大数字 · 上下两图合计 40 年</small></div>
      {renderPanel(annualReturns.slice(0, 20), 0, "1986 — 2005")}
      {renderPanel(annualReturns.slice(20), 20, "2006 — 2025")}
      <div className="chart-touch-note">点击柱体查看该年份详情</div>
      {(hoveredPoint || selectedPoint) && <div className="chart-focus-detail" aria-live="polite"><small>{hoveredPoint ? "悬停预览" : "已固定"}</small><span>{(hoveredPoint || selectedPoint)?.year}</span><strong>{(hoveredPoint || selectedPoint)?.series}</strong><b>{(hoveredPoint || selectedPoint)?.value && (hoveredPoint || selectedPoint)!.value > 0 ? "+" : ""}{(hoveredPoint || selectedPoint)?.value.toFixed(1)}%</b>{selectedPoint && !hoveredPoint && <button onClick={() => onSelect(null)}>清除聚焦</button>}</div>}
    </div>
  );
}

const scenarios = [
  { year: "2000", event: "互联网泡沫顶部", lump: "6 年", dca: "3 年 5 个月", tone: "red" },
  { year: "2008", event: "金融海啸顶部", lump: "5 年 1 个月", dca: "2 年 4 个月", tone: "orange" },
  { year: "2022", event: "熊市顶部", lump: "2 年", dca: "15 个月", tone: "lime" },
];

type DetailContent = {
  eyebrow: string;
  title: string;
  metric?: string;
  metricExplanation?: string;
  sourceNote?: string;
  body: string;
  points: readonly string[];
  takeaway: string;
};

const principleDetails: Record<"time" | "cycle" | "forecast", DetailContent> = {
  time: {
    eyebrow: "为什么不择时 / 01",
    title: "时间比时机重要",
    metric: "95%",
    metricExplanation: "这里的 95% 指的是长期回报中，资产配置和基金选择的重要性远高于某一次买入时点。它不是每年固定的 95%，也不是收益保证。",
    sourceNote: "这是原文中的经验性观点数字；原始文档未注明统计来源，本页不把它当作年度收益图表的计算结果。",
    body: "95% 不是说每年的收益都由配置决定，也不是一条保证收益的公式。它想表达的是：拉长周期之后，资产配置、持有时间和基金选择，通常比某一次买入是否刚好在最低点更重要。",
    points: ["频繁买卖会带来手续费、汇率摩擦和税收成本", "等待所谓完美买点，本身也会产生错过上涨的机会成本", "真正能被普通投资者控制的，是投入计划、持有时间和风险承受范围"],
    takeaway: "不要把长期计划建立在一次预测成功上，把时间留在市场里。",
  },
  cycle: {
    eyebrow: "为什么不择时 / 02",
    title: "牛长熊短，不等于没有回撤",
    metric: "牛市约 5 年 / 熊市不到 1 年",
    metricExplanation: "这两个数字是历史阶段的平均持续时间，用来描述上涨和下跌的时间结构，不代表每一轮牛市或熊市都会严格持续这么久。",
    sourceNote: "这是原文中的历史经验性表述；原始文档未注明具体样本、区间和统计来源。",
    body: "牛长熊短描述的是长期市场的时间结构：上涨阶段往往持续更久，下跌阶段通常更集中。它不是说市场不会下跌，而是提醒你不要为了等待短暂的熊市，错过更长的增长阶段。",
    points: ["上涨和回撤会交替出现，但持续时间并不对称", "长期空仓等待，会同时放弃上涨、分红和指数成分更新", "更实用的做法是提前设计能承受回撤的仓位和现金流"],
    takeaway: "不要用短期恐惧，交换长期缺席。",
  },
  forecast: {
    eyebrow: "为什么不择时 / 03",
    title: "预测几乎不可能",
    metric: "3%",
    metricExplanation: "3% 指的是在 20 年窗口里，能够持续击败简单指数基金的专业经理人比例。它说明长期稳定择时和选股非常困难，不是说 97% 的投资者一定亏损。",
    sourceNote: "这是原文中的经验性观点数字；原始文档未注明统计来源，本页不把它当作年度收益图表的计算结果。",
    body: "3% 用来说明：即使是专业投资者，想在很长的时间窗口里持续击败简单的指数基金，也是一件极难的事。普通投资者更不应该把长期财富押在短期判断上。",
    points: ["短期市场同时受到估值、情绪、政策和突发事件影响", "一次判断正确，不代表下一次还能重复", "指数化和纪律化的价值，在于减少对单次预测的依赖"],
    takeaway: "承认不可预测，反而能把精力放到真正可控制的事情上。",
  },
};

function getMetricDetail(stat: (typeof stats)[number]): DetailContent {
  const isNasdaq = stat.accent === "lime";
  const isSp = stat.accent === "orange";
  return {
    eyebrow: "数据摘要 / 40 年年化",
    title: stat.label.split(" · ")[0],
    metric: stat.value,
    metricExplanation: isNasdaq
      ? "14.0% 指的是 1986–2025 这 40 个完整自然年里，纳斯达克 100 的年化价格收益率，按复合年化口径理解，不含股息。它不是每年都上涨 14.0%。"
      : isSp
        ? "9.1% 指的是 1986–2025 这 40 个完整自然年里，标普 500 的年化价格收益率，按复合年化口径理解，不含股息。它不是每年固定赚 9.1%。"
        : "100% 指的是历史统计中，持有超过 20 年的窗口最终为正收益的比例。它不是一年收益 100%，也不代表未来收益可以被保证。",
    sourceNote: isNasdaq || isSp
      ? "数据口径：1986–2025 完整自然年，指数价格收益率，不含股息；数据源：Yahoo Finance。"
      : "页面保留原文的历史胜率口径；原始文档未注明具体指数、滚动窗口数量和统计来源。",
    body: isNasdaq
      ? "纳斯达克 100 的长期年化回报更高，但这份回报来自更大的波动和更深的阶段性回撤。它适合能承受较大波动、并且愿意长期持有的人。"
      : isSp
        ? "标普 500 的长期年化回报相对温和，但行业分布更广、组合更均衡。它更像是长期组合的基础，而不是追求短期刺激的工具。"
        : "持有超过 20 年的历史胜率达到 100%，这里强调的是时间对短期波动的稀释作用，不代表未来收益可以被保证。",
    points: isNasdaq
      ? ["更高的长期回报，伴随更明显的年度波动", "需要提前确认自己能否在深度回撤中继续持有", "不要因为过去的高回报，反推出未来每年都会如此"]
      : isSp
        ? ["行业和公司分布更广，组合波动相对平滑", "适合作为长期资产配置的底座", "更稳不等于不会下跌，回撤仍然是长期投资的一部分"]
        : ["20 年以上的时间窗口能显著降低单一年份的影响", "历史胜率不是收益承诺", "真正重要的是资金不会在最差的时点被迫离场"],
    takeaway: isNasdaq ? "追求更高回报之前，先确认自己能承受对应的波动。" : isSp ? "把组合做得更稳，才能给复利足够长的时间。" : "时间不是消除风险，而是给系统恢复的机会。",
  };
}

function getSystemDetail(detail: (typeof systemDetails)[number]): DetailContent {
  return {
    eyebrow: `抗波动系统 / ${detail.no}`,
    title: detail.title,
    body: detail.intro,
    points: detail.points,
    takeaway: detail.no === "A" ? "先保证不会被迫离场，再谈长期收益。" : detail.no === "B" ? "把回撤重新命名，才能避免被情绪重新定义。" : detail.no === "C" ? "把动作写成规则，减少临场决策。" : "如果一个方案让你长期失眠，它就不是适合你的方案。",
  };
}

function getTimingDetail(detail: (typeof timingDetails)[number]): DetailContent {
  const metric = detail.no === "01" ? "95% 的回报来自配置与选择" : detail.no === "02" ? "牛市约 5 年 / 熊市不到 1 年" : "约 3% 的专业经理人长期跑赢指数";
  const metricExplanation = detail.no === "01"
    ? "这里的 95% 是原文用来强调资产配置和基金选择重要性的经验性比例，不是每年固定的收益拆分，也不是收益保证。"
    : detail.no === "02"
      ? "这里的 5 年和不到 1 年描述历史上涨、下跌阶段的平均时间结构，不代表每一轮市场都会严格按照这个时长运行。"
      : "这里的 3% 指原文所说的 20 年窗口中能够持续击败简单指数基金的专业经理人比例，不代表普通投资者中有 97% 必然亏损。";
  return {
    eyebrow: `为什么不择时 / ${detail.no}`,
    title: detail.title,
    metric,
    metricExplanation,
    sourceNote: "这是原文中的经验性观点数字；原始文档未注明具体统计来源，本页不把它当作年度收益图表的计算结果。",
    body: detail.intro,
    points: detail.points,
    takeaway: detail.no === "01" ? "先把持有时间拉长，再讨论买入时点。" : detail.no === "02" ? "不要为了等一次下跌，错过更长的上涨周期。" : "放弃短期预测，换取一套可以重复执行的长期规则。",
  };
}

function getBookDetail(detail: (typeof systemDetails)[number]): DetailContent {
  return {
    eyebrow: `相关书籍 / ${detail.no}`,
    title: detail.book.title,
    body: `${detail.book.author} 的这条观点，放在“${detail.title}”旁边，是为了说明这层系统如何从理念变成具体动作。`,
    points: [detail.book.insight, detail.intro, "书籍是理解框架的入口，真正需要执行的是与你的现金流和风险承受能力匹配的规则"],
    takeaway: `把“${detail.book.insight}”翻译成一条你愿意长期执行的规则。`,
  };
}

const recentPerformanceDetail: DetailContent = {
  eyebrow: "数据摘要 / 最近 10 年",
  title: "更高回报，也对应更大波动",
  metric: "纳斯达克 100 约 450% / 标普 500 约 235%",
  metricExplanation: "这两个数字指的是 2016–2025 年期间的累计价格涨幅，不是年化收益率，也不包含股息。累计涨幅不能直接理解为每年平均上涨同样的比例。",
  sourceNote: "数据口径：2016–2025 完整自然年，按年度价格收益率复合计算，不含股息；数据源：Yahoo Finance。",
  body: "最近 10 年科技成长股表现更强，所以纳斯达克 100 的累计涨幅明显高于标普 500。但这段结果不能简单外推到下一个 10 年。",
  points: ["累计涨幅描述的是起点到终点的整体变化", "期间的年度涨跌仍然可能非常剧烈", "高回报与高波动需要同时看，不能只看其中一个数字"],
  takeaway: "先理解数字的口径，再决定它是否适合你的长期组合。",
};

function getScenarioDetail(scenario: (typeof scenarios)[number]): DetailContent {
  return {
    eyebrow: `历史案例 / ${scenario.year}`,
    title: scenario.event,
    metric: `一次性 ${scenario.lump} · 定投 ${scenario.dca}`,
    metricExplanation: `这里的 ${scenario.lump} 和 ${scenario.dca} 都是“从高位进场到重新回到盈利”所需要的大致时间：一次性投入约 ${scenario.lump}，每月定投约 ${scenario.dca}。它们不是收益率，也不是保证未来一定按这个时间恢复。`,
    sourceNote: "这是页面文稿中的历史案例估算，用来对比恢复路径；不是年度收益图表直接计算出的收益率。",
    body: "这组数字比较的是从高位进场后，重新回到盈利所需要的时间。它不是在判断哪种方式永远更好，而是在展示不同方式如何影响等待过程。",
    points: [`一次性投入：约 ${scenario.lump} 回到盈利`, `每月定投：约 ${scenario.dca} 回到盈利`, "定投可能降低一次性投入带来的心理压力，但也可能牺牲部分长期期望收益"],
    takeaway: "适合你的方案，不是数学上最漂亮的方案，而是你能在回撤中坚持的方案。",
  };
}

function getChartDetail(point: ChartPoint): DetailContent {
  const isNegative = point.value < 0;
  return {
    eyebrow: `年度数据 / ${point.year}`,
    title: isNegative ? "下跌年份，不是长期结论" : "上涨年份，也不是永久答案",
    metric: `${point.series} ${formatReturn(point.value)}%`,
    metricExplanation: `${point.year} 年的 ${formatReturn(point.value)}% 指的是 ${point.series} 当年的价格收益率：正数代表年末价格高于年初，负数代表年末价格低于年初；不含股息，也不等于长期年化收益率。`,
    sourceNote: "数据口径：完整自然年，指数价格收益率，不含股息；数据源：Yahoo Finance。",
    body: isNegative ? "单个年份的回撤会非常刺眼，但它只代表这个年份发生了什么，不代表长期持有的最终结果。图表的价值，是让你看到波动真实存在，而不是用某一年预测全部未来。" : "单个年份的上涨同样不能被简单外推。长期投资依赖的是多个年份叠加后的复利，而不是押中某一个好年份。",
    points: ["这是价格收益率，不含股息", `当年 ${point.series} 的价格收益为 ${formatReturn(point.value)}%`, "观察完整周期，比放大某一个年份更重要"],
    takeaway: isNegative ? "提前为回撤准备规则，才能避免在最差的年份临时改变计划。" : "不要因为上涨而追高，也不要因为错过上涨而临时改变系统。",
  };
}

function DetailModal({ detail, onClose }: { detail: DetailContent | null; onClose: () => void }) {
  const modalRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const hasDetail = detail !== null;

  useEffect(() => {
    if (!hasDetail) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const modal = modalRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !modal) return;
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"));
      if (!focusable.length) {
        event.preventDefault();
        modal.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus();
      returnFocusRef.current = null;
    };
  }, [hasDetail, onClose]);

  if (!detail) return null;
  return <div className="detail-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={modalRef} className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title" tabIndex={-1}>
      <div className="detail-modal-topline"><span>{detail.eyebrow}</span><button ref={closeButtonRef} type="button" className="detail-modal-close" onClick={onClose} aria-label="关闭详情">×</button></div>
      <h2 id="detail-modal-title">{detail.title}</h2>
      {detail.metric && <><div className="detail-modal-metric">{detail.metric}</div>{detail.metricExplanation && <div className="detail-modal-data-note"><p>{detail.metricExplanation}</p></div>}</>}
      {detail.sourceNote && <p className="detail-modal-source">{detail.sourceNote}</p>}
      <p className="detail-modal-body">{detail.body}</p>
      <ul className="detail-modal-points">{detail.points.map((point) => <li key={point}>{point}</li>)}</ul>
      <div className="detail-modal-takeaway"><span>给长期投资者</span><strong>{detail.takeaway}</strong></div>
    </section>
  </div>;
}

function ArrowIcon() {
  return <span aria-hidden="true" className="arrow-icon">↗</span>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dataView, setDataView] = useState<"all" | "recent" | "takeaway">("all");
  const [expanded, setExpanded] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<ChartPoint | null>(null);
  const [activeNav, setActiveNav] = useState("data");
  const [heroFocus, setHeroFocus] = useState<"nasdaq" | "sp" | null>(null);
  const [expandedSystemLayer, setExpandedSystemLayer] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0].year);
  const [modalDetail, setModalDetail] = useState<DetailContent | null>(null);

  const openDetail = useCallback((detail: DetailContent) => setModalDetail(detail), []);
  const closeDetail = useCallback(() => setModalDetail(null), []);

  useEffect(() => {
    const sections = navItems
      .map(([, href]) => document.querySelector(href))
      .filter((section): section is Element => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveNav(visible.target.id);
    }, { rootMargin: "-18% 0px -62% 0px", threshold: [0.1, 0.35, 0.7] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <header className="site-header">
        <a href="#top" className="brand" aria-label="回到首页">
          <span className="brand-mark">∿</span>
          <span>小虎柴柴长期投资策略 <em>/ 01</em></span>
        </a>
        <button
          className="menu-toggle"
          aria-label={menuOpen ? "关闭导航" : "打开导航"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
        <nav className={menuOpen ? "nav-links is-open" : "nav-links"} aria-label="主导航">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} className={activeNav === href.slice(1) ? "is-active" : ""} onClick={() => { setMenuOpen(false); setActiveNav(href.slice(1)); }}>{label}</a>
          ))}
        </nav>
      </header>

      <section id="top" className="hero page-shell">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> INDEX INVESTING / 1986—2025</p>
          <h1>让复利跑<br /><span>先让自己睡得着</span></h1>
          <p className="hero-lede">一份写给普通投资者的美股宽基指南：不猜顶底，用结构接住波动，把“想做对”变成“能坚持”</p>
          <div className="hero-actions">
            <a href="#data" className="button button-dark">先看 40 年数据 <ArrowIcon /></a>
            <a href="#system" className="text-link">我正在经历回撤 <span>↓</span></a>
          </div>
          <div className="hero-footnote"><span>阅读时间 08 min</span><span className="divider" /><span>适合：长期资金 / 第一次配置</span></div>
          <div className="author-byline"><span className="author-avatar">虎</span><div><small>AUTHOR / 作者</small><strong>小虎柴柴</strong></div></div>
        </div>
        <div className="hero-visual" aria-label="指数投资的长期增长与短期波动示意图">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="visual-label label-top">LONG TERM<br /><strong>∞</strong></div>
          <div className="visual-label label-bottom">SHORT TERM<br /><strong>↘ ↗</strong></div>
          <div className="growth-line"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <button type="button" className={`hero-index-card card-tech${heroFocus === "nasdaq" ? " is-selected" : ""}`} aria-pressed={heroFocus === "nasdaq"} onClick={() => { setHeroFocus("nasdaq"); openDetail(getMetricDetail(stats[0])); }}><span>纳斯达克 100</span><strong>+14.0%</strong><small>40 年年化</small><div className="mini-spark spark-green"><i /><i /><i /><i /><i /><i /><i /></div></button>
          <button type="button" className={`hero-index-card card-sp${heroFocus === "sp" ? " is-selected" : ""}`} aria-pressed={heroFocus === "sp"} onClick={() => { setHeroFocus("sp"); openDetail(getMetricDetail(stats[1])); }}><span>标普 500</span><strong>+9.1%</strong><small>40 年年化</small><div className="mini-spark spark-orange"><i /><i /><i /><i /><i /><i /><i /></div></button>
          <span className="visual-caption" aria-live="polite">{heroFocus === "nasdaq" ? "纳斯达克 100 / 更高回报，也要承受更深波动" : heroFocus === "sp" ? "标普 500 / 让组合更稳，而不是让人兴奋" : "图 01 / 时间是优势，波动是成本"}</span>
        </div>
      </section>

      <section className="statement-strip">
        <div className="page-shell statement-inner">
          <p className="section-kicker">先说结论</p>
          <div className="statement-list">
            <p className="statement"><span>结论一</span>你不需要预测下一次下跌</p>
            <p className="statement"><span>结论二</span><strong>你需要的是一套能穿过下跌的系统</strong></p>
          </div>
          <span className="statement-side">THE POINT IS NOT TO BE RIGHT.<br /><b>THE POINT IS TO STAY IN.</b></span>
        </div>
      </section>

      <section id="data" className="section data-section"><div className="page-shell">
        <div className="section-heading split-heading">
          <div><p className="section-kicker">数据先说话 <span>02</span></p><h2>收益和波动，<br /><em>从来是一对</em></h2></div>
          <p className="heading-note">过去 40 年，纳斯达克 100 有更高的长期回报，也经历过更深的回撤 · 标普 500 的角色，是让组合更稳，而不是让人兴奋</p>
        </div>
        <div className="data-dashboard">
          <div className="chart-panel">
            <div className="chart-topline"><div><span className="chart-label">ANNUAL PRICE RETURNS / YEAR-BY-YEAR BARS</span><h3>年度收益分布：横向比较每一年</h3></div></div>
            <AnnualReturnsSplitBars selectedPoint={selectedPoint} onSelect={setSelectedPoint} onOpenDetail={(point) => openDetail(getChartDetail(point))} />
            <p className="source-note">数据口径：1986–2025 完整自然年，指数价格收益率，不含股息 · 数据源：Yahoo Finance</p>
          </div>
          <aside className="metric-stack">
            {stats.map((stat) => <button type="button" className={`metric-card metric-${stat.accent}`} key={stat.label} onClick={() => openDetail(getMetricDetail(stat))}><strong>{stat.value}</strong><span>{stat.label}</span></button>)}
            <button type="button" className="metric-note" onClick={() => openDetail(recentPerformanceDetail)} aria-label="查看最近十年收益对比的详细解释"><span className="note-icon">↗</span><p>近十年（2016–2025）纳斯达克 100 累计上涨约 <b>450%</b>，标普 500 约 <b>235%</b> · 科技成长股占优，但波动也更极端</p></button>
          </aside>
        </div>
        <div className="data-tabs" role="tablist" aria-label="数据摘要">
          {([['all', '40 年全景'], ['recent', '最近 10 年'], ['takeaway', '怎么读这张图']] as const).map(([key, label]) => <button key={key} className={dataView === key ? "is-active" : ""} onClick={() => setDataView(key)} role="tab" aria-selected={dataView === key}>{label}</button>)}
        </div>
        <div className="data-takeaway" role="tabpanel">
          {dataView === "all" && <><strong>40 年的主旋律：</strong>纳斯达克 100 有 33 年上涨、7 年下跌；标普 500 有 30 年上涨、10 年下跌</>}
          {dataView === "recent" && <><strong>最近 10 年的主旋律：</strong>两者都是 8 涨 2 跌；纳斯达克 100 累计上涨约 450%，标普 500 约 235%，更高回报也对应更大的波动</>}
          {dataView === "takeaway" && <><strong>正确的读法：</strong>40 年里，纳斯达克 100 有 82.5% 的年份上涨，标普 500 有 75% 的年份上涨；这说明长期持有的胜率更重要，而不是猜中某一年</>}
        </div>
      </div></section>

      <section id="timing" className="section dark-section">
        <div className="page-shell">
          <div className="section-heading split-heading light-heading"><div><p className="section-kicker">问题一 <span>03</span></p><h2>买入美股，<br /><em>需要择时吗</em></h2></div><p className="heading-note">短答案：不需要 · 长答案，是下面三个底层逻辑</p></div>
          <div className="principle-grid">
            <article className="principle-card"><span className="card-index">01 / 03</span><button type="button" className="principle-number" onClick={() => openDetail(principleDetails.time)} aria-label="查看 95% 的详细解释">95<span>%</span></button><h3>时间比时机重要</h3><p>长期回报更多来自资产配置和基金选择，而不是那一次“刚好买在低点”</p><div className="principle-card-actions"><a href="#system">把动作写成纪律 <ArrowIcon /></a><button type="button" onClick={() => openDetail(principleDetails.time)}>查看解释 <ArrowIcon /></button></div></article>
            <article className="principle-card featured-principle"><span className="card-index">02 / 03</span><button type="button" className="wave-word" onClick={() => openDetail(principleDetails.cycle)} aria-label="查看牛长熊短的详细解释">牛长<br /><i>熊短</i></button><h3>美股的物理属性</h3><p>牛市平均接近 5 年，熊市平均不到 1 年 · 等待暴跌，本身就是一种昂贵的择时</p><div className="principle-card-actions"><a href="#data">回到数据 <ArrowIcon /></a><button type="button" onClick={() => openDetail(principleDetails.cycle)}>查看解释 <ArrowIcon /></button></div></article>
            <article className="principle-card"><span className="card-index">03 / 03</span><button type="button" className="principle-number" onClick={() => openDetail(principleDetails.forecast)} aria-label="查看 3% 的详细解释">3<span>%</span></button><h3>预测几乎不可能</h3><p>20 年窗口里，只有约 3% 的专业经理人能持续击败简单的指数基金</p><div className="principle-card-actions"><a href="#system">去看应对方案 <ArrowIcon /></a><button type="button" onClick={() => openDetail(principleDetails.forecast)}>查看解释 <ArrowIcon /></button></div></article>
          </div>
          <div className="timing-detail-grid">
            {timingDetails.map((detail) => <article className="timing-detail" key={detail.no}><span className="detail-no">{detail.no}</span><h3>{detail.title}</h3><p className="detail-intro">{detail.intro}</p><ul>{detail.points.map((point) => <li key={point}>{point}</li>)}</ul><button type="button" className="timing-detail-link" onClick={() => openDetail(getTimingDetail(detail))}>查看这条逻辑 <ArrowIcon /></button></article>)}
          </div>
          <div className="quote-line"><span>KEN FISHER</span><blockquote>“在市场中的时间，比买卖的时机更重要”</blockquote><span className="quote-mark">”</span></div>
        </div>
      </section>

      <section id="system" className="section system-section"><div className="page-shell">
          <div className="section-heading split-heading"><div><p className="section-kicker">问题二 <span>04</span></p><h2>回撤来了，<br /><em>四层缓冲接住它</em></h2></div><p className="heading-note">真正的抗波动，不是练成没有情绪的人，而是提前把情绪可能破坏的地方，变成规则</p></div>
        <div className="system-detail-grid">
          {systemDetails.map((detail) => { const isOpen = expandedSystemLayer === detail.no; return <article className={`system-detail${isOpen ? " is-expanded" : ""}`} key={detail.no}><button type="button" className="system-detail-head detail-head-button" onClick={() => openDetail(getSystemDetail(detail))} aria-label={`查看${detail.title}详细解释`}><h3>{detail.title}</h3><span className="system-layer-mark">{detail.no}</span></button><p>{detail.intro}</p><button type="button" className="inline-book" onClick={() => openDetail(getBookDetail(detail))} aria-label={`查看${detail.book.title}相关解释`}><span className="inline-book-mark">{detail.book.mark}</span><span><b>{detail.book.title}</b><small>{detail.book.author}</small></span><em>“{detail.book.insight}”</em></button><button type="button" className="detail-toggle" aria-expanded={isOpen} onClick={() => { setExpandedSystemLayer(isOpen ? null : detail.no); openDetail(getSystemDetail(detail)); }}>{isOpen ? "收起规则" : `查看 ${detail.points.length} 条规则`}<span>{isOpen ? "↑" : "↓"}</span></button><div className={`system-points${isOpen ? " is-open" : ""}`} aria-hidden={!isOpen}><ul>{detail.points.map((point) => <li key={point}>{point}</li>)}</ul></div></article>; })}
        </div>
      </div></section>

      <section className="section cream-section">
        <div className="page-shell scenario-layout">
          <div className="scenario-intro"><p className="section-kicker">让历史演示一次 <span>05</span></p><h2>同一个起点，<br /><em>两种走法</em></h2><p>一次性买入在长期期望值上通常更高，但定投能缩短“从恐惧回到盈利”的心理距离 · 适合你的，才是更好的方案</p><button className="button button-dark small-button" onClick={() => setExpanded((value) => !value)}>{expanded ? "收起解释" : "展开这组对比"} <span>{expanded ? "↑" : "↓"}</span></button></div>
          <div className="scenario-table-wrap"><div className="scenario-table-head"><span>历史进场点</span><span>一次性投入</span><span>每月定投</span></div>{scenarios.map((scenario) => <button type="button" className={`scenario-row row-${scenario.tone}${selectedScenario === scenario.year ? " is-selected" : ""}`} key={scenario.year} aria-pressed={selectedScenario === scenario.year} onClick={() => { setSelectedScenario(scenario.year); openDetail(getScenarioDetail(scenario)); }}><div><strong>{scenario.year}</strong><span>{scenario.event}</span></div><div><span className="table-label">回到盈利</span><b>{scenario.lump}</b></div><div><span className="table-label">回到盈利</span><b>{scenario.dca}</b></div></button>)}{expanded && <div className="table-footnote">定投不是为了战胜所有一次性投入，而是把“我可能买错了”的恐惧，分散到时间里 · 它尤其适合现金流稳定、但面对一次性投入容易失眠的人</div>}</div>
        </div>
      </section>

      <footer className="footer page-shell"><span>小虎柴柴长期投资策略 / 01</span><span>一份关于时间、波动和睡眠的记录</span><a href="#top">回到顶部 ↑</a></footer>
      <DetailModal detail={modalDetail} onClose={closeDetail} />
    </main>
  );
}
