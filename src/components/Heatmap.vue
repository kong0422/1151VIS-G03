<script setup>
// 熱力圖：groups = [{label, rows:[{label, n, pct}]}]；欄＝蔣、陳、黃、未表態；顏色深淺＝百分比
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'
import { useTip } from '../utils/useTip'
import ChartTip from './ChartTip.vue'
import { CAND } from '../data/polls'

const props = defineProps({ groups: { type: Array, required: true } })
const el = ref(null)
const wrap = ref(null)
const { tip, show, hide } = useTip(wrap)

const tipOf = (g, r, active) => ({
  title: `${g.label}｜${r.label}`,
  sub: `n=${r.n}${r.n < 50 ? '（樣本數少於 50，僅供參考）' : ''}`,
  rows: COLS.map(c => ({ color: c.color, label: c.name, value: `${r.pct[c.k].toFixed(1)}%`, bold: c.k === active })),
  notes: ['同一列四個比例加總為 100%']
})
const COLS = [
  { k: 'chiang', name: '蔣萬安', color: CAND.chiang.color },
  { k: 'chen', name: '陳時中', color: CAND.chen.color },
  { k: 'huang', name: '黃珊珊', color: CAND.huang.color },
  { k: 'und', name: '未表態', color: 'var(--mute)' }
]

function draw() {
  const svg = d3.select(el.value); svg.selectAll('*').remove()
  hide()
  const W = 920, lw = 230, cw = (W - lw - 10) / COLS.length, rh = 28, gh = 26, top = 30
  let y = top
  COLS.forEach((c, i) => svg.append('text').attr('x', lw + cw * i + cw / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-weight', 700).style('fill', c.color).text(c.name))
  props.groups.forEach(g => {
    svg.append('text').attr('x', 4).attr('y', y + 18).style('font-weight', 700).style('fill', 'var(--fg)').text(g.label)
    y += gh
    g.rows.forEach(r => {
      svg.append('text').attr('x', lw - 8).attr('y', y + rh / 2 + 4).attr('text-anchor', 'end').style('fill', 'var(--fg)')
        .text(`${r.label}${r.n < 50 ? '＊' : ''}`)
      COLS.forEach((c, i) => {
        const v = r.pct[c.k], op = 0.1 + 0.9 * Math.min(v / 70, 1)
        svg.append('rect').attr('x', lw + cw * i + 2).attr('y', y + 2).attr('width', cw - 4).attr('height', rh - 4).attr('rx', 4)
          .attr('fill', c.color).attr('fill-opacity', op)
          .on('pointerenter', function (ev) { d3.select(this).attr('stroke', 'var(--fg)').attr('stroke-width', 1.5); show(ev, tipOf(g, r, c.k)) })
          .on('pointermove', ev => show(ev, tipOf(g, r, c.k)))
          .on('pointerleave', function () { d3.select(this).attr('stroke', null); hide() })
        svg.append('text').style('pointer-events', 'none').attr('x', lw + cw * i + cw / 2).attr('y', y + rh / 2 + 4).attr('text-anchor', 'middle')
          .style('font-size', '12px').style('font-weight', 600).style('fill', op > 0.55 ? '#fff' : 'var(--fg)')
          .style('stroke', op > 0.55 ? 'rgba(0,0,0,.4)' : 'none').style('stroke-width', 2.5).style('paint-order', 'stroke')
          .text(v.toFixed(1))
      })
      y += rh
    })
    y += 6
  })
  svg.attr('viewBox', `0 0 ${W} ${y}`)
}
onMounted(draw); watch(() => props.groups, draw)
</script>

<template>
  <div ref="wrap" class="chart-wrap">
    <svg ref="el" role="img" aria-label="族群與候選人支持度熱力圖"></svg>
    <ChartTip :tip="tip" />
  </div>
</template>
