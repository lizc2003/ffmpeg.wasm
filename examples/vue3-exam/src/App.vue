<template>
  <div id="app">
    <AudioConverter />
  </div>
</template>

<script setup>
import AudioConverter from './components/AudioConverter.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7fa;
  color: #333;
  line-height: 1.6;
  padding: 20px;
}

#app {
  min-height: 100vh;
}
</style>
