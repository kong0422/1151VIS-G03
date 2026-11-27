<script setup>
// 潛在動搖票：rows = [{label, n, und, contrib, detail?}]；長度＝佔全體未表態者的比例
// detail（選用）：[{label, n, und, contrib}]，有值時 tooltip 會列出各分類明細
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'

const props = defineProps({ rows: { type: Array, required: true } })
const el = ref(null)
const wrap = ref(null)
const tip = ref(null)   // { x, y, row }

function show(ev, row) {
  const [px, py] = d3.pointer(ev, wrap.value)
  const maxX = Math.max(wrap.value.clientWidth - 310, 0)
  tip.value = { x: Math.min(px + 14, maxX), y: py + 14, row }
}
const hide = () => { tip.value = null }

function draw() {
  const svg = d3.select(el.value); svg.selectAll('*').remove()
  const W = 920, rh = 36, m = { t: 6, r: 230, b: 22, l: 190 }, H = m.t + m.b + props.rows.length * rh
  svg.attr('viewBox', `0 0 ${W} ${H}`)
  const x = d3.scaleLinear().domain([0, Math.max(60, d3.max(props.rows, r => r.contrib))]).range([m.l, W - m.r])
  const y = d3.scaleBand().domain(props.rows.map(r => r.label)).range([m.t, H - m.b]).padding(0.25)
  props.rows.forEach(r => {
    const cy = y(r.label) + y.bandwidth() / 2 + 4
    svg.append('rect').attr('x', m.l).attr('y', y(r.label)).attr('width', x(r.contrib) - m.l).attr('height', y.bandwidth())
      .attr('rx', 3).attr('fill', 'var(--bad)').attr('fill-opacity', r.detail ? 0.55 : 0.8)
      .attr('stroke', r.detail ? 'var(--bad)' : 'none').attr('stroke-dasharray', r.detail ? '4 3' : null)
    svg.append('text').attr('x', m.l - 8).attr('y', cy).attr('text-anchor', 'end').style('fill', 'var(--fg)')
      .text(r.detail ? `${r.label} ⓘ` : r.label)
    svg.append('text').attr('x', x(r.contrib) + 8).attr('y', cy)
      .style('fill', 'var(--fg)').text(`${r.contrib.toFixed(0)}%（該群未表態 ${r.und.toFixed(0)}%，n=${r.n}）`)
    // 整列透明感應區：滑過長條或文字都會顯示 tooltip
    svg.append('rect').attr('x', 0).attr('y', y(r.label) - 3).attr('width', W).attr('height', y.bandwidth() + 6)
      .attr('fill', 'transparent').style('cursor', r.detail ? 'help' : 'default')
      .on('pointerenter pointermove', ev => show(ev, r)).on('pointerleave', hide)
  })
  svg.append('g').selectAll('text').data(x.ticks(4)).join('text')
    .attr('x', x).attr('y', H - 6).attr('text-anchor', 'middle').text(d => d + '%')
}
onMounted(draw); watch(() => props.rows, draw)
</script>

<template>
  <div ref="wrap" class="swing-wrap">
    <svg ref="el" role="img" aria-label="各群體佔全體未表態者比例"></svg>
    <div v-if="tip" class="swing-tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }" role="tooltip">
      <b>{{ tip.row.label }}</b>
      <div>佔全體未表態者 {{ tip.row.contrib.toFixed(1) }}%</div>
      <div>該群體未表態 {{ tip.row.und.toFixed(1) }}%（n={{ tip.row.n }}）</div>
      <table v-if="tip.row.detail">
        <thead><tr><th>分類</th><th>n</th><th>未表態</th><th>佔全體</th></tr></thead>
        <tbody>
          <tr v-for="d in tip.row.detail" :key="d.label">
            <td>{{ d.label }}</td><td>{{ d.n }}</td><td>{{ d.und.toFixed(1) }}%</td><td>{{ d.contrib.toFixed(1) }}%</td>
          </tr>
          <tr class="sum"><td>合計</td><td>{{ tip.row.n }}</td><td>{{ tip.row.und.toFixed(1) }}%</td><td>{{ tip.row.contrib.toFixed(1) }}%</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
