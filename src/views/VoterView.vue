<script setup>
import { ref, computed } from 'vue'
import { DIMS, OVERALL, N, swing } from '../data/voters'
import Stacked100 from '../components/Stacked100.vue'
import Heatmap from '../components/Heatmap.vue'
import SwingBars from '../components/SwingBars.vue'
import TrendLines from '../components/TrendLines.vue'

const isDev = import.meta.env.DEV
const title = '選民結構交叉分析與「潛在動搖票」定位'
const dimKey = ref('age')
const dim = computed(() => DIMS.find(d => d.key === dimKey.value))
const swingRows = computed(() => dim.value.rows.map(r => ({ label: r.label, n: r.n, und: r.pct.und, contrib: swing(r) })))
const heatGroups = DIMS.map(d => ({ label: d.label, rows: d.rows }))

const party = DIMS.find(d => d.key === 'party').rows
const neutral = party.find(r => r.label.startsWith('沒特別'))
const tpp = party.find(r => r.label.startsWith('民眾黨'))
const youngTop = DIMS.find(d => d.key === 'age').rows.filter(r => r.n >= 100).sort((a, b) => b.pct.huang - a.pct.huang)[0]

</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <p class="sub">2022 台北市長選舉｜台灣民意基金會民調（11/5–7，n=1,069）的交叉分析</p>

    <section class="card">
      <div class="kpis">
        <div class="kpi"><span>全體尚未表態</span><b>{{ OVERALL.und }}%</b><span>還不能決定＋不知道（n={{ N }}）</span></div>
        <div class="kpi"><span>中性選民占全體未表態者</span><b>{{ swing(neutral).toFixed(0) }}%</b><span>未表態比例 {{ neutral.pct.und.toFixed(0) }}%（n={{ neutral.n }}）</span></div>
        <div class="kpi"><span>民眾黨支持者：挺黃／挺蔣</span><b>{{ tpp.pct.huang.toFixed(0) }}% ／ {{ tpp.pct.chiang.toFixed(0) }}%</b><span>黃珊珊的基本盤，也是蔣萬安的潛在票源</span></div>
        <div class="kpi"><span>黃珊珊支持最高年齡層（n≥100）</span><b>{{ youngTop.label }}</b><span>{{ youngTop.pct.huang.toFixed(1) }}%</span></div>
      </div>
    </section>

    <section class="card">
      <h2>各族群的支持比例結構</h2>
      <div class="tabs"><button v-for="d in DIMS" :key="d.key" :class="{ on: dimKey === d.key }" @click="dimKey = d.key">{{ d.label }}</button></div>
      <Stacked100 :rows="dim.rows" />
    </section>

    <section class="card">
      <h2>潛在動搖票定位：誰貢獻了最多的未表態者？</h2>
      <p class="sub">目前分類：{{ dim.label }}（可用上方「百分比堆疊長條圖」的分頁切換）。長度＝佔全體未表態者的比例。</p>
      <SwingBars :rows="swingRows" />
    </section>

    <section class="card">
      <h2>族群 × 候選人支持度</h2>
      <p class="sub">顏色越深＝比例越高；＊＝樣本數少於 50。</p>
      <Heatmap :groups="heatGroups" />
    </section>

    <section class="card">
      <h2>支持傾向的轉變：TVBS 年齡層趨勢</h2>
      <p class="sub">20–29 歲對黃珊珊的支持度從 33% 一路升到封關前的 56%；30–39 歲對黃珊珊則在 11/1 大幅下滑，同期蔣萬安、陳時中回升。</p>
      <TrendLines />
    </section>

    <section class="card">
      <h2>備註</h2>
      <ul>
        <li><b>最大的動搖票是中性選民。</b>沒特別支持任何政黨的選民未表態比例高達 {{ neutral.pct.und.toFixed(0) }}%，貢獻了全體未表態者的 {{ swing(neutral).toFixed(0) }}%；已決定者中，他們略偏向黃珊珊（{{ neutral.pct.huang.toFixed(1) }}%）。</li>
        <li><b>政黨傾向決定了大半的票。</b>民進黨、國民黨支持者分別有 72.8%、84.2% 挺自家候選人；民眾黨支持者有 59.4% 挺黃、28.0% 挺蔣，是兩人爭奪的對象。</li>
        <li><b>年齡呈現明顯的世代分野。</b>25–44 歲黃珊珊領先，65 歲以上只有 5.8% 支持黃，陳時中與蔣萬安幾乎平分。</li>
        <li><b>教育程度：</b>大學及以上黃珊珊領先（34.7%）；高中職、專科蔣萬安領先；小學及以下陳時中領先但未表態高達 33.7%。</li>
        <li>資料來源：台灣民意基金會 2022-11-10 記者會書面資料（交叉分析）；TVBS 民調中心歷次台北市長民調（新聞報導整理）。</li>
      </ul>
    </section>
  </div>
</template>
