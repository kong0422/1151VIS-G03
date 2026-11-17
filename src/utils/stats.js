import { mean } from 'd3'
import { KEYS, ACTUAL, POLLS, MARGIN } from '../data/polls'

export const fmt = v => (v > 0 ? '+' : '') + v.toFixed(2)
export const signClass = v => (v > 0 ? 'pos' : 'neg')
export const actualMargin = ACTUAL[MARGIN[0]] - ACTUAL[MARGIN[1]]

/** mode: 'norm'（排除未表態，三人合計 100%）｜'raw'（原始數字） */
export function buildRows(mode) {
  return POLLS.map(p => {
    const sum = KEYS.reduce((s, k) => s + p[k], 0)
    const v = {}, err = {}
    KEYS.forEach(k => {
      v[k] = mode === 'norm' ? (p[k] / sum) * 100 : p[k]
      err[k] = v[k] - ACTUAL[k]
    })
    return {
      ...p, v, err,
      mae: mean(KEYS, k => Math.abs(err[k])),
      marginErr: v[MARGIN[0]] - v[MARGIN[1]] - actualMargin,
      undecided: 100 - sum
    }
  })
}
