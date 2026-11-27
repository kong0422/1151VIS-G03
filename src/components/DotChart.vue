<script setup>
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import { useTip } from '../utils/useTip'
import ChartTip from './ChartTip.vue'
import { KEYS, CAND, ACTUAL } from '../data/polls'
import { fmt } from '../utils/stats'

const props = defineProps({ rows: { type: Array, required: true } }) // 已排序
const el = ref(null)
const wrap = ref(null)
const { tip, show, hide } = useTip(wrap)

const tipOf = (r, k) => ({
  title: `${r.name}｜${CAND[k].name}`, sub: `訪問／公布：${r.field}`,
  rows: [
    { color: CAND[k].color, label: '民調', value: `${r.v[k].toFixed(2)}%` },
    { label: '實際開票', value: `${ACTUAL[k]}%` },
    { label: '誤差', value: `${fmt(r.err[k])} pp`, extra: r.err[k] > 0 ? '高估' : '低估', bold: true }
  ],
  notes: [`此機構三位候選人的平均絕對誤差 ${r.mae.toFixed(2)} pp`]
})

function draw() {
  const svg = d3.select(el.value)
  svg.selectAll('*').remove()
  hide()
  const W = 920, H = 380, m = { t: 16, r: 10, b: 34, l: 46 }
  svg.attr('viewBox', `0 0 ${W} ${H}`)
  const lim = Math.ceil(d3.max(props.rows, r => d3.max(KEYS, k => Math.abs(r.err[k])))) + 1
  const x = d3.scaleBand().domain(props.rows.map(r => r.short)).range([m.l, W - m.r]).padding(0.2)
  const y = d3.scaleLinear().domain([-lim, lim]).range([H - m.b, m.t])

  svg.append('rect').attr('x', m.l).attr('width', W - m.l - m.r)
    .attr('y', y(3)).attr('height', y(-3) - y(3)).attr('fill', 'var(--band)')
  svg.append('text').attr('x', W - m.r - 4).attr('y', y(3) + 14).attr('text-anchor', 'end')
    .text('±3 pp（一般抽樣誤差量級）')
  svg.append('g').selectAll('text').data(y.ticks(8)).join('text')
    .attr('x', m.l - 6).attr('y', d => y(d) + 4).attr('text-anchor', 'end')
    .text(d => (d > 0 ? '+' : '') + d)
  svg.append('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y(0)).attr('y2', y(0))
    .attr('stroke', 'var(--fg)').attr('stroke-dasharray', '4 3')

  props.rows.forEach(r => {
    const cx = x(r.short) + x.bandwidth() / 2
    svg.append('text').attr('x', cx).attr('y', H - 12).attr('text-anchor', 'middle').text(r.short)
    KEYS.forEach((k, i) => {
      const px = cx + (i - 1) * Math.min(18, x.bandwidth() / 3.2)
      svg.append('line').attr('x1', px).attr('x2', px).attr('y1', y(0)).attr('y2', y(r.err[k]))
        .attr('stroke', CAND[k].color).attr('stroke-width', 2).attr('opacity', 0.5)
      const dot = svg.append('circle').attr('cx', px).attr('cy', y(r.err[k])).attr('r', 6.5).attr('fill', CAND[k].color).style('pointer-events', 'none')
      // 加大的感應範圍，方便滑鼠移入
      svg.append('circle').attr('cx', px).attr('cy', y(r.err[k])).attr('r', 13).attr('fill', 'transparent')
        .on('pointerenter', ev => { dot.attr('r', 8.5).attr('stroke', 'var(--fg)').attr('stroke-width', 1.5); show(ev, tipOf(r, k)) })
        .on('pointermove', ev => show(ev, tipOf(r, k)))
        .on('pointerleave', () => { dot.attr('r', 6.5).attr('stroke', null); hide() })
    })
  })
}

onMounted(draw)
watch(() => props.rows, draw)
</script>

<template>
  <div ref="wrap" class="chart-wrap">
    <svg ref="el" role="img" aria-label="各家民調誤差散佈圖"></svg>
    <ChartTip :tip="tip" />
  </div>
</template>
