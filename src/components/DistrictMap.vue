<script setup>
// 行政區面量圖。若 public/data/taipei-districts.geojson 存在則畫真實邊界，否則畫示意方塊圖。
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'

const props = defineProps({
  cells: { type: Array, required: true },   // [{name, col, row, fill, opacity, label, sub, flag}]
  geo: { type: Object, default: null }
})
const el = ref(null)

const nameOf = f => {
  const p = f.properties || {}
  return p.TOWNNAME || p.T_Name || p.townname || p.name || p.NAME || p.districtName || ''
}

function drawGeo(svg, W, H) {
  const proj = d3.geoMercator().fitSize([W - 10, H - 10], props.geo)
  const path = d3.geoPath(proj)
  props.geo.features.forEach(f => {
    const n = nameOf(f)
    const c = props.cells.find(c => n.includes(c.name.replace('區', '')))
    if (!c) return
    svg.append('path').attr('d', path(f)).attr('transform', 'translate(5,5)')
      .attr('fill', c.fill).attr('fill-opacity', c.opacity)
      .attr('stroke', c.flag ? 'var(--bad)' : 'var(--card)').attr('stroke-width', c.flag ? 3 : 1.5)
      .attr('stroke-dasharray', c.flag ? '5 3' : null)
      .append('title').text(`${c.name}｜${c.label}`)
    const [x, y] = path.centroid(f)
    label(svg, x + 5, y + 5, c)
  })
}

function label(svg, x, y, c) {
  const t = svg.append('text').attr('x', x).attr('y', y).attr('text-anchor', 'middle').style('pointer-events', 'none')
  const style = s => s.style('fill', '#fff').style('stroke', 'rgba(0,0,0,.45)').style('stroke-width', 3).style('paint-order', 'stroke')
  style(t.append('tspan').attr('x', x).attr('dy', '-0.1em').style('font-size', '15px').style('font-weight', 700).text(c.name.replace('區', '')))
  style(t.append('tspan').attr('x', x).attr('dy', '1.35em').style('font-size', '12px').text(c.sub))
}

function drawTiles(svg, W, H) {
  const s = 98, g = 8
  props.cells.forEach(c => {
    const x = c.col * (s + g) + 6, y = c.row * (s + g) + 6
    svg.append('rect').attr('x', x).attr('y', y).attr('width', s).attr('height', s).attr('rx', 10)
      .attr('fill', c.fill).attr('fill-opacity', c.opacity)
      .attr('stroke', c.flag ? 'var(--bad)' : 'none').attr('stroke-width', 3.5)
      .attr('stroke-dasharray', c.flag ? '6 4' : null)
      .append('title').text(`${c.name}｜${c.label}`)
    label(svg, x + s / 2, y + s / 2 - 4, c)
  })
}

function draw() {
  const svg = d3.select(el.value)
  svg.selectAll('*').remove()
  const W = 540, H = 440
  svg.attr('viewBox', `0 0 ${W} ${H}`)
  props.geo ? drawGeo(svg, W, H) : drawTiles(svg, W, H)
}
onMounted(draw)
watch(() => [props.cells, props.geo], draw)
</script>

<template>
  <svg ref="el" role="img"></svg>
</template>
