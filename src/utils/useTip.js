import { ref } from 'vue'
import * as d3 from 'd3'

/**
 * 圖表 tooltip 狀態。wrap 為包住 <svg> 的容器 ref（需 position: relative）。
 * show(ev, data)：data = { title, sub?, rows?: [{ color?, label, value, extra?, bold? }], notes?: [] }
 */
export function useTip(wrap, width = 270) {
  const tip = ref(null)
  const show = (ev, data) => {
    const [px, py] = d3.pointer(ev, wrap.value)
    const maxX = Math.max(wrap.value.clientWidth - width, 0)
    tip.value = { x: Math.min(px + 14, maxX), y: py + 14, data }
  }
  const hide = () => { tip.value = null }
  return { tip, show, hide }
}
