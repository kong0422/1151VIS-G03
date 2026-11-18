<script setup>
import { ref, computed } from 'vue'
import { DIMS, OVERALL, N, swing } from '../data/voters'
import Stacked100 from '../components/Stacked100.vue'
import Heatmap from '../components/Heatmap.vue'
import SwingBars from '../components/SwingBars.vue'
import TrendLines from '../components/TrendLines.vue'
import MemoBox from '../components/MemoBox.vue'

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

const how = [
  '100% 堆疊長條圖：每一列是一個族群（例如某個年齡層），整條代表 100% 的人，各色塊的長度是這個族群中支持各候選人與「未表態」的比例；數字是百分比。切換上方分頁可看年齡、教育、政黨與性別。',
  '熱力圖：把四種分類放進同一張矩陣，列是族群、欄是候選人，顏色越深代表該族群中支持該候選人的比例越高。適合一眼找出「誰的鐵票在哪裡」與「哪一群人還沒決定」。',
  '潛在動搖票長條圖：長度是「該族群的未表態人數 ÷ 全體未表態人數」，也就是這群人貢獻了多少游離票。比例高代表即使這群人的未表態比例不是最高，只要人數多，就會是決定勝負的關鍵。',
  '趨勢圖：TVBS 歷次民調中，20–29 歲與 30–39 歲對各候選人的支持度變化，可看出年輕選民意向波動很大。',
  '「＊」標記表示該列樣本數少於 50，僅供參考。'
]
const caution = [
  '三張交叉分析圖都來自同一份民調（台灣民意基金會，11/5–7，n=1,069）。它的整體未表態比例是 21.1%，與後來封關時的民調不同；趨勢圖才是跨時間的資料。',
  '分組後樣本會變很少（例如 20–24 歲只有 63 人、時代力量支持者只有 32 人），誤差遠大於全體的 ±3 點，看到 65.6% 這類極端數字時要特別保守。',
  '「未表態」包含「還不能決定」與「不知道」，不等於一定會變心：有些人最後可能不去投票，或投給原本傾向的人。這裡只能說他們「尚未決定」，不能預測流向。',
  '趨勢圖來自新聞報導整理，只列出有報導數字的時點（10/2 的 20–29 歲蔣、陳，以及 8/29 的 30–39 歲陳時中，報導中沒有數字，圖上留空）；各期 20–29 歲子樣本很小，週與週之間大幅擺盪有一部分可能只是抽樣誤差。',
  '不同機構對同一年齡層的結果差很多：30–39 歲對黃珊珊的支持度，TVBS 封關民調約 31%，自由時報封關前民調約 44%。這代表「年輕族群動向」的測量本身就不穩定。',
  '黃珊珊在民調中的支持度，高於最終開票的 25.1%；這可能和年輕選民投票率、策略投票等因素有關，但本頁資料無法驗證，請視為待檢驗的假設而不是結論。'
]
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
      <h2>百分比堆疊長條圖：各族群的支持比例結構</h2>
      <div class="tabs"><button v-for="d in DIMS" :key="d.key" :class="{ on: dimKey === d.key }" @click="dimKey = d.key">{{ d.label }}</button></div>
      <Stacked100 :rows="dim.rows" />
    </section>

    <section class="card">
      <h2>潛在動搖票定位：誰貢獻了最多的未表態者？</h2>
      <p class="sub">目前分類：{{ dim.label }}（可用上方「百分比堆疊長條圖」的分頁切換）。長度＝佔全體未表態者的比例。</p>
      <SwingBars :rows="swingRows" />
    </section>

    <section class="card">
      <h2>熱力圖：族群 × 候選人支持度</h2>
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

    <MemoBox :how="how" :caution="caution" v-if="isDev" />
  </div>
</template>
