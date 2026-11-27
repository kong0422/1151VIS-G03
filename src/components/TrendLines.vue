<script setup>
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import { useTip } from '../utils/useTip'
import ChartTip from './ChartTip.vue'
import { TREND, TREND_X } from '../data/voters'

const el = ref(null)
const wrap = ref(null)
const { tip, show, hide } = useTip(wrap)

function tipOf(s, i) {
  const v = s.y[i]
  let prev = null
  for (let j = i - 1; j >= 0; j--) if (s.y[j] != null) { prev = j; break }
  const rows = [{ color: s.color, label: '支持度', value: `${v}%`, bold: true }]
  if (prev != null) {
    const d = v - s.y[prev]
    rows.push({ label: `較 ${TREND_X[prev]}`, value: `${d > 0 ? '+' : ''}${d} 點` })
  }
  return { title: s.name, sub: `調查時點：${TREND_X[i]}`, rows }
}
// 預設只顯示：20–29 歲三位候選人＋30–39 歲黃珊珊
const DEFAULT_ON = ['20–29 歲：蔣萬安', '20–29 歲：陳時中', '20–29 歲：黃珊珊', '30–39 歲：黃珊珊']
const visible = ref([...DEFAULT_ON])
const toggle = name => {
  visible.value = visible.value.includes(name) ? visible.value.filter(n => n !== name) : [...visible.value, name]
}
const reset = () => { visible.value = [...DEFAULT_ON] }
const showAll = () => { visible.value = TREND.map(s => s.name) }

function draw() {
  const svg = d3.select(el.value); svg.selectAll('*').remove()
  hide()
  const W = 920, H = 340, m = { t: 14, r: 20, b: 30, l: 44 }
  svg.attr('viewBox', `0 0 ${W} ${H}`)
  const x = d3.scalePoint().domain(TREND_X).range([m.l + 20, W - m.r - 20])
  const y = d3.scaleLinear().domain([0, 70]).range([H - m.b, m.t])
  svg.append('g').selectAll('line').data(y.ticks(7)).join('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y).attr('stroke', 'var(--line)')
  svg.append('g').selectAll('text').data(y.ticks(7)).join('text').attr('x', m.l - 6).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(d => d + '%')
  svg.append('g').selectAll('text').data(TREND_X).join('text').attr('x', x).attr('y', H - 8).attr('text-anchor', 'middle').text(d => d)

  const shown = TREND.filter(s => visible.value.includes(s.name))
  if (!shown.length) {
    svg.append('text').attr('x', W / 2).attr('y', H / 2).attr('text-anchor', 'middle').style('font-size', '14px').text('請點選上方圖例以顯示資料')
    return
  }
  shown.forEach(s => {
    const all = TREND_X.map((t, i) => ({ t, v: s.y[i] }))
    const pts = all.filter(p => p.v != null)
    const g = svg.append('g')
    // 缺值處斷線（不內插），只畫相鄰、都有數字的線段
    g.append('path').attr('d', d3.line().defined(d => d.v != null).x(d => x(d.t)).y(d => y(d.v))(all)).attr('fill', 'none')
      .attr('stroke', s.color).attr('stroke-width', 2.5).attr('stroke-dasharray', s.dash)
    pts.forEach(p => {
      const i = TREND_X.indexOf(p.t)
      const dot = g.append('circle').attr('cx', x(p.t)).attr('cy', y(p.v)).attr('r', 5).attr('fill', s.color).style('pointer-events', 'none')
      g.append('circle').attr('cx', x(p.t)).attr('cy', y(p.v)).attr('r', 13).attr('fill', 'transparent')
        .on('pointerenter', ev => { dot.attr('r', 7).attr('stroke', 'var(--fg)').attr('stroke-width', 1.5); show(ev, tipOf(s, i)) })
        .on('pointermove', ev => show(ev, tipOf(s, i)))
        .on('pointerleave', () => { dot.attr('r', 5).attr('stroke', null); hide() })
      g.append('text').style('pointer-events', 'none').attr('x', x(p.t)).attr('y', y(p.v) - 9).attr('text-anchor', 'middle').style('font-size', '11px').text(p.v)
    })
  })
}
onMounted(draw)
watch(visible, draw)
</script>

<template>
  <div class="legend trend-legend" role="group" aria-label="圖例（點擊可開關）">
    <button v-for="s in TREND" :key="s.name" type="button" class="lg-item" :class="{ off: !visible.includes(s.name) }"
      :aria-pressed="visible.includes(s.name)" @click="toggle(s.name)">
      <svg width="30" height="10" aria-hidden="true">
        <line x1="0" y1="5" x2="30" y2="5" :stroke="s.color" stroke-width="3" :stroke-dasharray="s.dash" />
        <circle cx="15" cy="5" r="4" :fill="s.color" />
      </svg>{{ s.name }}
    </button>
    <button type="button" class="lg-link" @click="showAll">全部顯示</button>
    <button type="button" class="lg-link" @click="reset">恢復預設</button>
  </div>
  <p class="note">點擊圖例可開關該條線。顏色＝候選人（藍：蔣萬安、綠：陳時中、黃：黃珊珊）；實線＝20–29 歲，虛線＝30–39 歲。游標移到圓點上可看詳細數字。</p>
  <div ref="wrap" class="chart-wrap">
    <svg ref="el" role="img" aria-label="TVBS 民調年齡層支持度趨勢"></svg>
    <ChartTip :tip="tip" />
  </div>
</template>
