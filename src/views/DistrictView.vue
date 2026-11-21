<script setup>
import { ref, computed, onMounted } from 'vue'
import { mean } from 'd3'
import { KEYS, CAND } from '../data/polls'
import { DISTRICTS } from '../data/districts'
import DistrictMap from '../components/DistrictMap.vue'
import StackedBars from '../components/StackedBars.vue'
import MemoBox from '../components/MemoBox.vue'

const isDev = import.meta.env.DEV
const title = '行政區選票基本盤與民調空間分異的對比'
const geo = ref(null)   // 若有 public/data/taipei-districts.geojson 則載入真實邊界
onMounted(async () => {
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'data/taipei-districts.geojson')
    if (res.ok) geo.value = await res.json()
  } catch { /* 沒有檔案就用示意方塊圖 */ }
})

const mode = ref('leader')   // leader | chiang | chen | huang
const modes = [{ k: 'leader', t: '各區領先者' }, ...KEYS.map(k => ({ k, t: `${CAND[k].short} 得票率` }))]

// 單一候選人：兩張圖共用同一套色階（跨民調與實際取最小、最大值）
const range = computed(() => {
  if (mode.value === 'leader') return null
  const vs = DISTRICTS.flatMap(d => [d.pollShare[mode.value], d.share[mode.value]])
  return [Math.min(...vs), Math.max(...vs)]
})
const op = v => 0.18 + 0.82 * ((v - range.value[0]) / (range.value[1] - range.value[0] || 1))

const pollCells = computed(() => DISTRICTS.map(d => mode.value === 'leader' ? {
  name: d.name, col: d.col, row: d.row, fill: CAND[d.pollLeader].color, opacity: 0.85,
  flag: d.pollLeader !== d.leader, sub: `領先：${CAND[d.pollLeader].short} ${d.pollShare[d.pollLeader].toFixed(0)}%`,
  label: `民調領先：${CAND[d.pollLeader].name}；實際領先：${CAND[d.leader].name}（民調 n=${d.n}）`
} : {
  name: d.name, col: d.col, row: d.row, fill: CAND[mode.value].color, opacity: op(d.pollShare[mode.value]),
  flag: false, sub: `${d.pollShare[mode.value].toFixed(1)}%`,
  label: `民調推估 ${CAND[mode.value].name} ${d.pollShare[mode.value].toFixed(1)}%（n=${d.n}）`
}))
const actualCells = computed(() => DISTRICTS.map(d => mode.value === 'leader' ? {
  name: d.name, col: d.col, row: d.row, fill: CAND[d.leader].color,
  opacity: 0.4 + 0.6 * Math.min(d.margin / 20, 1), flag: false,
  sub: `${CAND[d.leader].short} ${d.share[d.leader].toFixed(1)}%`,
  label: `實際領先：${CAND[d.leader].name} ${d.share[d.leader].toFixed(1)}%，領先 ${d.margin.toFixed(1)} 點`
} : {
  name: d.name, col: d.col, row: d.row, fill: CAND[mode.value].color, opacity: op(d.share[mode.value]),
  flag: false, sub: `${d.share[mode.value].toFixed(1)}%`,
  label: `實際 ${CAND[mode.value].name} ${d.share[mode.value].toFixed(1)}%`
}))

const hit = computed(() => DISTRICTS.filter(d => d.pollLeader === d.leader).length)
const maeByCand = computed(() => KEYS.map(k => ({ k, v: mean(DISTRICTS, d => Math.abs(d.pollShare[k] - d.share[k])) })))
const rows = computed(() => [...DISTRICTS].sort((a, b) => b.share.chiang - a.share.chiang))
const f = v => (v > 0 ? '+' : '') + v.toFixed(1)

