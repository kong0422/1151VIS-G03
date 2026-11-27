<script setup>
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import { useTip } from '../utils/useTip'
import ChartTip from './ChartTip.vue'
import { KEYS, CAND } from '../data/polls'

const props = defineProps({ rows: { type: Array, required: true } })
const el = ref(null)
const wrap = ref(null)
const { tip, show, hide } = useTip(wrap)

const tipOf = (r, active) => ({
  title: r.name, sub: '實際開票（三人合計＝100%）',
  rows: KEYS.map(k => ({ color: CAND[k].color, label: CAND[k].name, value: `${r.share[k].toFixed(1)}%`, extra: `${r.votes[k].toLocaleString()} 票`, bold: k === active })),
  notes: [`領先：${CAND[r.leader].name}，領先第二名 ${r.margin.toFixed(1)} 點`]
})

function draw() {
  const svg = d3.select(el.value)
  svg.selectAll('*').remove()
  hide()
  const rows = [...props.rows].sort((a, b) => b.share.chiang - a.share.chiang)
  const W = 920, rh = 30, m = { t: 8, r: 10, b: 28, l: 56 }, H = m.t + m.b + rows.length * rh
  svg.attr('viewBox', `0 0 ${W} ${H}`)
  const x = d3.scaleLinear().domain([0, 100]).range([m.l, W - m.r])
  const y = d3.scaleBand().domain(rows.map(r => r.name)).range([m.t, H - m.b]).padding(0.2)
  rows.forEach(r => {
    let acc = 0
    KEYS.forEach(k => {
      const v = r.share[k]
      svg.append('rect').attr('x', x(acc)).attr('y', y(r.name)).attr('width', x(acc + v) - x(acc)).attr('height', y.bandwidth())
        .attr('fill', CAND[k].color).attr('fill-opacity', 0.9)
        .on('pointerenter', function (ev) { d3.select(this).attr('stroke', 'var(--fg)').attr('stroke-width', 1.5); show(ev, tipOf(r, k)) })
        .on('pointermove', ev => show(ev, tipOf(r, k)))
        .on('pointerleave', function () { d3.select(this).attr('stroke', null); hide() })
      if (v > 9) svg.append('text').style('pointer-events', 'none').attr('x', (x(acc) + x(acc + v)) / 2).attr('y', y(r.name) + y.bandwidth() / 2 + 4)
        .attr('text-anchor', 'middle').style('fill', '#fff').style('font-size', '12px').style('font-weight', 600)
        .style('stroke', 'rgba(0,0,0,.4)').style('stroke-width', 2.5).style('paint-order', 'stroke').text(v.toFixed(1))
      acc += v
    })
    svg.append('text').attr('x', m.l - 8).attr('y', y(r.name) + y.bandwidth() / 2 + 4).attr('text-anchor', 'end').text(r.name)
  })
  svg.append('g').selectAll('text').data([0, 25, 50, 75, 100]).join('text')
    .attr('x', x).attr('y', H - 8).attr('text-anchor', 'middle').text(d => d + '%')
}
onMounted(draw)
watch(() => props.rows, draw)
</script>

<template>
  <div ref="wrap" class="chart-wrap">
    <svg ref="el" role="img" aria-label="各行政區實際得票率堆疊長條圖"></svg>
    <ChartTip :tip="tip" />
  </div>
</template>
