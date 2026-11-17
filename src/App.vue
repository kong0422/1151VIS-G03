<script setup>
import { pages } from './router'
</script>

<template>
  <header class="site-header">
    <nav aria-label="分頁">
      <router-link v-for="p in pages" :key="p.name" :to="p.path">{{ p.label }}</router-link>
    </nav>
  </header>

  <main>
    <router-view />
  </main>

  <footer class="site-footer">1151VIS-G03</footer>
</template>