</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <p class="sub">2022 台北市長選舉｜12 行政區實際開票 vs 台灣民意基金會民調（11/5–7 訪問）的分區推估</p>

    <section class="card">
      <div class="kpis">
        <div class="kpi"><span>民調領先者與實際相符的行政區</span><b>{{ hit }} / 12</b><span>虛線框＝不相符</span></div>
        <div v-for="m in maeByCand" :key="m.k" class="kpi">
          <span>各區平均絕對誤差：{{ CAND[m.k].name }}</span><b>{{ m.v.toFixed(1) }} pp</b><span>12 區民調 vs 實際</span>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>民調推估 vs 實際開票</h2>
      <p class="sub">{{ geo ? '' : '目前為示意方塊圖（位置大致依地理方位排列，非真實邊界）。' }}切換下方選項可改看各候選人的得票率分佈。</p>
      <div class="tabs"><button v-for="m in modes" :key="m.k" :class="{ on: mode === m.k }" @click="mode = m.k">{{ m.t }}</button></div>
      <div class="legend"><span v-for="k in KEYS" :key="k"><i :style="{ background: CAND[k].color }"></i>{{ CAND[k].name }}</span></div>
      <div class="maps">
        <figure><figcaption>民調推估（TPOF，三人合計＝100%）</figcaption><DistrictMap :cells="pollCells" :geo="geo" /></figure>
        <figure><figcaption>實際開票（三人合計＝100%）</figcaption><DistrictMap :cells="actualCells" :geo="geo" /></figure>
      </div>
    </section>

    <section class="card">
      <h2>各行政區實際得票率</h2>
      <p class="sub">藍營傳統優勢區（文山、大安）與綠營較強區（大同、士林）的基本盤差異。</p>
      <StackedBars :rows="rows" />
    </section>

    <section class="card scroll">
      <h2>民調領先 vs 實際領先</h2>
      <table>
        <thead>
          <tr><th>行政區</th><th>民調 n</th><th>±</th>
            <template v-for="k in KEYS" :key="k"><th>{{ CAND[k].short }} 民調</th><th>{{ CAND[k].short }} 實際</th><th>{{ CAND[k].short }} 差</th></template>
            <th>民調領先</th><th>實際領先</th></tr>
        </thead>
        <tbody>
          <tr v-for="d in rows" :key="d.name">
            <td>{{ d.name }}</td><td>{{ d.n }}</td><td>{{ d.moe.toFixed(0) }}</td>
            <template v-for="k in KEYS" :key="k">
              <td>{{ d.pollShare[k].toFixed(1) }}%</td><td>{{ d.share[k].toFixed(1) }}%</td>
              <td :class="d.pollShare[k] - d.share[k] > 0 ? 'pos' : 'neg'">{{ f(d.pollShare[k] - d.share[k]) }}</td>
            </template>
            <td><span class="chip" :class="[d.pollLeader, { miss: d.pollLeader !== d.leader }]" :title="d.pollLeader !== d.leader ? '民調領先者與實際不同' : ''">{{ CAND[d.pollLeader].short }}</span></td>
            <td><span class="chip" :class="d.leader">{{ CAND[d.leader].short }}</span></td>
          </tr>
        </tbody>
      </table>
      <p class="note">單位：百分點（pp）。「民調領先」「實際領先」以候選人顏色的文字標示；民調領先者與實際不同時，文字外圍會加橘色虛線框。</p>
    </section>

    <section class="card">
      <h2>備註</h2>
      <ul>
        <li>實際開票：蔣萬安在 11 區領先，陳時中只贏大同區（士林區僅差 439 票），黃珊珊沒有任何一區第一。</li>
        <li>民調領先者與實際不同的區：{{ DISTRICTS.filter(d => d.pollLeader !== d.leader).map(d => d.name).join('、') }}。</li>
        <li>黃珊珊的落差最明顯：12 區中有 9 區的民調推估高於實際得票；中山、萬華兩區則是民調偏低，其中中山區民調僅約 {{ DISTRICTS.find(d => d.name === '中山區').pollShare.huang.toFixed(0) }}%，實際 {{ DISTRICTS.find(d => d.name === '中山區').share.huang.toFixed(0) }}%。</li>
        <li>資料來源：台灣民意基金會 2022-11-10 記者會書面資料（各區民調）；ETtoday 2022 九合一選舉專區（各區開票）。</li>
      </ul>
    </section>
  </div>
</template>
