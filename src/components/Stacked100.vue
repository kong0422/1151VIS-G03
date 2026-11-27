<script setup>
// 100% 堆疊長條圖：rows = [{label, n, pct:{chiang, chen, huang, und}}]
// 滑鼠移到色塊或列名上會顯示 tooltip（該列四個比例，目前所在色塊會加粗）
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import { CAND } from '../data/polls'

const props = defineProps({ rows: { type: Array, required: true } })
const el = ref(null)
const wrap = ref(null)
const tip = ref(null)   // { x, y, row, active }
const SEG = [
  { k: 'chiang', name: CAND.chiang.name, color: CAND.chiang.color },
  { k: 'chen', name: CAND.chen.name, color: CAND.chen.color },
  { k: 'huang', name: CAND.huang.name, color: CAND.huang.color },
  { k: 'und', name: '未表態（未決定＋不知道）', color: 'var(--mute)' }
]

function show(ev, row, active) {
  const [px, py] = d3.pointer(ev, wrap.value)
  const maxX = Math.max(wrap.value.clientWidth - 262, 0)
  tip.value = { x: Math.min(px + 14, maxX), y: py + 14, row, active }
}
const hide = () => { tip.value = null }

function draw() {
  const svg = d3.select(el.value); svg.selectAll('*').remove()
  hide()
  const W = 920, rh = 38, m = { t: 6, r: 10, b: 28, l: 190 }, H = m.t + m.b + props.rows.length * rh
  svg.attr('viewBox', `0 0 ${W} ${H}`)
  const x = d3.scaleLinear().domain([0, 100]).range([m.l, W - m.r])
  const y = d3.scaleBand().domain(props.rows.map(r => r.label)).range([m.t, H - m.b]).padding(0.22)
  props.rows.forEach(r => {
    let acc = 0
    const total = SEG.reduce((s, g) => s + r.pct[g.k], 0)
    SEG.forEach(g => {
      const v = (r.pct[g.k] / total) * 100
      svg.append('rect').attr('x', x(acc)).attr('y', y(r.label)).attr('width', Math.max(x(acc + v) - x(acc), 0)).attr('height', y.bandwidth())
        .attr('fill', g.color).attr('fill-opacity', g.k === 'und' ? 0.55 : 0.9)
        .on('pointerenter', function (ev) { d3.select(this).attr('stroke', 'var(--fg)').attr('stroke-width', 1.5); show(ev, r, g.k) })
        .on('pointermove', ev => show(ev, r, g.k))
        .on('pointerleave', function () { d3.select(this).attr('stroke', null); hide() })
      if (v >= 7) svg.append('text').attr('x', (x(acc) + x(acc + v)) / 2).attr('y', y(r.label) + y.bandwidth() / 2 + 4)
        .attr('text-anchor', 'middle').style('fill', '#fff').style('font-size', '12px').style('font-weight', 600).style('pointer-events', 'none')
        .style('stroke', 'rgba(0,0,0,.45)').style('stroke-width', 2.5).style('paint-order', 'stroke').text(r.pct[g.k].toFixed(1))
      acc += v
    })
    svg.append('text').attr('x', m.l - 8).attr('y', y(r.label) + y.bandwidth() / 2 + 4).attr('text-anchor', 'end')
      .style('fill', 'var(--fg)').style('pointer-events', 'none').text(`${r.label}${r.n < 50 ? '＊' : ''}（n=${r.n}）`)
    // 列名區的感應範圍
    svg.append('rect').attr('x', 0).attr('y', y(r.label)).attr('width', m.l - 4).attr('height', y.bandwidth()).attr('fill', 'transparent')
      .on('pointerenter pointermove', ev => show(ev, r, null)).on('pointerleave', hide)
  })
  svg.append('g').selectAll('text').data([0, 25, 50, 75, 100]).join('text')
    .attr('x', x).attr('y', H - 8).attr('text-anchor', 'middle').text(d => d + '%')
}
onMounted(draw); watch(() => props.rows, draw)
</script>

<template>
  <div ref="wrap" class="stack-wrap">
    <svg ref="el" role="img" aria-label="百分比堆疊長條圖"></svg>
    <div v-if="tip" class="stack-tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }" role="tooltip">
      <b>{{ tip.row.label }}（n={{ tip.row.n }}）</b>
      <table>
        <tbody>
          <tr v-for="g in SEG" :key="g.k" :class="{ on: tip.active === g.k }">
            <td><i :style="{ background: g.color }"></i>{{ g.name }}</td>
            <td class="v">{{ tip.row.pct[g.k].toFixed(1) }}%</td>
          </tr>
        </tbody>
      </table>
      <div v-if="tip.row.n < 50" class="n">樣本數少於 50，僅供參考</div>
    </div>
  </div>
</template>
