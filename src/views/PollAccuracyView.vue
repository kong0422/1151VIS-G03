<script setup>
import { ref, computed } from 'vue'
import { mean } from 'd3'
import { KEYS, CAND, ACTUAL, META } from '../data/polls'
import { buildRows, fmt, signClass, actualMargin } from '../utils/stats'
import BarChart from '../components/BarChart.vue'
import DotChart from '../components/DotChart.vue'
import MemoBox from '../components/MemoBox.vue'

const isDev = import.meta.env.DEV
const mode = ref('norm')
const rows = computed(() => buildRows(mode.value))
const sorted = computed(() => [...rows.value].sort((a, b) => a.mae - b.mae))
const best = computed(() => sorted.value[0])
const worst = computed(() => sorted.value.at(-1))
const bias = computed(() => KEYS.map(k => ({ k, mean: mean(rows.value, r => r.err[k]) })))
const undecidedRange = computed(() => {
  const u = rows.value.map(r => r.undecided)
  return `${Math.min(...u).toFixed(0)}–${Math.max(...u).toFixed(0)}`
})

const how = [
  '誤差散佈圖：每個點是「某家民調對某位候選人」的誤差，也就是民調數字減去實際得票率。虛線 0 代表完全命中，點在 0 上方是高估、下方是低估；灰色帶是 ±3 個百分點，約等於一般民調的抽樣誤差量級。機構依平均絕對誤差（MAE）由小到大排序，越靠左越接近實際。',
  '分組長條圖：每位候選人一組，各家民調的長條與最右側深框的「實際開票」並排，比較長條高度就能看出高估或低估。',
  '摘要卡片：MAE 是三位候選人誤差絕對值的平均；「各家平均偏差」是各家誤差的平均，正值代表這位候選人平均被高估、負值代表被低估。',
  '「排除未表態」模式把三人數字換算成合計 100%，才能和開票得票率比較；「原始民調數字」保留未表態者，所以通常會顯示全面低估，不能當作民調失準的證據。',
  '差距誤差欄＝民調的蔣−陳差距減去實際差距，用來看「領先幅度」估得準不準，而不只是個別得票率。'
]
const caution = [
  '民調是某個時點的支持度，不是對投票日的預測；封關後到投票日還有 10 天，選民意向可能改變。',
  '各家訪問日期與方式不同（市話、手機、網路），部分機構的訪問日期無從得知，表中以公布日期代替，比較時要留意時間差。',
  '一般民調的抽樣誤差約 ±3 個百分點，MAE 差距小於 3 的機構不宜硬分高下。',
  '這是單次選舉的比較，只能描述這次的偏差，不能直接推論某家機構有長期的系統性偏誤。',
  '數字取自媒體彙整報導，未逐一核對各家原始報告；實際得票率請以中選會公布為準。'
]
const actualText = KEYS.map(k => `${CAND[k].short} ${ACTUAL[k]}%`).join('、')
</script>

<template>
  <div>
    <h1>{{ META.title }}</h1>
    <p class="sub">{{ META.subtitle }}</p>

    <section class="card">
      <div class="kpis">
        <div class="kpi"><span>最接近實際開票</span><b>{{ best.name }}</b><span>MAE {{ best.mae.toFixed(2) }} pp</span></div>
        <div class="kpi"><span>落差最大</span><b>{{ worst.name }}</b><span>MAE {{ worst.mae.toFixed(2) }} pp</span></div>
        <div v-for="b in bias" :key="b.k" class="kpi">
          <span>各家平均偏差：{{ CAND[b.k].name }}</span>
          <b :class="signClass(b.mean)">{{ fmt(b.mean) }} pp</b>
          <span>{{ b.mean > 0 ? '平均而言被高估' : '平均而言被低估' }}</span>
        </div>
      </div>
      <div class="toggle" role="group">
        <button :class="{ on: mode === 'norm' }" @click="mode = 'norm'">排除未表態（三人合計＝100%）</button>
        <button :class="{ on: mode === 'raw' }" @click="mode = 'raw'">原始民調數字</button>
      </div>
      <p class="note">
        實際得票率：{{ actualText }}（三人合計 99.36%）。
        民調含未表態者（約 {{ undecidedRange }}%），原始數字不宜直接與開票結果相減。
      </p>
    </section>

    <section class="card">
      <h2>誤差散佈圖：預測得票率 − 實際得票率</h2>
      <p class="sub">依平均絕對誤差排序；正值＝高估、負值＝低估。</p>
      <div class="legend"><span v-for="k in KEYS" :key="k"><i :style="{ background: CAND[k].color }"></i>{{ CAND[k].name }}</span></div>
      <DotChart :rows="sorted" />
    </section>

    <section class="card">
      <h2>分組長條圖：各家封關民調 vs 實際開票</h2>
      <p class="sub">最右側深框長條為實際開票結果。</p>
      <BarChart :rows="rows" />
    </section>

    <section class="card scroll">
      <h2>明細</h2>
      <table>
        <thead>
          <tr>
            <th>排名</th><th>民調機構</th><th>訪問／公布日期</th>
            <template v-for="k in KEYS" :key="k"><th>{{ CAND[k].short }} 民調</th><th>{{ CAND[k].short }} 誤差</th></template>
            <th>MAE</th><th>{{ META.marginLabel }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in sorted" :key="r.name">
            <td>{{ i + 1 }}</td><td>{{ r.name }}</td><td>{{ r.field }}</td>
            <template v-for="k in KEYS" :key="k">
              <td>{{ r.v[k].toFixed(1) }}%</td>
              <td :class="signClass(r.err[k])">{{ fmt(r.err[k]) }}</td>
            </template>
            <td><b>{{ r.mae.toFixed(2) }}</b></td>
            <td :class="signClass(r.marginErr)">{{ fmt(r.marginErr) }}</td>
          </tr>
        </tbody>
      </table>
      <p class="note">單位：百分點（pp）。{{ META.marginLabel }}＝民調的蔣−陳差距，減去實際差距 {{ actualMargin.toFixed(2) }} pp。</p>
    </section>

    <section class="card">
      <h2>解讀與限制</h2>
      <ul><li v-for="(n, i) in META.notes" :key="i">{{ n }}</li></ul>
    </section>

    <MemoBox :how="how" :caution="caution" v-if="isDev" />
  </div>
</template>
