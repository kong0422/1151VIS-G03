<script setup>
// 行政區面量圖。若 public/data/taipei-districts.geojson 存在則畫真實邊界，否則畫示意方塊圖。
// cells: [{ name, col, row, fill, opacity, flag, sub, label,
//           tree?: [{ short, color, value }],  // 有 tree 時，方塊內畫 Treemap（面積＝value）
//           leaderColor?: string,              // 有 tree 時，方塊邊框色（領先者）
//           tip?: { title, sub?, rows: [{ color, label, value, extra? }], notes?: [] } }]
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  cells: { type: Array, required: true },
  geo: { type: Object, default: null }
})
const el = ref(null)
const wrap = ref(null)
const tip = ref(null)   // { x, y, c }

function show(ev, c) {
  if (!c.tip) return
  const [px, py] = d3.pointer(ev, wrap.value)
  const maxX = Math.max(wrap.value.clientWidth - 262, 0)
  tip.value = { x: Math.min(px + 14, maxX), y: py + 14, c }
}
const hide = () => { tip.value = null }
const bind = (sel, c) => sel.on('pointerenter pointermove', ev => show(ev, c)).on('pointerleave', hide)

const nameOf = f => {
  const p = f.properties || {}
  return p.TOWNNAME || p.T_Name || p.townname || p.name || p.NAME || p.districtName || ''
}

const outline = s => s.style('fill', '#fff').style('stroke', 'rgba(0,0,0,.45)').style('stroke-width', 3).style('paint-order', 'stroke')

function label(g, x, y, c) {
  const t = g.append('text').attr('x', x).attr('y', y).attr('text-anchor', 'middle').style('pointer-events', 'none')
  outline(t.append('tspan').attr('x', x).attr('dy', '-0.1em').style('font-size', '15px').style('font-weight', 700).text(c.name.replace('區', '')))
  outline(t.append('tspan').attr('x', x).attr('dy', '1.35em').style('font-size', '12px').text(c.sub))
}

// 在 (x, y, w, h) 的範圍內畫 Treemap：三位候選人得票比例，面積＝比例
function drawTreemap(g, tree, x, y, w, h) {
  const root = d3.hierarchy({ children: tree }).sum(d => d.value).sort((a, b) => b.value - a.value)
  d3.treemap().size([w, h]).paddingInner(1.5).tile(d3.treemapSquarify)(root)
  root.leaves().forEach(n => {
    const rw = n.x1 - n.x0, rh = n.y1 - n.y0, d = n.data
    g.append('rect').attr('x', x + n.x0).attr('y', y + n.y0).attr('width', rw).attr('height', rh)
      .attr('rx', 2).attr('fill', d.color).attr('fill-opacity', 0.92)
    const txt = rw >= 44 && rh >= 16 ? `${d.short} ${d.value.toFixed(0)}%` : rw >= 26 && rh >= 14 ? `${d.value.toFixed(0)}%` : ''
    if (txt) outline(g.append('text').attr('x', x + n.x0 + rw / 2).attr('y', y + n.y0 + rh / 2 + 4).attr('text-anchor', 'middle')
      .style('font-size', '11px').style('font-weight', 600).style('pointer-events', 'none')).text(txt)
  })
}

function drawGeo(svg, W, H) {
  const proj = d3.geoMercator().fitSize([W - 10, H - 10], props.geo)
  const path = d3.geoPath(proj)
  props.geo.features.forEach(f => {
    const n = nameOf(f)
    const c = props.cells.find(c => n.includes(c.name.replace('區', '')))
    if (!c) return
    const g = bind(svg.append('g').attr('transform', 'translate(5,5)'), c)
    const [cx, cy] = path.centroid(f)
    if (c.tree) {
      g.append('path').attr('d', path(f)).attr('fill', 'var(--card)')
        .attr('stroke', c.flag ? 'var(--bad)' : c.leaderColor).attr('stroke-width', c.flag ? 3 : 2.5).attr('stroke-dasharray', c.flag ? '5 3' : null)
      g.append('text').attr('x', cx).attr('y', cy - 26).attr('text-anchor', 'middle').style('font-size', '13px').style('font-weight', 700)
        .style('fill', 'var(--fg)').style('pointer-events', 'none').text(c.name.replace('區', ''))
      drawTreemap(g, c.tree, cx - 32, cy - 20, 64, 46)
    } else {
      g.append('path').attr('d', path(f)).attr('fill', c.fill).attr('fill-opacity', c.opacity)
        .attr('stroke', c.flag ? 'var(--bad)' : 'var(--card)').attr('stroke-width', c.flag ? 3 : 1.5)
        .attr('stroke-dasharray', c.flag ? '5 3' : null)
      label(g, cx, cy, c)
    }
  })
}

function drawTiles(svg) {
  const s = 98, gap = 8
  props.cells.forEach(c => {
    const x = c.col * (s + gap) + 6, y = c.row * (s + gap) + 6
    const g = bind(svg.append('g'), c)
    if (c.tree) {
      // 領先者色邊框；民調與實際不同時，外圈加橘色虛線
      g.append('rect').attr('x', x).attr('y', y).attr('width', s).attr('height', s).attr('rx', 10)
        .attr('fill', 'var(--card)').attr('stroke', c.leaderColor).attr('stroke-width', 2.5)
      if (c.flag) g.append('rect').attr('x', x - 3).attr('y', y - 3).attr('width', s + 6).attr('height', s + 6).attr('rx', 12)
        .attr('fill', 'none').attr('stroke', 'var(--bad)').attr('stroke-width', 2.5).attr('stroke-dasharray', '6 4')
      g.append('text').attr('x', x + s / 2).attr('y', y + 16).attr('text-anchor', 'middle').style('font-size', '13px').style('font-weight', 700)
        .style('fill', 'var(--fg)').style('pointer-events', 'none').text(c.name)
      drawTreemap(g, c.tree, x + 5, y + 22, s - 10, s - 27)
    } else {
      g.append('rect').attr('x', x).attr('y', y).attr('width', s).attr('height', s).attr('rx', 10)
        .attr('fill', c.fill).attr('fill-opacity', c.opacity)
        .attr('stroke', c.flag ? 'var(--bad)' : 'none').attr('stroke-width', 3.5)
        .attr('stroke-dasharray', c.flag ? '6 4' : null)
      label(g, x + s / 2, y + s / 2 - 4, c)
    }
  })
}

function draw() {
  const svg = d3.select(el.value)
  svg.selectAll('*').remove()
  hide()
  const W = 540, H = 440
  svg.attr('viewBox', `0 0 ${W} ${H}`)
  props.geo ? drawGeo(svg, W, H) : drawTiles(svg)
}
onMounted(draw)
watch(() => [props.cells, props.geo], draw)
</script>

<template>
  <div ref="wrap" class="map-wrap">
    <svg ref="el" role="img" aria-label="行政區面量圖"></svg>
    <div v-if="tip" class="map-tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }" role="tooltip">
      <b>{{ tip.c.tip.title }}</b>
      <div v-if="tip.c.tip.sub" class="muted">{{ tip.c.tip.sub }}</div>
      <table>
        <tbody>
          <tr v-for="r in tip.c.tip.rows" :key="r.label">
            <td><i :style="{ background: r.color }"></i>{{ r.label }}</td>
            <td class="v">{{ r.value }}</td>
            <td class="e">{{ r.extra }}</td>
          </tr>
        </tbody>
      </table>
      <div v-for="(n, i) in tip.c.tip.notes" :key="i" class="n">{{ n }}</div>
    </div>
  </div>
</template>
