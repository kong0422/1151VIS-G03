# 民調預測準確度與「封關落差」分析— 2022 台北市長（Vue 3 + D3.js）

## 執行
```bash
npm install
npm run dev      # 開發
npm run build    # 打包到 dist/
```

## 結構
- `src/data/polls.js`：民調與實際開票資料（換資料或選舉只需改這裡）
- `src/utils/stats.js`：誤差、MAE、賴侯差距誤差計算
- `src/components/DotChart.vue`：誤差散佈圖
- `src/components/BarChart.vue`：分組長條圖
- `src/App.vue`：header（分頁連結）／main／footer 外框
- `src/views/`：三個分頁（PollAccuracyView、DistrictView、VoterView）
- `src/router/index.js`：路由與分頁清單

實際得票率請自行對照中選會公布數字確認。

## 資料來源
- 壹蘋新聞網〈5家封關民調懶人包〉https://news.nextapple.com/politics/20221115/2A94B130DB673BE498D5ECCCC449BDFA
- 中時新聞網〈各家封關民調一次看〉https://www.chinatimes.com/realtimenews/20221115002747-260407
- TVBS 封關民調 https://news.tvbs.com.tw/politics/1963187
- 實際得票率：今周刊 https://www.businesstoday.com.tw/article/category/80392/post/202211300054/

## 第 2 頁：行政區面量圖
- 預設以示意方塊圖呈現；若要畫真實行政區邊界，把台北市行政區 GeoJSON 放到 `public/data/taipei-districts.geojson`
  （屬性需含行政區名稱，欄位 `TOWNNAME`、`T_Name`、`name` 之一），頁面會自動改畫真實邊界。
- 各區實際得票：ETtoday 2022 九合一選舉專區 https://media.ettoday.net/events/election2022/mayor
- 各區民調：台灣民意基金會 2022-11-10 記者會書面資料（交叉表含行政區、年齡、性別、教育、政黨）
  https://www.tpof.org/wp-content/uploads/2022/11/20221110-TPOF-%E8%A8%98%E8%80%85%E6%9C%83%E6%9B%B8%E9%9D%A2%E8%B3%87%E6%96%99.pdf

## 第 3 頁：選民結構交叉分析
- `src/data/voters.js`：TPOF 交叉表（性別／年齡／教育／政黨）與 TVBS 年齡層趨勢
- 元件：`Stacked100.vue`（100% 堆疊）、`Heatmap.vue`（熱力圖）、`SwingBars.vue`（潛在動搖票）、`TrendLines.vue`（趨勢）
- 每頁最下方的「備忘區」由 `MemoBox.vue` 產生，內容寫在各 view 的 `how`／`caution` 陣列
