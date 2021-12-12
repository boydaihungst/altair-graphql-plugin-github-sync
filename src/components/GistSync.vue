<script lang="ts">
import Vue, { PropType } from 'vue';
import VueSvg from 'vue-inline-svg';
import { AltairContext } from '../@types/altair';
import {
  STORE_KEY_API_KEY,
  STORE_KEY_GIST_ID,
  SyncProviders,
} from '../constant/gist-provider.enum';
import SyncProviderFactory from '../providers/SyncProviderFactory';
import GitHubService from '../services/github';

export interface ISelectOption {
  label: string;
  value: string | null;
}

const PULL_BTN_DEFAULT = 'Download';
const PUSH_BTN_DEFAULT = 'Upload';

export default Vue.extend({
  name: 'GistSync',
  components: { VueSvg },
  props: {
    context: {
      type: Object as PropType<AltairContext>,
      required: true,
    },
  },
  data() {
    return {
      apiKey: localStorage.getItem(STORE_KEY_API_KEY) || '',
      gistKey: localStorage.getItem(STORE_KEY_GIST_ID) || '',
      gistOptions: [] as ISelectOption[],
      provider: SyncProviders.GitHub,
      listProviders: SyncProviders,
      isFetchingGist: false,
      isPulling: false,
      isPushing: false,
      modelText: '',
      gitHubService: (null as unknown) as GitHubService,
      pullBtn: PULL_BTN_DEFAULT,
      pushBtn: PUSH_BTN_DEFAULT,
    };
  },
  watch: {
    async apiKey(newValue: string, oldValue) {
      localStorage.setItem(STORE_KEY_API_KEY, newValue || '');
      this.gitHubService.updateAuthToken(newValue);
      await this.loadGists();
    },
    gistKey(newValue, oldValue) {
      localStorage.setItem(STORE_KEY_GIST_ID, newValue || '');
    },
    gistOptions(newValue: ISelectOption[], oldValue) {
      if (newValue.every(gist => gist.value !== this.gistKey)) {
        this.gistKey = '';
      }
    },
  },
  methods: {
    async loadGists() {
      try {
        this.isFetchingGist = true;
        if (!this.apiKey) {
          this.gistOptions = [];
          return;
        }
        const gists = await this.gitHubService.getGists();
        this.gistOptions = gists.map(gist => ({
          label: `${gist.description} (ID: ${gist.id})`,
          value: gist.id,
        }));
      } catch (error) {
        this.gistOptions = [];
      } finally {
        this.isFetchingGist = false;
      }
    },

    valid() {
      if (!this.apiKey) {
        this.modelText = `API Key not provided!`;
        return false;
      }
      return true;
    },
    async onPush() {
      try {
        if (this.valid()) {
          this.isPushing = true;
          const factory = new SyncProviderFactory(this.context);
          const provider = factory.getProvider(this.provider);
          await provider.send();
          this.modelText = `Upload successful!`;
        }
      } catch (err) {
        this.modelText = err.message;
      } finally {
        this.isPushing = false;
      }
    },
    async onPull() {
      try {
        if (this.valid()) {
          this.isPulling = true;
          const factory = new SyncProviderFactory(this.context);
          const provider = factory.getProvider(this.provider);
          await provider.receive();
          this.modelText = `Download successful! Press F5 to refresh!`;
        }
      } catch (err) {
        this.modelText = err.message;
      } finally {
        this.isPulling = false;
      }
    },
  },
  async mounted() {
    this.gitHubService = new GitHubService(this.apiKey);
    if (this.apiKey) await this.loadGists();
    this.$nextTick(() => {
      // this.props.ctx.on('app-ready', () => console.log('BIRDSEYE app-ready'));
    });
  },
});
</script>
<template>
  <div class="gist-sync">
    <div class="gist-sync__provider">
      <label for="gistProvider">Gist Provider</label>
      <select id="gistProvider" v-model="provider">
        <option v-for="value in listProviders" :key="value" :value="value">
          {{ value[0].toUpperCase() + value.slice(1) }}
        </option>
      </select>
    </div>
    <div class="gist-sync__api-key">
      <label for="gistApiKey"
        >Gist API Key
        <a href="https://github.com/settings/tokens" class="tooltip">
          <span class="tooltip__label">?</span>
          <span class="tooltiptext"
            >Get API Key from here https://github.com/settings/tokens</span
          >
        </a></label
      >
      <input id="gistApiKey" v-model.lazy="apiKey" placeholder="" />
    </div>
    <div class="gist-sync__gist-key">
      <label for="gistKey">Gist </label>
      <select id="gistKey" v-model="gistKey" :disabled="isFetchingGist">
        <option :value="null">
          Create new...
        </option>
        <option
          v-for="item in gistOptions"
          :key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </option>
      </select>
    </div>
    <div class="gist-sync__actionBtns">
      <button
        class="gist-sync__downloadBtn"
        :disabled="isFetchingGist"
        @click="onPull()"
      >
        <span
          :class="['gist-sync__downloadBtnIcon', isPulling ? 'spinning' : '']"
        >
          <VueSvg
            :src="
              isPulling
                ? require('../assets/sync-solid.svg')
                : require('../assets/cloud-download-alt-solid.svg')
            "
          />
        </span>
        {{ pullBtn }}
      </button>
      <button
        class="gist-sync__uploadBtn"
        :disabled="isFetchingGist"
        @click="onPush"
      >
        <span
          :class="['gist-sync__uploadBtnIcon', isPushing ? 'spinning' : '']"
        >
          <VueSvg
            :src="
              isPushing
                ? require('../assets/sync-solid.svg')
                : require('../assets/cloud-upload-alt-solid.svg')
            "
        /></span>
        {{ pushBtn }}
      </button>
    </div>
    <div v-show="!!modelText" class="modal">
      <!-- Modal content -->
      <div class="modal-content">
        <div class="modal-header">
          <span class="close" @click="modelText = ''">&times;</span>
        </div>
        <div class="modal-body">
          <p>{{ modelText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
