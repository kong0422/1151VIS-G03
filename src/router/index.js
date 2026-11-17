import { createRouter, createWebHashHistory } from 'vue-router'
import PollAccuracyView from '../views/PollAccuracyView.vue'
import DistrictView from '../views/DistrictView.vue'
import VoterView from '../views/VoterView.vue'

export const pages = [
  { path: '/', name: 'poll', label: '民調預測準確度與「封關落差」分析', component: PollAccuracyView },
  { path: '/district', name: 'district', label: '行政區選票基本盤與民調空間分異的對比', component: DistrictView },
  { path: '/voters', name: 'voters', label: '選民結構交叉分析與「潛在動搖票」定位', component: VoterView }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: pages.map(({ path, name, component }) => ({ path, name, component }))
})

router.afterEach(to => {
  const page = pages.find(p => p.name === to.name)
  if (page) document.title = page.label
})

export default router
