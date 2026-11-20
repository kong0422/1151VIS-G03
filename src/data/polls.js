// ===== 2022 台北市長選舉 =====
// 顏色：國民黨＝藍（--c1）、民進黨＝綠（--c2）、無黨籍＝黃（--c3），定義在 style.css
// 要換成其他選舉，只需改這個檔案（KEYS、CAND、ACTUAL、MARGIN、POLLS、META）

export const KEYS = ['chiang', 'chen', 'huang']

export const CAND = {
  chiang: { name: '蔣萬安（國民黨）', short: '蔣', color: 'var(--c1)' },
  chen:   { name: '陳時中（民進黨）', short: '陳', color: 'var(--c2)' },
  huang:  { name: '黃珊珊（無黨籍）', short: '黃', color: 'var(--c3)' }
}

// 實際開票結果（中選會）：蔣 575,590 票、陳 434,558 票、黃 342,141 票
// 三人合計 99.36%，其餘 0.64% 為其他候選人
export const ACTUAL = { chiang: 42.29, chen: 31.93, huang: 25.14 }

// 差距指標：第一個減第二個（以實際得票前兩名為準）
export const MARGIN = ['chiang', 'chen']

// 封關（11/16 0 時起不得公布民調）前各家最後一次公布的民調，共 7 家
// 來源：壹蘋新聞網〈5家封關民調懶人包〉（5 家）、中時新聞網〈各家封關民調一次看〉（三立）、TVBS 封關民調
export const POLLS = [
  { name: '台灣民意基金會', short: '民意基金會', field: '11/10 公布', chiang: 29.8,  chen: 21.8,  huang: 26.6 },
  { name: '中廣蓋洛普',     short: '蓋洛普',     field: '11/14 公布', chiang: 34.25, chen: 22.79, huang: 15.6 },
  { name: '聯合報',         short: '聯合報',     field: '11/11–13',   chiang: 36,    chen: 20,    huang: 27 },
  { name: 'TVBS',           short: 'TVBS',       field: '11/15 公布', chiang: 36,    chen: 25,    huang: 24 },
  { name: '自由時報',       short: '自由時報',   field: '11/14 公布', chiang: 28.71, chen: 34.8,  huang: 23.45 },
  { name: 'CNEWS 匯流',     short: '匯流',       field: '11/13 公布', chiang: 30.6,  chen: 26.8,  huang: 27 },
  { name: '三立新聞',       short: '三立',       field: '11/14 公布', chiang: 29.5,  chen: 32,    huang: 17.6 }
]

export const META = {
  title: '民調預測準確度與「封關落差」分析',
  subtitle: '2022 台北市長選舉｜比較封關前各家最後一次公布的民調與實際開票結果',
  marginLabel: '蔣陳差距誤差'
}
