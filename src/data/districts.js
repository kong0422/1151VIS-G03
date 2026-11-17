import { KEYS } from './polls'

// 2022 台北市長選舉：12 行政區
// votes：實際得票數 [蔣萬安, 陳時中, 黃珊珊]（ETtoday 2022 九合一選舉專區，中選會資料）
// poll：台灣民意基金會 11/5–7 民調各區結果 [陳時中, 蔣萬安, 黃珊珊, 還不能決定, 不知道]（%），n＝該區樣本數
//   來源：TPOF 2022-11-10 記者會書面資料（交叉表「行政區」）
// col/row：示意方塊圖位置（大致依地理方位排列，非真實邊界）
const RAW = [
  { name: '北投區', col: 1, row: 0, votes: [51433, 46309, 33492], poll: [19.2, 23.1, 30.5, 17.0, 10.2], n: 106 },
  { name: '士林區', col: 2, row: 0, votes: [55874, 55435, 35999], poll: [24.0, 30.8, 23.9, 11.2, 10.1], n: 116 },
  { name: '內湖區', col: 3, row: 0, votes: [60842, 42726, 44466], poll: [24.5, 26.1, 32.6, 3.2, 13.5], n: 116 },
  { name: '大同區', col: 1, row: 1, votes: [21700, 26530, 17263], poll: [22.7, 24.2, 16.9, 16.2, 20.0], n: 52 },
  { name: '中山區', col: 2, row: 1, votes: [50224, 40233, 26244], poll: [25.2, 36.8, 11.3, 19.9, 6.8], n: 91 },
  { name: '松山區', col: 3, row: 1, votes: [47295, 32098, 23938], poll: [23.4, 38.0, 22.5, 1.8, 14.3], n: 78 },
  { name: '南港區', col: 4, row: 1, votes: [25261, 18716, 18246], poll: [20.1, 24.9, 23.7, 30.2, 1.2], n: 51 },
  { name: '萬華區', col: 1, row: 2, votes: [39140, 33214, 24849], poll: [26.2, 41.7, 19.8, 8.3, 4.0], n: 76 },
  { name: '中正區', col: 2, row: 2, votes: [33503, 23459, 19746], poll: [25.5, 25.7, 33.6, 15.2, 0.0], n: 59 },
  { name: '大安區', col: 3, row: 2, votes: [69266, 44992, 34803], poll: [25.1, 29.2, 35.9, 3.1, 6.7], n: 114 },
  { name: '信義區', col: 4, row: 2, votes: [52032, 34433, 27202], poll: [15.9, 28.7, 34.5, 6.7, 14.3], n: 91 },
  { name: '文山區', col: 3, row: 3, votes: [69020, 36413, 35893], poll: [13.9, 30.6, 28.0, 21.4, 6.0], n: 111 }
]

const lead = o => [...KEYS].sort((a, b) => o[b] - o[a])

export const DISTRICTS = RAW.map(d => {
  const total = d.votes.reduce((a, b) => a + b, 0)
  const share = {}, votes = {}
  KEYS.forEach((k, i) => { votes[k] = d.votes[i]; share[k] = (d.votes[i] / total) * 100 })
  // 民調：換算成蔣陳黃三人合計 100%，才能和開票得票率比較
  const raw = { chen: d.poll[0], chiang: d.poll[1], huang: d.poll[2] }
  const sum3 = raw.chen + raw.chiang + raw.huang
  const pollShare = {}
  KEYS.forEach(k => { pollShare[k] = (raw[k] / sum3) * 100 })
  const sa = lead(share), sp = lead(pollShare)
  return {
    name: d.name, col: d.col, row: d.row, votes, share, n: d.n,
    leader: sa[0], margin: share[sa[0]] - share[sa[1]],
    pollRaw: raw, pollShare, pollLeader: sp[0], pollUnd: d.poll[3] + d.poll[4],
    moe: 1.96 * Math.sqrt(0.25 / d.n) * 100   // 95% 信賴區間（p=0.5 的保守估計）
  }
})
