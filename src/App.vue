<template>
  <div id="app">
    <GistSync :context="context" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import GistSync from './components/GistSync.vue';
import { AltairContext } from './@types/altair';

export default defineComponent({
  name: 'App',
  components: {
    GistSync,
  },
  props: {
    context: {
      type: Object as PropType<AltairContext>,
      default: null
    },
  },
  // async mounted() {
  //   await import('./components/GistSync.vue');
  // },
});
</script>

<style lang="scss">
@tailwind base;
@tailwind components;
@tailwind utilities;
@layer utilities {
  .bg-theme {
    background-color: var(--theme-bg-color);
  }
  .text-theme {
    color: var(--theme-font-color);
  }
  .text-indigo-500 {
    color: var(--primary-color);
  }
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
