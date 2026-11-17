<script setup>
defineProps({ how: { type: Array, default: () => [] }, caution: { type: Array, default: () => [] } })
</script>

<template>
  <aside class="memo">
    <h2>📝 備忘區</h2>
    <h3>圖表怎麼看</h3>
    <ul><li v-for="(t, i) in how" :key="'h' + i">{{ t }}</li></ul>
    <h3>注意事項</h3>
    <ul><li v-for="(t, i) in caution" :key="'c' + i">{{ t }}</li></ul>
  </aside>
</template>
