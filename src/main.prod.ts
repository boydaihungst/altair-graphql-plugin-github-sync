import { PluginBase } from 'altair-graphql-core/build/plugin/base';
import { AltairPanelLocation } from 'altair-graphql-core/build/plugin/panel';
import 'tailwindcss/tailwind.css';
import { createApp } from 'vue';
import { AltairContext } from './@types/altair';
import App from './App.vue';
import GistSync from './components/GistSync.vue';
import { StorageService } from './providers/StorageService';

createApp(App).mount('#app');

// https://altair.sirmuel.design/docs/plugins/writing-plugin.html
class AltairGistSync extends PluginBase {
  initialize(ctx: AltairContext) {
    ctx.events.on('app-ready', () => {
      ctx.db = new StorageService();
      const div = document.createElement('div');
      div.id = 'app';
      createApp(GistSync, {
        context: ctx,
      }).mount(div);

      ctx.app.createPanel(div, {
        location: AltairPanelLocation.SIDEBAR,
        title: 'Gist sync',
      });
    });
  }

  destroy() {
    //
  }
}
if ((window as any)['AltairGraphQL'])
  (window as any)['AltairGraphQL'].plugins['AltairGistSync'] = AltairGistSync;
