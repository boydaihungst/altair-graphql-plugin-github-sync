<template>
  <div id="app">
    <GistSync :props="{}" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import GistSync from './components/GistSync.vue';

export default Vue.extend({
  name: 'app',
  components: {
    GistSync,
  },
  async mounted() {
    await import('./components/GistSync.vue');
  },
});
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
