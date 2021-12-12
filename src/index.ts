import { AltairPanelLocation } from 'altair-graphql-core/build/plugin/panel';
import { PluginBase } from 'altair-graphql-core/build/plugin/base';
import GistSync from './components/GistSync.vue';
import { AltairContext } from '@/@types/altair';
import { StorageService } from '@/providers/StorageService';

// https://altair.sirmuel.design/docs/plugins/writing-plugin.html
class AltairGistSync extends PluginBase {
  initialize(ctx: AltairContext) {
    ctx.events.on('app-ready', () => {
      ctx.db = new StorageService();
      const div = document.createElement('div');
      const gistSyncComp = new GistSync({
        propsData: {
          context: ctx,
        },
      }).$mount();

      ctx.app.createPanel(div, {
        location: AltairPanelLocation.SIDEBAR,
        title: 'Gist sync',
      });

      // for some reason, specidying the div in $mount didnt work, so using DOM APIs instead
      div.appendChild(gistSyncComp.$el);
    });
  }

  destroy() {}
}

(window as any)['AltairGraphQL'].plugins['AltairGistSync'] = AltairGistSync;
