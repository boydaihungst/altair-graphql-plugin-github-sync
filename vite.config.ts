import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import svgPlugin from 'vite-svg-loader';
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue(), svgPlugin()],
  css: {
    preprocessorOptions: {
      scss:
        mode === 'development'
          ? {
              // Default variables from altair
              additionalData: `
              :root{
                --theme-bg-color: #33363b;
                --theme-font-color: #ffffff;
                --theme-border-color: #ffffff;
                --primary-color: #7ebc59;
                --secondary-color: #368cbf;
              }
              `,
            }
          : {},
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      name: 'github-sync',
      fileName: format => `github-sync.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      // external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          // vue: 'Vue'
        },
      },
    },
  },
}));
