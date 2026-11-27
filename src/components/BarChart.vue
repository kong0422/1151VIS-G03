<script setup>
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import { useTip } from '../utils/useTip'
import ChartTip from './ChartTip.vue'
import { KEYS, CAND, ACTUAL } from '../data/polls'
import { fmt } from '../utils/stats'

const props = defineProps({ rows: { type: Array, required: true } })
const el = ref(null)
const wrap = ref(null)
const { tip, show, hide } = useTip(wrap)

function tipOf(k, s, v) {
  if (s.actual) return {
    title: CAND[k].name, sub: '實際開票',
    rows: [{ color: CAND[k].color, label: '實際得票率', value: `${v.toFixed(2)}%` }],
    notes: ['三人合計 99.36%，其餘為其他候選人']
  }
  const err = v - ACTUAL[k]
  return {
    title: `${s.r.name}｜${CAND[k].name}`, sub: `訪問／公布：${s.r.field}`,
    rows: [
      { color: CAND[k].color, label: '民調', value: `${v.toFixed(2)}%` },
      { label: '實際開票', value: `${ACTUAL[k]}%` },
      { label: '誤差', value: `${fmt(err)} pp`, extra: err > 0 ? '高估' : '低估', bold: true }
    ]
  }
}

function draw() {
  const svg = d3.select(el.value)
  svg.selectAll('*').remove()
  hide()
  const W = 920, H = 430, m = { t: 16, r: 10, b: 118, l: 42 }
  svg.attr('viewBox', `0 0 ${W} ${H}`)
  const series = [...props.rows.map(r => ({ k: r.short, r })), { k: '實際開票', actual: true }]
  const x0 = d3.scaleBand().domain(KEYS).range([m.l, W - m.r]).paddingInner(0.1)
  const x1 = d3.scaleBand().domain(series.map(s => s.k)).range([0, x0.bandwidth()]).padding(0.08)
  const y = d3.scaleLinear().domain([0, 45]).range([H - m.b, m.t])

  svg.append('g').selectAll('line').data(y.ticks(9)).join('line')
    .attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y).attr('stroke', 'var(--line)')
  svg.append('g').selectAll('text').data(y.ticks(9)).join('text')
    .attr('x', m.l - 6).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(d => d + '%')

  KEYS.forEach(k => {
    const g = svg.append('g').attr('transform', `translate(${x0(k)},0)`)
    series.forEach(s => {
      const v = s.actual ? ACTUAL[k] : s.r.v[k]
      const bx = x1(s.k), bw = x1.bandwidth()
      g.append('rect').attr('x', bx).attr('y', y(v)).attr('width', bw).attr('height', y(0) - y(v))
        .attr('rx', 2).attr('fill', CAND[k].color).attr('opacity', s.actual ? 1 : 0.5)
        .attr('stroke', s.actual ? 'var(--fg)' : 'none').attr('stroke-width', 1.5)
        .on('pointerenter', function (ev) { d3.select(this).attr('stroke', 'var(--fg)').attr('stroke-width', 2.5); show(ev, tipOf(k, s, v)) })
        .on('pointermove', ev => show(ev, tipOf(k, s, v)))
        .on('pointerleave', function () { d3.select(this).attr('stroke', s.actual ? 'var(--fg)' : 'none').attr('stroke-width', 1.5); hide() })
      g.append('text').attr('x', bx + bw / 2).attr('y', y(v) - 4).attr('text-anchor', 'middle')
        .style('font-size', '10px').text(v.toFixed(1))
      g.append('text').attr('transform', `translate(${bx + bw / 2},${H - m.b + 12}) rotate(55)`)
        .style('font-weight', s.actual ? 700 : 400).style('fill', s.actual ? 'var(--fg)' : null).text(s.k)
    })
    g.append('text').attr('x', x0.bandwidth() / 2).attr('y', H - 6).attr('text-anchor', 'middle')
      .style('font-size', '14px').style('font-weight', 700).style('fill', CAND[k].color).text(CAND[k].name)
  })
}

onMounted(draw)
watch(() => props.rows, draw)
</script>

<template>
  <div ref="wrap" class="chart-wrap">
    <svg ref="el" role="img" aria-label="各家民調與實際開票分組長條圖"></svg>
    <ChartTip :tip="tip" />
  </div>
</template>
