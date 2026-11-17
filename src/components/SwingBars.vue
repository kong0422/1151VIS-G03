<script setup>
// 潛在動搖票：rows = [{label, n, und, contrib}]；長度＝佔全體未表態者的比例
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'

const props = defineProps({ rows: { type: Array, required: true } })
const el = ref(null)

function draw() {
  const svg = d3.select(el.value); svg.selectAll('*').remove()
  const W = 920, rh = 36, m = { t: 6, r: 230, b: 22, l: 190 }, H = m.t + m.b + props.rows.length * rh
  svg.attr('viewBox', `0 0 ${W} ${H}`)
  const x = d3.scaleLinear().domain([0, Math.max(60, d3.max(props.rows, r => r.contrib))]).range([m.l, W - m.r])
  const y = d3.scaleBand().domain(props.rows.map(r => r.label)).range([m.t, H - m.b]).padding(0.25)
  props.rows.forEach(r => {
    svg.append('rect').attr('x', m.l).attr('y', y(r.label)).attr('width', x(r.contrib) - m.l).attr('height', y.bandwidth())
      .attr('rx', 3).attr('fill', 'var(--bad)').attr('fill-opacity', 0.8)
      .append('title').text(`${r.label}\n佔全體未表態者 ${r.contrib.toFixed(1)}%；該群體未表態 ${r.und.toFixed(1)}%（n=${r.n}）`)
    svg.append('text').attr('x', m.l - 8).attr('y', y(r.label) + y.bandwidth() / 2 + 4).attr('text-anchor', 'end').style('fill', 'var(--fg)').text(r.label)
    svg.append('text').attr('x', x(r.contrib) + 8).attr('y', y(r.label) + y.bandwidth() / 2 + 4)
      .style('fill', 'var(--fg)').text(`${r.contrib.toFixed(0)}%（該群未表態 ${r.und.toFixed(0)}%，n=${r.n}）`)
  })
  svg.append('g').selectAll('text').data(x.ticks(4)).join('text')
    .attr('x', x).attr('y', H - 6).attr('text-anchor', 'middle').text(d => d + '%')
}
onMounted(draw); watch(() => props.rows, draw)
</script>

<template><svg ref="el" role="img" aria-label="各群體佔全體未表態者比例"></svg></template>
