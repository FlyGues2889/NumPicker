<template>
  <div id="app">
    <RandomPicker />
  </div>
</template>

<script setup>
import RandomPicker from './components/RandomPicker.vue'
import 'mdui/mdui.css';
import 'mdui';

import { setColorScheme } from 'mdui/functions/setColorScheme.js';

setColorScheme('#174CA1');
</script>

<style>
html,
body {
  padding: 0 !important;
  overscroll-behavior: none;

  background-color: rgba(var(--mdui-color-primary-container), 0.3) !important;
}

* {
  margin: 0;
  padding: 0;

  box-sizing: border-box;

  font-family: 'Harmony Sans SC M', sans-serif;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--mdui-color-secondary), 0.15) #00000000;

  overscroll-behavior: none;
}

mdui-snackbar {
  padding: 0.1rem;
  border-radius: var(--mdui-shape-corner-medium) !important;
}
</style>