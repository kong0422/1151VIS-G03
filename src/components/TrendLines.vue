<script setup>
import { ref, onMounted } from 'vue'
import * as d3 from 'd3'
import { TREND, TREND_X } from '../data/voters'

const el = ref(null)
onMounted(() => {
  const svg = d3.select(el.value)
  const W = 920, H = 340, m = { t: 14, r: 20, b: 30, l: 44 }
  svg.attr('viewBox', `0 0 ${W} ${H}`)
  const x = d3.scalePoint().domain(TREND_X).range([m.l + 20, W - m.r - 20])
  const y = d3.scaleLinear().domain([0, 70]).range([H - m.b, m.t])
  svg.append('g').selectAll('line').data(y.ticks(7)).join('line').attr('x1', m.l).attr('x2', W - m.r).attr('y1', y).attr('y2', y).attr('stroke', 'var(--line)')
  svg.append('g').selectAll('text').data(y.ticks(7)).join('text').attr('x', m.l - 6).attr('y', d => y(d) + 4).attr('text-anchor', 'end').text(d => d + '%')
  svg.append('g').selectAll('text').data(TREND_X).join('text').attr('x', x).attr('y', H - 8).attr('text-anchor', 'middle').text(d => d)
  TREND.forEach(s => {
    const pts = TREND_X.map((t, i) => ({ t, v: s.y[i] }))
    const line = d3.line().defined(d => d.v != null).x(d => x(d.t)).y(d => y(d.v))
    svg.append('path').attr('d', line(pts.filter(p => p.v != null))).attr('fill', 'none')
      .attr('stroke', s.color).attr('stroke-width', 2.5).attr('stroke-dasharray', s.dash)
    pts.filter(p => p.v != null).forEach(p => {
      svg.append('circle').attr('cx', x(p.t)).attr('cy', y(p.v)).attr('r', 5).attr('fill', s.color)
        .append('title').text(`${s.name}｜${p.t}：${p.v}%`)
      svg.append('text').attr('x', x(p.t)).attr('y', y(p.v) - 9).attr('text-anchor', 'middle').style('font-size', '11px').text(p.v)
    })
  })
})
</script>

<template><svg ref="el" role="img" aria-label="TVBS 民調年齡層支持度趨勢"></svg></template>
