<script setup>
import { ref, computed } from 'vue'
import { mean } from 'd3'
import { KEYS, CAND, ACTUAL, META } from '../data/polls'
import { buildRows, fmt, signClass, actualMargin } from '../utils/stats'
import BarChart from '../components/BarChart.vue'
import DotChart from '../components/DotChart.vue'

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
      <h2>預測得票率 − 實際得票率</h2>
      <p class="sub">依平均絕對誤差排序；正值＝高估、負值＝低估。</p>
      <div class="legend"><span v-for="k in KEYS" :key="k"><i :style="{ background: CAND[k].color }"></i>{{ CAND[k].name }}</span></div>
      <DotChart :rows="sorted" />
    </section>

    <section class="card">
      <h2>各家封關民調 vs 實際開票</h2>
      <p class="sub">最右側深框長條為實際開票結果。</p>
      <BarChart :rows="rows" />
    </section>

    <section class="card scroll">
      <h2>誤差排名</h2>
      <table>
        <thead>
          <tr>
            <th>排名</th><th>民調機構</th><th>訪問／公布日期</th>
            <template v-for="k in KEYS" :key="k"><th>{{ CAND[k].short }} 民調</th><th>{{ CAND[k].short }} 誤差</th></template>
            <th>MAE</th>
            <!-- <th>{{ META.marginLabel }}</th> -->
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
            <!-- <td :class="signClass(r.marginErr)">{{ fmt(r.marginErr) }}</td> -->
          </tr>
        </tbody>
      </table>
      <p class="note">依平均絕對誤差（MAE）由小到大排序；單位：百分點（pp）。</p>
      <!-- <p class="note">依平均絕對誤差（MAE）由小到大排序；單位：百分點（pp）。{{ META.marginLabel }}＝民調的蔣−陳差距，減去實際差距 {{ actualMargin.toFixed(2) }} pp。</p> -->
    </section>

    <section class="card">
      <h2>備註</h2>
      <ul>
        <li>誤差方向與大小隨「是否排除未表態」而改變；各家未表態比例差異很大（蓋洛普約 27%，自由時報約 12%）。</li>
        <li>各家訪問日期與抽樣方式不同（市話／手機雙底冊、簡訊連結網路問卷等），部分機構未在彙整報導中列出訪問日期，欄位以公布日期代替。</li>
        <li>選民可能在最後階段策略投票（所謂「棄保」），封關後到投票日仍有十天，封關民調無法反映這段時間的變化。</li>
        <li>單次選舉的比較不足以推論機構的長期系統性偏誤。</li>
        <li>資料來源：壹蘋新聞網、中時新聞網、TVBS 等媒體彙整報導；實際得票率來自中選會，經今周刊、天下等報導交叉核對。</li>
      </ul>
    </section>
  </div>
</template>
