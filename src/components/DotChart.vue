<script setup>
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import { KEYS, CAND, ACTUAL } from '../data/polls'
import { fmt } from '../utils/stats'

const props = defineProps({ rows: { type: Array, required: true } }) // 已排序
const el = ref(null)

function draw() {
  const svg = d3.select(el.value)
  svg.selectAll('*').remove()
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
      svg.append('circle').attr('cx', px).attr('cy', y(r.err[k])).attr('r', 6.5).attr('fill', CAND[k].color)
        .append('title').text(`${r.name}｜${CAND[k].name}\n民調 ${r.v[k].toFixed(2)}% − 實際 ${ACTUAL[k]}% = ${fmt(r.err[k])} pp`)
    })
  })
}

onMounted(draw)
watch(() => props.rows, draw)
</script>

<template>
  <svg ref="el" role="img" aria-label="各家民調誤差散佈圖"></svg>
</template>
