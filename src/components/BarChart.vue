<script setup>
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import { KEYS, CAND, ACTUAL } from '../data/polls'

const props = defineProps({ rows: { type: Array, required: true } })
const el = ref(null)

function draw() {
  const svg = d3.select(el.value)
  svg.selectAll('*').remove()
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
        .append('title').text(`${CAND[k].name}\n${s.actual ? '實際得票率' : s.k}：${v.toFixed(2)}%`)
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
  <svg ref="el" role="img" aria-label="各家民調與實際開票分組長條圖"></svg>
</template>
