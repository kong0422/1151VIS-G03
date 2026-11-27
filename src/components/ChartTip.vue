<script setup>
defineProps({ tip: { type: Object, default: null } })
</script>

<template>
  <div v-if="tip" class="chart-tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }" role="tooltip">
    <b>{{ tip.data.title }}</b>
    <div v-if="tip.data.sub" class="muted">{{ tip.data.sub }}</div>
    <table v-if="tip.data.rows && tip.data.rows.length">
      <tbody>
        <tr v-for="r in tip.data.rows" :key="r.label" :class="{ on: r.bold }">
          <td><i v-if="r.color" :style="{ background: r.color }"></i>{{ r.label }}</td>
          <td class="v">{{ r.value }}</td>
          <td class="e">{{ r.extra }}</td>
        </tr>
      </tbody>
    </table>
    <div v-for="(n, i) in tip.data.notes" :key="i" class="n">{{ n }}</div>
  </div>
</template>
